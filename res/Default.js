/*Generated by SharpKit 5 v5.2.0*/
if (typeof(AudioTestHost) == "undefined")
    var AudioTestHost = {};
AudioTestHost.AudioService = function ()
{
    this.canvas = null;
};
AudioTestHost.AudioService.prototype.VisualizeTo = function (canvas)
{
    this.canvas = canvas[0];
};
AudioTestHost.AudioService.prototype.Start = function ()
{
     initAudio(this.canvas);;
};
AudioTestHost.AudioService.prototype.Stop = function ()
{
    window.alert("stop clicked");
};
AudioTestHost.AudioService.prototype.ExportToWAV = function ()
{
    window.alert("ExportToWAV clicked");
};
function DefaultClient_Load()
{
    $(document.body).append("Ready<br/>");
};
function btnTest_click(e)
{
    $(document.body).append("Hello world<br/>");
};
