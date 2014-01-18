namespace AudioTestHost
{
    using SharpKit.Html;
    using SharpKit.JavaScript;
    using SharpKit.jQuery;

    [JsType(JsMode.Prototype, Filename = "res/Default.js")]
    public class AudioService
    {
        private HtmlElement canvas;

        public void VisualizeTo(jQuery canvas)
        {
            this.canvas = canvas[0];
        }
        public void Start()
        {
            JsContext.JsCode("initAudio(this.canvas);");
            //HtmlContext.window.alert("start clicked");
        }
        public void Stop()
        {
            HtmlContext.window.alert("stop clicked");
        }
        public void ExportToWAV()
        {
            HtmlContext.window.alert("ExportToWAV clicked");
        }

    }
}