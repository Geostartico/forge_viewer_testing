Autodesk.Viewing.theExtensionManager.registerExtension('load_unload_extension', Load_unload_extension);
var viewer;
var curdoc;
var configGui = {
    extensions: ["load_unload_extension"]
}
var options = {
    env: 'AutodeskProduction',
    api: 'derivativeV2',    // for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: function(onTokenReady){
        var token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJidWNrZXQ6cmVhZCIsImJ1Y2tldDp1cGRhdGUiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImRhdGE6d3JpdGUiLCJkYXRhOmNyZWF0ZSIsImRhdGE6cmVhZCJdLCJjbGllbnRfaWQiOiJ1UnczOWNBTUlGMEh0U0dNYnVURUFvRFJSbnRFNlJCaCIsImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tL2F1ZC9hand0ZXhwNjAiLCJqdGkiOiJ3Y2pUazJVTDV3M1NiQ1VxQU1sTkNHUWwweWNjRFZ6QVd5czFYMTRlS2NLMzEyZ0huSWlaVkVoUjQ5ZUlTUlo4IiwiZXhwIjoxNjY2MTc0MDM5fQ.OR_bH_ka3puHEvvH3zVm1HTSJexxhHomgwgTWtFIkL9koeJvgzNDIOkN26ooRiVu814JgMk_blvrplfcuuVdeh4bWyfgv1ZTqvGSu4aZu3lgpgHUw8XbpZ-pSSwEYcnjhlfbl0y4VT5PHAKB54cLBPl7OfY5sn2T_fZBjh85kbJcZnaYAm21wUOilo8-i3vFQ4HjUFIGqlCx4DSejz4w4oqB4QteaB_bVXKGnsqi6f7MY4ir4n3BYZtHfFD09NhlFY2iQwgBV8EraEkzpwKaoccNOhl5KMWlntqtlRPiTr6Edt4wy2KDMCh47TULFdi7Oeqq_45p_QJeAqyK07EiFg';
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

