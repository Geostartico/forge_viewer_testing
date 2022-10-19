var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0X2hoL3JhY19hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ=';
var documentId2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0X2dnL3JzdF9iYXNpY19zYW1wbGVfcHJvamVjdC5ydnQ=';
var viewer;
var curdoc;
function Load_unload_extension(viewer, options){
    Autodesk.Viewing.Extension.call(this, viewer, options);
}
Load_unload_extension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);

Load_unload_extension.prototype.constructor = Load_unload_extension;

Load_unload_extension.prototype.load = function (){
    var loadbtn = document.getElementById('load_button');
    var unloadbtn = document.getElementById('unload_button');
    loadbtn.addEventListener('click', Load_unload_extension.prototype.load_document);
    unloadbtn.addEventListener('click', Load_unload_extension.prototype.unload_document);
    console.log("extension loaded");
    viewerr = this.viewer;
    return true;
}

Load_unload_extension.prototype.unload = function (){
    console.log("extension unloaded");
    return true;
}

Load_unload_extension.prototype.load_document = function () {
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    console.log("click works for load");
}

Load_unload_extension.prototype.unload_document = function () {
    console.log("click works for unload");
    viewer.unloadDocumentNode(curdoc.getRoot().getDefaultGeometry());

}

/**
* Autodesk.Viewing.Document.load() success callback.
* Proceeds with model initialization.
*/
function onDocumentLoadSuccess(doc) {
    console.log("ok");
    curdoc = doc;
    // A document contains references to 3D and 2D geometries.
    var geometries = doc.getRoot().getDefaultGeometry();
    //geometries.forEach(function(coso) {console.log(coso.data)});
    //chiedere dove si trovano le proprietà degli oggetti
    if (geometries.length === 0) {
        console.error('Document contains no geometries.');
        return;
    }
    viewer.loadDocumentNode(doc, geometries);
    console.log("document loaded");
    //viewer.waitForLoadDone();
    //console.log("FATTO");
    //setTimeout(() => {console.log("waited")}, 10000);
    //viewer.unloadDocumentNode(geometries);

}


/**
 * Autodesk.Viewing.Document.load() failure callback.
 */
function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}


