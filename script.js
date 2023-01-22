//loading the extensions into the viewer environment
Autodesk.Viewing.theExtensionManager.registerExtension('load_unload_extension', Load_unload_extension);
Autodesk.Viewing.theExtensionManager.registerExtension('event_react_extension', Event_listener);
Autodesk.Viewing.theExtensionManager.registerExtension('toolbar_extension', Toolbar_extension);
console.log(Load_unload_extension);
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
        var token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiLCJidWNrZXQ6cmVhZCJdLCJjbGllbnRfaWQiOiJ1UnczOWNBTUlGMEh0U0dNYnVURUFvRFJSbnRFNlJCaCIsImlzcyI6Imh0dHBzOi8vZGV2ZWxvcGVyLmFwaS5hdXRvZGVzay5jb20iLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbSIsImp0aSI6IjhVcU9UYXRsdGJ6RnhVUUgwN1VNdkxvWEF6NGJkSFNlNTR4U3Y4T2FiY0ZtYUhNV09hRGVHMHo3MzZ1VElmUVEiLCJleHAiOjE2NzQzODEzNzN9.b75JlPQHHuKmil5TVIxrJie7EvocxV_wSc6gHoyopFIVOAq3TtLwoqh3d78OL4j6CDS9d9-mfgIiQte9ni4xkVxUSsYWt2OxsXAOe5a4EZ8HRbVTrZO5c1VW8VIu9K6PuyB0RB-z2KvsKircMwk-xlc2q366WjT1RmX6vu9LVZJ3BMQRC-833CeAU5NPeh8KjbmiEMShElOkVqvgQeZV3_ar_csErK4GJ5GlQ591LijQSaoRdzSIPmmYfZuNK7rGAS_uGQuyuPZX5WKdqfzoGAoIOfuiq3gs9heVUES6urvpsg1unwLz_CL8dUvke-KBX-rE1kHCMB9mBgihsybRWw';
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


