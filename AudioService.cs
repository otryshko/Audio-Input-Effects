namespace AudioTestHost
{
    using SharpKit.Html;
    using SharpKit.Html.fileapi;
    using SharpKit.JavaScript;
    using SharpKit.jQuery;

    [JsType(JsMode.Prototype, Filename = "res/Default.js")]
    public class AudioService
    {
        private HtmlElement canvas;
        private bool audioIsActive = false;
        public void VisualizeTo(jQuery canvas)
        {
            this.canvas = canvas[0];
        }
        public void Start()
        {
            if (!audioIsActive)
            {
                JsContext.JsCode("initAudio(this.canvas);");
                audioIsActive = true;
            }
            else
            {
                JsContext.JsCode("updateAnalysers();");
            }
        }
        public void Stop()
        {
            JsContext.JsCode("cancelAnalyserUpdates();recorder.stop();");
        }
        public void ExportToWAV(JsAction<Blob> wavBlob)
        {
            var r = HtmlContext.window.As<dynamic>().recorder;
            //JsAction<Blob> exportCallback = (b) => { HtmlContext.window.alert(b.size.As<JsString>()); };
            r.exportWAV(wavBlob);
        }
        public void ExportSamples(JsAction<JsObject> wavBlob)
        {
            var r = HtmlContext.window.As<dynamic>().recorder;
            //JsAction<Blob> exportCallback = (b) => { HtmlContext.window.alert(b.size.As<JsString>()); };
            r.exportSamples(wavBlob);
        }
    }
}