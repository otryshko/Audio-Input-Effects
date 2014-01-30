var mp3codec;
importScripts('libmp3lame.js');
this.onmessage = function (e) {
    switch (e.data.command) {
        case 'encode':
            encode(e.data.bufferL, e.data.bufferR, e.data.id);
            break;
        case 'init':
            init();
            break;
    }
};

function init() {
    mp3codec = Lame.init();
    Lame.set_mode(mp3codec, Lame.JOINT_STEREO);
    Lame.set_num_channels(mp3codec, 2);
    Lame.set_in_samplerate(mp3codec, 48000);
    Lame.set_out_samplerate(mp3codec, 48000);
    Lame.set_bitrate(mp3codec, 128);
    Lame.init_params(mp3codec);
}
function encode(bufferL, bufferR, id) {

    var mp3data = Lame.encode_buffer_ieee_float(mp3codec, bufferL, bufferR);
    this.postMessage({ buffer: mp3data, id: id });
}



