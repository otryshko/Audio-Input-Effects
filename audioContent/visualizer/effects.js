var audioContext;
var audioInput = null;
var rafID = null;
var analyser1;
var analyserView1;
var recorder;
var contentFolder = "";
var isWebGlDisabled = false;
var encoderWorker2;
var requestCounter2 = 0;
var responseCounter2 = 0;
var recBuffer2 = [];
var mp3Length2 = 0, wavSize2 = 0;
var mp3EncodedCallback;
var mp3Url2;
var mp3blob2 = null;
function convertToMono(input) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
}

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame(rafID);
    rafID = null;
}

function updateAnalysers(time) {
    analyserView1.doFrequencyAnalysis(analyser1);
    rafID = window.requestAnimationFrame(updateAnalysers);
}

var lpInputFilter = null;

// this is ONLY because we have massive feedback without filtering out
// the top end in live speaker scenarios.
function createLPInputFilter(output) {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    var input = audioContext.createMediaStreamSource(stream);
    recorder = new Recorder(input, { workerPath: contentFolder + "/recorderjs/recorderWorker.js", onAudioProcessCallback: onNewAudioData });
    recorder.record();

    audioInput = convertToMono(input);

    audioInput.connect(createLPInputFilter());
    audioInput = lpInputFilter;
    audioInput.connect(analyser1);
    updateAnalysers();
}

function initAudio(canvasElement, rootFolder, onGotStream, disableWebGl) {

    isWebGlDisabled = disableWebGl;

    var gl;
    try {
        gl = canvasElement.getContext("experimental-webgl");

    } catch (e) {
    }

    if (!gl) {
        isWebGlDisabled = true;
    }


    contentFolder = rootFolder || "audioContent";
    audioContext = new AudioContext();

    if (!isWebGlDisabled) {
        o3djs.require('o3djs.shader');

        analyserView1 = new AnalyserView(canvasElement, contentFolder);
        analyser1 = audioContext.createAnalyser();
        analyser1.fftSize = 1024;
        analyserView1.initByteBuffer(analyser1);
    }

    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (!navigator.getUserMedia)
        return (alert("Error: getUserMedia not supported!"));

    setupEncoding();

    navigator.getUserMedia({ audio: true }, function (blob) {
        if (onGotStream) {
            onGotStream();
        }
        gotStream(blob);
    }, function (e) {
        alert('Error getting audio');
        console.log(e);
    });
}
function setupEncoding() {

    encoderWorker2 = new Worker('audioContent/recorderjs/encoderWorker.js');

    encoderWorker2.postMessage({
        command: 'init'
    });

    encoderWorker2.onmessage = function (e) {
        recBuffer2.push(e);
        mp3Length2 += e.data.buffer.size;
        responseCounter2++;
        if (requestCounter2 > 0 && requestCounter2 == responseCounter2 && mp3EncodedCallback) {
            finalize();
        }
    };

}
function finalize() {
    console.log("finalize2 " + requestCounter2);

    var result2 = new Uint8Array(mp3Length2);
    var offset2 = 0;
    for (var i = 0; i < recBuffer2.length; i++) {
        result2.set(recBuffer2[i].data.buffer.data, offset2);
        offset2 += recBuffer2[i].data.buffer.data.length;
    }

    console.log("2: wavsize: " + wavSize2 + " mp3size:" + mp3Length2 + " ratio:" + mp3Length2 / wavSize2);

    var ab2 = result2.buffer;
    mp3blob2 = new Blob([ab2]);

    mp3Url2 = URL.createObjectURL(mp3blob2);
    console.log("2: mp3Url: " + mp3Url2);
    if (mp3EncodedCallback) {
        mp3EncodedCallback(mp3blob2);
    }
}

function exportMp3(mp3Encoded) {
    mp3EncodedCallback = mp3Encoded;
    if (requestCounter2 > 0 && requestCounter2 == responseCounter2) {
        finalize();
    }
}


function onNewAudioData (leftBuffer, rightBuffer) {
    encoderWorker2.postMessage({
        command: 'encode',
        bufferL: leftBuffer,
        bufferR: rightBuffer,
        id: requestCounter2
    });
    requestCounter2++;
    wavSize2 += leftBuffer.length + rightBuffer.length;
};




