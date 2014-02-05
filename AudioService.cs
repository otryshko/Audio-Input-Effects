namespace AudioTestHost
{
    using SharpKit.Html;
    using SharpKit.Html.fileapi;
    using SharpKit.JavaScript;
    using SharpKit.jQuery;

    [JsType(JsMode.Prototype, Filename = "res/Default.js")]
    public class AudioService
    {
        private readonly string rootFolder;
        private HtmlElement canvasElement;
        private bool audioIsActive = false;
        private bool disableWebGl = false;
        private jQuery overlayPlayImage;
        private jQuery overlayStopImage;

        [JsProperty(NativeProperty = true)]
        public JsArray<JsAction<Blob>> OnAudioBlobReady { get; set; }

        public AudioService(string rootFolder)
        {
            this.rootFolder = rootFolder;
            OnAudioBlobReady = new JsArray<JsAction<Blob>>();
        }

        public void VisualizeTo(jQuery jCanvas)
        {
            this.canvasElement = jCanvas[0];
            // scheduling webl context test on the next window message
            // if we call it now, Chrome will return null
            HtmlContext.window.setTimeout(() =>
            {
                JsObject gl = null;
                JsContext.JsCode("try{gl = this.canvasElement.getContext('experimental-webgl');} catch(e){}");

                if (gl == null)
                {
                    disableWebGl = true;
                }

                // firefox supports webgl but it crashes in webaudio (somewhere in webworker). I'm leaving firefox detection here for future debugging
                if (disableWebGl /*|| HtmlContext.navigator.userAgent.As<JsString>().toLowerCase().indexOf("firefox") >= 0*/)
                {
                    disableWebGl = true;
                    this.overlayPlayImage =
                        jQueryContext.J("<img style='position: absolute; height:0px; top: 0px; width:275px; height:100px' src='https://280318532cb01f796950-efc0b4a232f68bda8de29a521f985740.ssl.cf2.rackcdn.com/editor2_wave.gif'/>")
                            .hide();
                    this.overlayStopImage =
                        jQueryContext.J(
                            "<div style='position: absolute; width:275px; height:3px; top: 49px; left: 0px; background-color: rgb(78, 165, 255); '></div></div>");
                    overlayPlayImage.insertAfter(jCanvas);
                    overlayStopImage.insertAfter(jCanvas);
                }

            }, 0);

        }
        public void Start(JsAction onGotStream)
        {
            if (!audioIsActive)
            {
                JsContext.JsCode("initAudio(this.canvasElement, this.rootFolder, onGotStream, this.disableWebGl);");
                audioIsActive = true;
            }
            else
            {
                JsContext.JsCode("updateAnalysers();");
                var r = HtmlContext.window.As<dynamic>().recorder;
                r.record();
                onGotStream();
            }

            if (disableWebGl)
            {
                overlayPlayImage.show();
                overlayStopImage.hide();
            }
        }
        public void Stop()
        {
            if (!disableWebGl)
            {
                JsContext.JsCode("cancelAnalyserUpdates();");
            }
            else
            {
                overlayPlayImage.hide();
                overlayStopImage.show();
            }
            var r = HtmlContext.window.As<dynamic>().recorder;
            r.stop();
        }
        public void ExportToWAV(JsAction<Blob> exportCallback)
        {
            var r = HtmlContext.window.As<dynamic>().recorder;
            JsAction<Blob> callback = blob =>
            {
                r.clear();
                if (this.OnAudioBlobReady != null)
                {
                    for (int i = 0; i < this.OnAudioBlobReady.length; i++)
                    {
                        this.OnAudioBlobReady[i](blob);
                    }
                }
                HtmlContext.console.log("wav blob size:" + blob.size.As<JsString>());
                exportCallback(blob);
            };
            r.exportWAV(callback);
        }
        public void ExportToMp3(JsAction<string> exportCallback)
        {
            JsContext.JsCode("exportMp3(exportCallback);");
        }
    }
}