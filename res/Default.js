/*Generated by SharpKit 5 v5.2.0*/
if (typeof ($CreateAnonymousDelegate) == 'undefined') {
    var $CreateAnonymousDelegate = function (target, func) {
        if (target == null || func == null)
            return func;
        var delegate = function () {
            return func.apply(target, arguments);
        };
        delegate.func = func;
        delegate.target = target;
        delegate.isDelegate = true;
        return delegate;
    }
}
if (typeof(AudioTestHost) == "undefined")
    var AudioTestHost = {};
AudioTestHost.AudioService = function (rootFolder)
{
    this.rootFolder = null;
    this.canvasElement = null;
    this.audioIsActive = false;
    this.disableWebGl = false;
    this.overlayPlayImage = null;
    this.overlayStopImage = null;
    this._OnAudioBlobReady = null;
    this.rootFolder = rootFolder;
    this.set_OnAudioBlobReady( []);
};
AudioTestHost.AudioService.prototype.get_OnAudioBlobReady = function ()
{
    return this._OnAudioBlobReady;
};
AudioTestHost.AudioService.prototype.set_OnAudioBlobReady = function (value)
{
    this._OnAudioBlobReady = value;
};
Object.defineProperty(AudioTestHost.AudioService.prototype, "OnAudioBlobReady", {get: AudioTestHost.AudioService.prototype.get_OnAudioBlobReady, set: AudioTestHost.AudioService.prototype.set_OnAudioBlobReady});
AudioTestHost.AudioService.prototype.VisualizeTo = function (jCanvas)
{
    this.canvasElement = jCanvas[0];
    window.setTimeout($CreateAnonymousDelegate(this, function ()
    {
        var gl = null;
         try{gl = this.canvasElement.getContext('experimental-webgl');} catch(e){};
        if (gl == null)
        {
            this.disableWebGl = true;
        }
        if (this.disableWebGl)
        {
            this.disableWebGl = true;
            this.overlayPlayImage = $("<img style=\'position: absolute; height:0px; top: 0px; width:275px; height:100px\' src=\'https://280318532cb01f796950-efc0b4a232f68bda8de29a521f985740.ssl.cf2.rackcdn.com/editor2_wave.gif\'/>").hide();
            this.overlayStopImage = $("<div style=\'position: absolute; width:275px; height:3px; top: 49px; left: 0px; background-color: rgb(78, 165, 255); \'></div></div>");
            this.overlayPlayImage.insertAfter(jCanvas);
            this.overlayStopImage.insertAfter(jCanvas);
        }
    }), 0);
};
AudioTestHost.AudioService.prototype.Start = function (onGotStream)
{
    if (!this.audioIsActive)
    {
         initAudio(this.canvasElement, this.rootFolder, onGotStream, this.disableWebGl);;
        this.audioIsActive = true;
    }
    else
    {
         updateAnalysers();;
        var r = window.recorder;
        r.record();
        onGotStream();
    }
    if (this.disableWebGl)
    {
        this.overlayPlayImage.show();
        this.overlayStopImage.hide();
    }
};
AudioTestHost.AudioService.prototype.Stop = function ()
{
    if (!this.disableWebGl)
    {
         cancelAnalyserUpdates();;
    }
    else
    {
        this.overlayPlayImage.hide();
        this.overlayStopImage.show();
    }
    var r = window.recorder;
    r.stop();
};
AudioTestHost.AudioService.prototype.ExportToWAV = function (exportCallback)
{
    var r = window.recorder;
    var callback = $CreateAnonymousDelegate(this, function (blob)
    {
        r.clear();
        if (this.get_OnAudioBlobReady() != null)
        {
            for (var i = 0; i < this.get_OnAudioBlobReady().length; i++)
            {
                this.get_OnAudioBlobReady()[i](blob);
            }
        }
        console.log("wav blob size:" + blob.size);
        exportCallback(blob);
    });
    r.exportWAV(callback);
};
AudioTestHost.AudioService.prototype.ExportToMp3 = function (exportCallback)
{
     exportMp3(exportCallback);;
};
function DefaultClient_Load()
{
    $(document.body).append("Ready<br/>");
};
function btnTest_click(e)
{
    $(document.body).append("Hello world<br/>");
};
