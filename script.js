//loading the extensions into the viewer environment
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
    api: 'derivativeV2',
    getAccessToken: function(onTokenReady){
        //token to access the viewer functionalities, the token lasts a set amount of time
        var token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJidWNrZXQ6cmVhZCIsImJ1Y2tldDp1cGRhdGUiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImRhdGE6d3JpdGUiLCJkYXRhOmNyZWF0ZSIsImRhdGE6cmVhZCJdLCJjbGllbnRfaWQiOiJ1UnczOWNBTUlGMEh0U0dNYnVURUFvRFJSbnRFNlJCaCIsImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tL2F1ZC9hand0ZXhwNjAiLCJqdGkiOiJtM1FWb1RVeHU1UWIwYm5uY1ViWWFsNlVJSkthWk40VDQxRnV5bXMwT0I0Sk81bE40OWt1OU5WeDZLb0NwS2NQIiwiZXhwIjoxNjY3MTI4NjQ1fQ.TXQQ00Hqn_40QVUM5XIjNNgv0omkZikoUZnyc6F1qKeD6P7G2gal-JxIpsbYHjnsDichOfDV0WgjgSNLz_M_pJKDXoMuX7pW7nQYY-e2tCnzzjfQKwk1s92owOi0TMw39FrKaWgPWWOGYbBXK6JODVt0I2HIYG31L9c6u-_yqSjQplN4wdb47pXI7A2tTSQhHI0bNt7FxzuBWzjiWCWe4yHuLHhueg8ACNrbpl_BRiREioGFve79wFCj2FAaouLxAH7D7g_VUssoteZetB19jzJCcr8pTmH30rgdigbV_-ZZ1Jtc6ynno2R_d3bMStKYx03fldxlxduYlw6KnhNwXA';
        var timeInSeconds = 3599;
        onTokenReady(token, timeInSeconds);
}
}
//function to initialize the viewer
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

