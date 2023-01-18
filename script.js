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
        var token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiLCJidWNrZXQ6cmVhZCJdLCJjbGllbnRfaWQiOiJ1UnczOWNBTUlGMEh0U0dNYnVURUFvRFJSbnRFNlJCaCIsImlzcyI6Imh0dHBzOi8vZGV2ZWxvcGVyLmFwaS5hdXRvZGVzay5jb20iLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbSIsImp0aSI6ImZ1bDBLcHpmb3F6SkkxYUpXNGVZRGQ0WHFyTlZkczJjVklHb2pkWnJ4d3luU1ZJNkdxODlISU5lSVd6cVc5VXAiLCJleHAiOjE2NzQwMzI5Njd9.dP3AngbLggAFKHPTzhXdYfp9yrWqzQYWbmKJbuGDDH6LpwUpDTnjZ1YJFX8F-Ta4f_Wrw3Yyp4ufEW7ObnLyqA6_1Yqmn20T7UuLix4l8xBFLKv_w5w6U3TnmtX44Sdr_2pNiWOITvVpjjLBtrguxwuHRUzMOTQi_ZOX9lSzvwWIaGx3FHIQFXWdN96ISTeZwfH7ImBehYWGo7zotcYk5nIT_3i5mmGXZ4G3i-yJ6rYpFFM-OETvQUUMbsYVrWfDye0AFZQYxPLe_EparzQuD3u5TTAw3wrWxtkgctW9LhXAV4oLtPsNueatcoUwNxpnnjJKcReb1iDwhLloqb7uPg';
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


