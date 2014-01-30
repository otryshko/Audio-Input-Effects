/*Generated by SharpKit 5 v5.2.0*/
if (typeof(AudioTestHost) == "undefined")
    var AudioTestHost = {};
AudioTestHost.AudioService = function ()
{
    this.canvas = null;
    this.audioIsActive = false;
};
AudioTestHost.AudioService.prototype.VisualizeTo = function (canvas)
{
    this.canvas = canvas[0];
};
AudioTestHost.AudioService.prototype.Start = function ()
{
    if (!this.audioIsActive)
    {
         initAudio(this.canvas);;
        this.audioIsActive = true;
    }
    else
    {
         updateAnalysers();;
    }
};
AudioTestHost.AudioService.prototype.Stop = function ()
{
     cancelAnalyserUpdates();recorder.stop();;
};
AudioTestHost.AudioService.prototype.ExportToWAV = function (wavBlob)
{
    var r = window.recorder;
    r.exportWAV(wavBlob);
};
function DefaultClient_Load()
{
    $(document.body).append("Ready<br/>");
};
function btnTest_click(e)
{
    $(document.body).append("Hello world<br/>");
};
