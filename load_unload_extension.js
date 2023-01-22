//the models are identified by a base64 urn
//var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0X2hoL3JhY19hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ=';

var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0X2hoL0Jhc2VfQXJyZWRvLmR3Zng=';
//var documentId2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0X2dnL3JzdF9iYXNpY19zYW1wbGVfcHJvamVjdC5ydnQ=';

var documentId2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0X2hoL0Y4M1RCTTAwLmR3Zng=';
var viewer;
var curdoc;
var document_loaded;
//load extension into the viewer
function Load_unload_extension(viewer, options){
    Autodesk.Viewing.Extension.call(this, viewer, options);
}
//initialize the class
Load_unload_extension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);

Load_unload_extension.prototype.constructor = Load_unload_extension;
//operations to do when the extension is loaded
Load_unload_extension.prototype.load = function (){
    document_loaded = false;

    var loadbtn = document.getElementById('load_button');
    var unloadbtn = document.getElementById('unload_button');
    //adds the functions to the events
    loadbtn.addEventListener('click', Load_unload_extension.prototype.load_document_ev.bind(this));
    unloadbtn.addEventListener('click', Load_unload_extension.prototype.unload_document);

    var loadbtn2 = document.getElementById('load_button2');
    loadbtn2.addEventListener('click', Load_unload_extension.prototype.load_document2.bind(this));
    var selectButton = document.getElementById('load_model');
    selectButton.addEventListener('click', (this.load_click_event).bind(this))
    console.log("extension loaded");
    viewerr = this.viewer;
    return true;
}
//operations to do ehrn the extension is unloaded
Load_unload_extension.prototype.unload = function (){
    console.log("extension unloaded");
    return true;
}

Load_unload_extension.prototype.load_click_event = function(){
    var list = document.getElementById('models_list')
    var urn = list.options[list.selectedIndex].value;
    if(urn != ""){
        this.load_document(urn)
    }
}
Load_unload_extension.prototype.load_document_ev = function () {
    this.load_document(documentId)
}
Load_unload_extension.prototype.load_document = function (documentId) {
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess.bind(this), onDocumentLoadFailure);
    document_loaded = true;
    console.log("click works for load");
}

Load_unload_extension.prototype.unload_document = function () {
    console.log("click works for unload");
    if(!document_loaded){
        console.log("no document loaded");
        return;
    }
    document_loaded = false;
    viewer.unloadDocumentNode(curdoc.getRoot().getDefaultGeometry());

}


Load_unload_extension.prototype.load_document2 = function () {
    if(document_loaded){
        console.log("a document was already loaded2");
        //return;
    }
    Autodesk.Viewing.Document.load(documentId2, onDocumentLoadSuccess2.bind(this), onDocumentLoadFailure);
    document_loaded = true
    console.log("click works for load");
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
    viewer.loadDocumentNode(doc, geometries, {keepCurrentModels: true})
    .then((async (mo2)=>{
        if(!this.eventext){
            this.eventext = await this.viewer.getExtensionAsync('event_react_extension');
        }
        this.eventext.addModel(mo2, doc)
        this.mainModel = mo2; 
    }).bind(this));
    console.log("document loaded");
    //viewer.waitForLoadDone();
    //console.log("FATTO");
    //setTimeout(() => {console.log("waited")}, 10000);
    //viewer.unloadDocumentNode(geometries);

}
function onDocumentLoadSuccess2(doc) {
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
    viewer.loadDocumentNode(doc, geometries, {keepCurrentModels: true})
    .then((async(mo2)=>{
        this.model2 = mo2
        if(!this.eventext){
            this.eventext = await this.viewer.getExtensionAsync('event_react_extension');
        }
        this.eventext.addModel(mo2, doc)
        this.mainModel = mo2; 
    }).bind(this));
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


