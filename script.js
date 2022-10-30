Autodesk.Viewing.theExtensionManager.registerExtension('load_unload_extension', Load_unload_extension);
Autodesk.Viewing.theExtensionManager.registerExtension('event_react_extension', Event_listener);
Autodesk.Viewing.theExtensionManager.registerExtension('toolbar_extension', Toolbar_extension);

var viewer;
var curdoc;
var configGui = {
    extensions: ["load_unload_extension",
                 "event_react_extension",
                 "toolbar_extension"]
}
var options = {
    env: 'AutodeskProduction',
    api: 'derivativeV2',    // for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: function(onTokenReady){
        var token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJidWNrZXQ6cmVhZCIsImJ1Y2tldDp1cGRhdGUiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImRhdGE6d3JpdGUiLCJkYXRhOmNyZWF0ZSIsImRhdGE6cmVhZCJdLCJjbGllbnRfaWQiOiJ1UnczOWNBTUlGMEh0U0dNYnVURUFvRFJSbnRFNlJCaCIsImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tL2F1ZC9hand0ZXhwNjAiLCJqdGkiOiJjUm5ZYkZHYlBRdlRVU3d1MEJ6RWFEMjBZS1pLWTBGS2h1MGhIZ0hiREM4Ukh4d2l2NnRQV0M3VXE5UVhEd2M1IiwiZXhwIjoxNjY2NzAyNTExfQ.f7wN44pLeRaq3H665RzW0wDGX4eXh-nhm85kIzcqQMDIPVUJRDDZqZZn8gw7-FqWdsGx7s_I7t2GcsU8wc8QRLQJrPwlgdY8-MTliRRJdE6wIekDcIEo4ChOvBTIkqS08_EyBOKlHnxRec_txOhw6MALWZstX0fVJmsNqSQiFq7Q9sOUU0CBmzdfM8IzRV7Rp1ScKyJ6kaoCwGSZZ8YBzbU3I3dBgzExf-78WdLXcRI3tqTw55IO5eZh3igwm5Jf81m9Vpdojr0KIBDvCZsoPX7opahvuefBaH8puzFPioBPK81bmLyC2yTjl-ctmfGlYIMhI7UIjMKvH65Cy0CHmw';
        var timeInSeconds = 3599;
        onTokenReady(token, timeInSeconds);
}
}
Autodesk.Viewing.Initializer(options, function(){
    var htmlDiv = document.getElementById('forgeViewer');
    viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, configGui);
    var startedCode = viewer.start();
    if (startedCode > 0) {
        console.error('Failed to create a Viewer: WebGL not supported.');
        return;
    }
    else{
        console.log('Initialization complete, loading a model next...');
        //Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        //Autodesk.Viewing.Document.load(documentId2, onDocumentLoadSuccess, onDocumentLoadFailure);
    }});
function getChildren(root){
    if(root.children != undefined){
    root.children.forEach(function(ch) {
        console.log(ch);
        getChildren(ch);
    })
    }
}

