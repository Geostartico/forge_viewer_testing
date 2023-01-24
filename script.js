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
        var token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOnJlYWQiLCJidWNrZXQ6cmVhZCJdLCJjbGllbnRfaWQiOiJ1UnczOWNBTUlGMEh0U0dNYnVURUFvRFJSbnRFNlJCaCIsImlzcyI6Imh0dHBzOi8vZGV2ZWxvcGVyLmFwaS5hdXRvZGVzay5jb20iLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbSIsImp0aSI6Ikk0WlJRc1hjZ3dhbTBkanU5TTRpUjVIZnczN1hyZXNBcnhGdzM0Y1J5dklLRkM4ckhPejRkRHFrYmRpSnNjMEYiLCJleHAiOjE2NzQ1NTA1ODZ9.TfOk1W4Z8iAOYbbNkkLRt5MdL5vIdYyhBF6_YY6bvxQwMgGi8f7OVSZ5PwAw-9KGJAEopN6t13Q8MxVSp6TdclklNI5APuTL-yBtvcOLy4SRAixd6fgBwtqyamlEoX7PvPmGd9QxLeUGqwBC2A7SLKv2KQ6Tc-wRAZtp3hVPqC-JFnvpstR6YG2BxYQCzIksU7uSXg0nil5Xu7kedjzBbSV_Iin1VOyIBRHOkCK9mIjHf9qzwOW-f20NhHul4ZhB522ivzC6ePeBE3f0cO4VXrAis0VcdzCh-JN4nG-D6gA_d97NhwDWkcsJACiTmFSk5Zt5u1eVSn0nAJOfaBlqug';
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


