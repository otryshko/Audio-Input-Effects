using SharpKit.JavaScript;
using SharpKit.Html;
using SharpKit.jQuery;

namespace AudioTestHost
{
    [JsType(JsMode.Global, Filename = "res/Default.js")]
    public class DefaultClient
    {
        static void DefaultClient_Load()
        {
            new jQuery(HtmlContext.document.body).append("Ready<br/>");
        }
        static void btnTest_click(DOMEvent e)
        {
            new jQuery(HtmlContext.document.body).append("Hello world<br/>");
        }
    }
}