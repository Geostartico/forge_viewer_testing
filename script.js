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
        var token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJidWNrZXQ6cmVhZCIsImJ1Y2tldDp1cGRhdGUiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImRhdGE6d3JpdGUiLCJkYXRhOmNyZWF0ZSIsImRhdGE6cmVhZCJdLCJjbGllbnRfaWQiOiJ1UnczOWNBTUlGMEh0U0dNYnVURUFvRFJSbnRFNlJCaCIsImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tL2F1ZC9hand0ZXhwNjAiLCJqdGkiOiJiZWxISnNYaUN2RmNzZFMxaXJ2VmoxdDZSRHJSYjJ0Q1JEUTZabW5sS0hqOHM0T1c3cjZKM2laU2tjR29GZFROIiwiZXhwIjoxNjY2MTc3NzM4fQ.ZCtx7O4mPdMHrA4bP2K0LL9lhGF3ATQZFcqaPGsomRr8PTlQ2cRlMX2rdSgJ2T7ssysNwOOHZJQpX_z6vahhip3asmvui1_CERhIPK62e0SruZsJ3fKAEgihnruVjvZB4x5gi95rCDcRfvgVmIEmcBSW0h723uIbotd23HZSZTcNVXjh8sTR-pSMjjC4lV-qFPriDCuvsGpRR4wnf-lxuCOoalQHMH6LKac-0TM7sVQwId-3dsNfOzcYVquVHZFCCQTEXBCqhV3gMkplq_UymrWw_zMRh3M9v_23Tf6-eQfShD3GnFN7ydO6BzCXvDmOz1Mfz4fEaDt7CnmeIr5Oiw';
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

