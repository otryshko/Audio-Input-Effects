<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="AudioTestHost.Default" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>AudioTestHost</title>
    <script src="res/jquery-1.8.2.min.js"></script>
    
    <!-- extra audio scritps -->
    <script src="audioContent/visualizer/AudioContextMonkeyPatch.js"></script>
    <script src="audioContent/recorderjs/recorder.js"></script>
    <script src="audioContent/visualizer/effects.js"></script>
	<script src="audioContent/visualizer/events.js"></script>
	<script src="audioContent/visualizer/base.js"></script>
	<script src="audioContent/visualizer/visualizer.js"></script>
	<script src="audioContent/visualizer/shader.js"></script>
    <!--<script src="audioContent/recorderjs/libmp3lame.js"></script>-->
    
    <!-- speex -->

    <script src="audioContent/speex/pcmdata.min.js"></script>
    <script src="audioContent/speex/bitstring.js"></script>
    <script src="audioContent/speex/speex.js"></script>
    <script src="audioContent/speex/audio.js"></script>

    <script src="res/Default.js"></script>
    <script>$(DefaultClient_Load);</script>
</head>
<body>
    <canvas id="view1" width="750" height="200"></canvas><br/>
    <script>
        var lastWavAudio, lastMp3Audio, lastMp3Audio1, lastMp3Audio2, lastOggAudio;
        var recBuffer = [], recBuffer1 = [], recBuffer2 = [];
        var mp3Length = 0, mp3Length1 = 0, mp3Length2 = 0, wavSize = 0, wavSize2 = 0, mp3size = 0;
        window.audioService = new AudioTestHost.AudioService();
        window.audioService.VisualizeTo($("#view1"));
        /*
        var requestCounter2 = 0;
        var responseCounter2 = 0;
        var encoderWorker2 = new Worker('audioContent/recorderjs/encoderWorker.js');

        encoderWorker2.postMessage({
            command: 'init'
        });

        encoderWorker2.onmessage = function(e) {
            recBuffer2.push(e);
            mp3Length2 += e.data.buffer.size;
            responseCounter2++;
            if (requestCounter2 == responseCounter2) {
                console.log("finalize2 " + requestCounter2);

                var result2 = new Uint8Array(mp3Length2);
                var offset2 = 0;
                for (var i = 0; i < recBuffer2.length; i++) {
                    result2.set(recBuffer2[i].data.buffer.data, offset2);
                    offset2 += recBuffer2[i].data.buffer.data.length;
                }

                console.log("2: wavsize: " + wavSize2 + " mp3size:" + mp3Length2 + " ratio:" + mp3Length2 / wavSize2);

                var ab2 = result2.buffer;
                var mp3blob2 = new Blob([ab2]);

                var mp3Url2 = URL.createObjectURL(mp3blob2);
                console.log("2: mp3Url: " + mp3Url2);
                lastMp3Audio2 = $("<video/>");
                lastMp3Audio2.attr("type", "audio/mp3");
                lastMp3Audio2.attr("src", mp3Url2);
                $(document).append(lastMp3Audio2);

            }
        };


        window.onAudioProcessCallback = function (leftBuffer, rightBuffer) {
            encoderWorker2.postMessage({
                command: 'encode',
                bufferL: leftBuffer,
                bufferR: rightBuffer,
                id: requestCounter2
            });
            requestCounter2++;
            wavSize2 += leftBuffer.length + rightBuffer.length;
        };*/
        function onNewAudioBlob(newBlob) {
            var nb = newBlob;
            console.log("wav blob size:" + newBlob.size);
            var audioUrl = URL.createObjectURL(newBlob);
            lastWavAudio = $("<video/>");
            lastWavAudio.attr("type",  "audio/wav");
            lastWavAudio.attr("src", audioUrl);
            $(document).append(lastWavAudio);
            

            var arrayBuffer;
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                //arrayBuffer = this.result;
                //wavSize = arrayBuffer.byteLength;
                
                // speex starts
                var samples = Speex.encodeFile(this.result);
                console.log("ogg blob size:" + samples.length);

                addDownloadLink("zzz.ogg", "#file_wav",
    samples, "audio/ogg");

                /*var oggBlob = bytestoBlob(samples);
                var oggUrl = URL.createObjectURL(oggBlob);
                lastOggAudio = $("<video/>");
                lastOggAudio.attr("type", "audio/ogg");
                lastOggAudio.attr("src", oggUrl);
                $(document).append(lastOggAudio);
                console.log("ogg ready");*/
                return;
                var ctx = new AudioContext();
                ctx.decodeAudioData(arrayBuffer, function(buffer) {
                    mp3codec = Lame.init();
                    Lame.set_mode(mp3codec, Lame.JOINT_STEREO);
                    Lame.set_num_channels(mp3codec, buffer.numberOfChannels);
                    Lame.set_in_samplerate(mp3codec, buffer.sampleRate);
                    Lame.set_out_samplerate(mp3codec, buffer.sampleRate);
                    Lame.set_bitrate(mp3codec, 128);
                    Lame.init_params(mp3codec);

                    
                    b0 = buffer.getChannelData(0);
                    b1 = buffer.getChannelData(1);

                    var requestCounter = 0;
                    var responseCounter = 0;
                    
                    var encoderWorker = new Worker('audioContent/recorderjs/encoderWorker.js');

                    encoderWorker.postMessage({
                        command: 'init'
                    });
                    

                    encoderWorker.onmessage = function (e) {
                        recBuffer1.push(e);
                        mp3Length1 += e.data.buffer.size;
                        responseCounter++;
                        if (requestCounter == responseCounter) {
                            console.log("finalize1 " + requestCounter);
                            
                            var result1 = new Uint8Array(mp3Length1);
                            var offset1 = 0;
                            for (var i = 0; i < recBuffer1.length; i++) {
                                result1.set(recBuffer1[i].data.buffer.data, offset1);
                                offset1 += recBuffer1[i].data.buffer.data.length;
                            }

                            console.log("wavsize: " + wavSize + " mp3size:" + mp3Length1 + " ratio:" + mp3Length1 / wavSize);

                            var ab1 = result1.buffer;
                            var mp3blob1 = new Blob([ab1]);

                            var mp3Url1 = URL.createObjectURL(mp3blob1);
                            console.log("1: mp3Url: " + mp3Url1);

                            lastMp3Audio1 = $("<video/>");
                            lastMp3Audio1.attr("type", "audio/mp3");
                            lastMp3Audio1.attr("src", mp3Url1);
                            $(document).append(lastMp3Audio1);

                        }
                    }

                    var len = 15000;
                    for (i = 0; i < b0.length; i += len) {
                        j = i + len < b0.length - 1 ? i + len : b0.length - 1;
                        

                        var mp3data = Lame.encode_buffer_ieee_float(mp3codec, b0.subarray(i, j), b1.subarray(i, j));

                        encoderWorker.postMessage({
                            command: 'encode',
                            bufferL: b0.subarray(i, j),
                            bufferR: b1.subarray(i, j),
                            id: requestCounter
                        });
                        requestCounter++;
                        
                        recBuffer.push(mp3data.data);
                        mp3Length += mp3data.data.length;
                        //mp3Length += mp3data.nread;

                        //var encodedString = String.fromCharCode.apply(null, mp3data.data);
                        // encodedString  can be written down to an MP3 file
                    }
                    var result = new Uint8Array(mp3Length);
                    var offset = 0;
                    for (var i = 0; i < recBuffer.length; i++) {
                        result.set(recBuffer[i], offset);
                        offset += recBuffer[i].length;
                    }

                    console.log("wavsize: " + wavSize + " mp3size:" + mp3Length + " ratio:" + mp3Length / wavSize);

                    var ab = result.buffer;
                    var mp3blob = new Blob([ab]);
                    
                    var mp3Url = URL.createObjectURL(mp3blob);
                    lastMp3Audio = $("<video/>");
                    lastMp3Audio.attr("type", "audio/mp3");
                    lastMp3Audio.attr("src", mp3Url);
                    $(document).append(lastMp3Audio);

                    

                    //var mp3data = Lame.encode_buffer_ieee_float(mp3codec, window.audioBffers[0], window.audioBffers[1]);
                    

                    
                });


            };
            fileReader.readAsArrayBuffer(newBlob);

        }
        function compare() {
            var encodedString = String.fromCharCode.apply(null, mp3data.data);
        }
        
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        }
        function bytestoBlob(byteCharacters, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        }
        
        function handleFileSelect(evt, isTypedArray) {
            var file = evt.target.files[0];
            Speex.readFile(evt, function (e) {
                var tks = file.name.split(".");
                var filename = tks[0]
                  , ext = tks[1];
                var samples, sampleRate;

                if (ext === "ogg") {
                    var data = e.target.result,
                        ret, header;
                    ret = Speex.decodeFile(data);
                    samples = ret[0];
                    header = ret[1];
                    sampleRate = header.rate;
                    addDownloadLink(filename + ".wav", "#file_ogg",
                        samples, "audio/wav");


                    Speex.util.play(samples, sampleRate);
                } else if (ext == "wav") {
                    var data = e.target.result;
                    samples = Speex.encodeFile(data);
                    addDownloadLink(filename + ".ogg", "#file_wav",
                        samples, "audio/ogg");

                }
            }, isTypedArray);
        }
        function addDownloadLink(filename, sel, data, mimetype) {
            var url = "data:" + mimetype + ";base64," + btoa(data);
            var container = document.querySelector(sel).parentElement;
            var anchor = "<br/><a download=\"" + filename + "\" href=\"" +
                url + "\">" + filename + " (" + data.length / 1024.0 + " Kbytes)</a>";

            container.innerHTML += anchor;
            
            var byteNumbers = new Array(data.length);
            for (var i = 0; i < data.length; i++) {
                byteNumbers[i] = data.charCodeAt(i);
            }
            
            var byteArray = new Uint8Array(byteNumbers);
            var oggBlob = new Blob([byteArray], { type: 'audio/ogg' });

            var oggUrl = URL.createObjectURL(oggBlob);
            lastOggAudio = $("<audio/>");
            lastOggAudio.attr("type", "audio/ogg");
            lastOggAudio.attr("src", url);
            $(document).append(lastOggAudio);

        }

        $(function () {
            document.getElementById('file_wav').addEventListener('change', function (evt) {
                handleFileSelect(evt, true);
            }, false);

        });


    </script>
    <button onclick="window.audioService.Start();">Start</button>
    <button onclick="window.audioService.Stop();">Stop</button>
    <button onclick="window.audioService.ExportToWAV(onNewAudioBlob);">Export to WAV</button>
    <button onclick="lastWavAudio[0].play();">Play WAV</button>
    <button onclick="lastMp3Audio[0].play();">Play MP3</button>
    <button onclick="lastMp3Audio1[0].play();">Play MP3 1</button>
    <button onclick="lastMp3Audio2[0].play();">Play MP3 2</button>
    <button onclick="lastOggAudio[0].play();">Play Ogg</button>
	<input type="file" id="file_wav" name="file_wav" />
    <audio controls="controls" autobuffer="autobuffer" autoplay="autoplay">
    <source type="audio/ogg" src="data:audio/ogg;base64,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" />
</audio>


</body>
</html>
