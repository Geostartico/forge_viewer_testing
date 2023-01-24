//extension that reacts to change of selection and to the change of the explode parameter of the model viewer
function Event_listener(viewer, options){
    Autodesk.Viewing.Extension.call(this, viewer, options)
}

Event_listener.prototype = Object.create(Autodesk.Viewing.Extension.prototype);

Event_listener.prototype.constructor = Event_listener;

Event_listener.prototype.load = function (){
    this.selectModel = true;
    this.first = true;
    this.dirEscape = "x";
    this.insert_connectors = false;
    this.change_insertion_point = false;
    this.hideModels = false;
    this.hiddenDbids = new Set();
    this.onSelection = this.onSelectionEvent.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.onSelection);
    this.onExplode = this.onExplodeEvent.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.EXPLODE_CHANGE_EVENT, this.onExplode);
    this.viewer.container.addEventListener('click', (this.listen).bind(this));
    document.onkeydown = this.keyEvent.bind(this);
    document.getElementById("submit").addEventListener("click", this.html_handler.bind(this));
    document.getElementById("restore").addEventListener("click", (this.restoreclick).bind(this));
    document.getElementById("save").addEventListener("click", this.save.bind(this));
    document.getElementById("file-selector").addEventListener("change", this.getFile.bind(this));
    document.getElementById("connector_list").addEventListener("change", this.getSelection.bind(this));
    document.getElementById("up").addEventListener("click", this.controller.bind(this));
    document.getElementById("left").addEventListener("click", this.controller.bind(this));
    document.getElementById("right").addEventListener("click", this.controller.bind(this));
    document.getElementById("down").addEventListener("click", this.controller.bind(this));
    console.log('event extension loaded');
    return true;
}
/**
 * the function is corresponds to the arrows on the ui page
 **/
Event_listener.prototype.controller = function(event){
    console.log(event.target)
    var dir = new THREE.Vector3(0, 0, 0);
    var speed = 100;
    /**
     * dwfx files have y and z axis switched
     **/
    switch(event.target.id){
        case "up": dir.z = -speed;break;
        case "down": dir.z = speed;break;
        case "right": dir.x =speed;break;
        case "left": dir.x = -speed;break;
    }
    this.moveSelectedModel(dir, this.selectedModels);
    //checks if the movement causes the model to collide with other models
    for(sel of this.selectedModels){
        if(this.collides(sel)){
            this.moveSelectedModel(dir.multiplyScalar(-1), this.selectedModels)
            return;
        }
    }
}
Event_listener.prototype.moveSelectedModel = function(dir, mods){
    if(mods){
        for(modelObject2 of mods){
            //get the  object used to store significant information about the model
            var model2 = this.models.filter((el) => {return el.id === modelObject2.id})[0];
            //get the position transform for the selected model
            var tr = modelObject2.getPlacementTransform();
            //move the model along the passed direction
            tr.elements[12] += dir.x;
            tr.elements[13] += dir.y;
            tr.elements[14] += dir.z;
            //set the new transform as the new model transform
            modelObject2.setPlacementTransform(tr);
            //updates the information object
            if(model2 != undefined){
                model2.transform = tr;
                model2.globalOffset = modelObject2.getGlobalOffset();
                if(!this.connectors){
                    this.connectors = [];
                }
                //updates connectors associated to the moved object
                var affectedConnectors = this.connectors.filter((el)=>{return el.modelId === model2.id})
                affectedConnectors.forEach((el)=>{el.start.x += dir.x;
                                                  el.start.y += dir.y;
                                                  el.start.z += dir.z;
                })
                //updates the render of the connectors if any are affected
                if(affectedConnectors.length > 0){
                    this.updateMeshes()
                    this.updateOptions();
                }
            }
        }
    }
    //forces to re-render
    this.viewer.impl.invalidate(true, true, true)
}
//listener to get the selected connectors from the menu
Event_listener.prototype.getSelection = async function(event){
    var jason = event.target.options[event.target.selectedIndex].value;
    this.selectedConnector = await JSON.parse(jason);
    this.updateMeshes();
}
//listener for json upload to restore the previous session
Event_listener.prototype.getFile = function (event) {
    var file = event.target.files;
    var reader = new FileReader();
    reader.onload = () =>{
        this.restore(reader.result)
    }
    reader.readAsText(file.item(0))
}
//save the current session as a json in localStorage and enable the download of the json
Event_listener.prototype.save = function (){
    var strong = JSON.stringify({'models':this.models ? this.models : [], 'fragments': this.fragments ? this.fragments : [], 'connectors': this.connectors ? this.connectors : []})
    localStorage.setItem("modelState", strong)
    var file = new Blob([strong], {type: 'text/json'})
    var data = "text/json;charset=utf-8," + encodeURIComponent(strong);
    var downloadAnchorNode = document.getElementById("download_json")
    downloadAnchorNode.href = URL.createObjectURL(file);
    downloadAnchorNode.setAttribute("download", "savedState" + ".json");
}
Event_listener.prototype.restoreclick = function(){
    this.restore(localStorage.getItem('modelState'))
}
//restores the session from the json string
Event_listener.prototype.restore = async function (str){
    //remove current scene
    this.viewer.overlays.removeScene('custom-scene')
    if(this.modelObjects){
        for(var i = 0; i < this.modelObjects.length; i++){
            var m = this.modelObjects[i];
            this.viewer.unloadModel(m);
        }
    }
    this.modelObjects = [];
    var jason = (await JSON.parse(str));
    this.models = jason.models;
    this.fragments = jason.fragments;
    this.connectors = jason.connectors
    //reload all the models
    for(m of this.models){
        var prom = new Promise((resolve, reject)=>{
        Autodesk.Viewing.Document.load(m.urn, ((doc)=>{
            // A document contains references to 3D and 2D geometries.
            var geometries = doc.getRoot().getDefaultGeometry();
            //geometries.forEach(function(coso) {console.log(coso.data)});
            //chiedere dove si trovano le proprietà degli oggetti
            if (geometries.length === 0) {
                console.error('Document contains no geometries.');
                return;
            }
            viewer.loadDocumentNode(doc, geometries, {keepCurrentModels: true})
            .then((async (mo)=>{
                this.modelObjects.push(mo)
                var affectedFrags = this.fragments.filter((el) =>{ return el.modelId === m.id && doc.myPath === el.modelUrn}) 
                var affectedConnectors = this.connectors.filter((el)=> {return el.modelId === m.id && doc.myPath === el.modelUrn})
                //update the old ids with the new ones
                affectedFrags.forEach((el) =>{el.modelId = mo.id})
                affectedConnectors.forEach((el) =>{el.modelId = mo.id})
                m.id = mo.id;
                resolve()
            }).bind(this));
        }).bind(this), (err)=>{console.log("error on load: ", err); reject()});
        })
        await prom;
    }
    await this.viewer.waitForLoadDone();
    //move the models in the correct position
    for(var i = 0; i < this.modelObjects.length; i ++){
        this.modelObjects[i].setGlobalOffset(this.models[i].globalOffset)
        var tr = this.modelObjects[i].getPlacementTransform();
        for(var j = 0; j < tr.elements.length; j++){
            tr.elements[j] = this.models[i].transform.elements[j];
        }
        this.modelObjects[i].setPlacementTransform(tr);
    }
    //move fragments that where moved
    for(f of this.fragments){
        var flist = (this.modelObjects.filter((el)=>{return el.id === f.modelId}))[0].getFragmentList()
        var sc = new THREE.Vector3(1, 1, 1)
        var rt = new THREE.Quaternion(f.rotation._x, f.rotation._y, f.rotation._z, f.rotation._w)
        var pos = new THREE.Vector3(f.position.x, f.position.y, f.position.z)
        flist.updateAnimTransform(f.fragid, sc, rt, pos)
    }
    this.connectors.forEach((el) => {el.meshes = []})
    this.updateMeshes()
    viewer.impl.invalidate(true, true, true);
}
Event_listener.prototype.unload = function (){
    console.log('event extension unloaded');
    return true;
}
//sets how the new connectors repetitions and spacing, if any are selected updates their repetitions and spacing
Event_listener.prototype.html_handler = function (event){
    this.repetitionUpStart = parseInt(document.getElementById("yStart").value);
    this.repetitionUp = parseInt(document.getElementById("yStop").value);
    this.repetitionRightStart = parseInt(document.getElementById("xStart").value);
    this.repetitionRight = parseInt(document.getElementById("xStop").value);
    this.repetitionDepthStart = parseInt(document.getElementById("zStart").value);
    this.repetitionDepth = parseInt(document.getElementById("zStop").value);
    this.spacing = parseInt(document.getElementById("spacingInput").value);
    console.log(this.repetitionUp, this.repetitionDepth, this.repetitionRight, this.repetitionUpStart, this.repetitionRightStart, this.repetitionDepthStart, this.spacing)
    if(this.selectedConnector){
        var selectedCon = this.connectors.filter((el)=>{
            return this.selectedConnector && 
            el.modelId === this.selectedConnector.model &&
            el.fragment === this.selectedConnector.fragment &&
            el.start.x === this.selectedConnector.start.x &&
            el.start.y === this.selectedConnector.start.y &&
            el.start.z === this.selectedConnector.start.z
        })
        console.log(selectedCon)
        selectedCon.forEach((el)=>{
            el.startrepetitionX = this.repetitionRightStart;
            el.startrepetitionY = this.repetitionUpStart;
            el.startrepetitionZ = this.repetitionDepthStart;
            el.stopRepetitionX = this.repetitionRight;
            el.stopRepetitionY = this.repetitionUp;
            el.stopRepetitionZ = this.repetitionDepth;
            el.spacing = this.spacing;
        })
        this.updateMeshes();
        }
}
//selects the model or the fragment based on the user choice
Event_listener.prototype.onSelectionEvent = async function(event){
    var txt = document.getElementById('listener');
    var cursel = this.viewer.getSelection();
    //no item was selected
    if(event.selections === 0){
        this.selected = undefined;
        this.selectedModels = undefined;
        return;
    }
    if(this.ext2 === undefined){
        this.ext2 = await this.viewer.getExtensionAsync("load_unload_extension")
    }
    this.selected = [];
    this.selectedModels = [];
    //save selected fragments and selected models
    for(var ii = 0; ii < event.selections.length; ii++){
        this.selectedModels.push(event.selections[ii].model);
        var fraglist = event.selections[ii].model.getFragmentList()
        for(var i = 0; i < event.selections[ii].fragIdsArray.length; i ++){
                //console.log("moving")
                //var fragmesh = this.viewer.impl.getFragmentProxy(event.selections[ii].model, event.selections[ii].fragIdsArray);
                //console.log(fragmesh)
                this.selected.push({'fragment': event.selections[ii].fragIdsArray[i], 'model': event.selections[ii].model});
        }
        if(this.hideModels && event.selections[ii].model.id === this.firstModel.id){
            console.log(event.selections[ii])
            for(var db of event.selections[ii].dbIdArray){
                this.hiddenDbids.add(db);
            }
            this.hideSelected();
            var tree = this.firstModel.getInstanceTree();
            this.getLeaves([tree.getRootId()], tree, this.firstModel)
        }
    }
    txt.innerText = 'selezioni: ' + cursel.length;
//    this.viewer.impl.sceneUpdated(true)
}
Event_listener.prototype.hideSelected = function(){
    var tmp = [];
    this.hiddenDbids.forEach((e) => {
        tmp.push(e);
    });
    this.viewer.hide(tmp, this.firstModel);
}
//listener for the click on the viewer div
Event_listener.prototype.listen = async function(event){
    if(this.ext2 === undefined){
        this.ext2 = await this.viewer.getExtensionAsync("load_unload_extension")
    }
    const rect = this.viewer.container.getBoundingClientRect();
    //get the viewer position inside the viewer
    var objHit = this.viewer.hitTest(event.clientX - rect.left, event.clientY - rect.top, true)
    //change insertionPoint of the new items
    if(this.change_insertion_point && objHit){
        this.insertionPoint = objHit.point;
    }
    //if connector insertion is disabled
    if(!this.insert_connectors){
        return;
    }
    //get the vectors along which to repeat the connectors
    var up, right, depth;
    if(objHit===undefined || objHit === null){
        return
    }
    if(!this.connectors){
        this.connectors = [];
    }
    var inter = objHit.intersectPoint;
    var norm = objHit.face.normal;
    depth = new THREE.Vector3(norm.x, norm.y, norm.z)
    depth.normalize();
    if(norm.x === 0 && norm.y === 0){
        right = new THREE.Vector3(1, 0, 0);
        up = new THREE.Vector3(0, 1, 0);
    }
    else{
        right = new THREE.Vector3(1, 1, 0)
        right.projectOnPlane(depth);
        right.normalize();
        up = right.clone();
        up.cross(depth);
        up.normalize();
    }
    var newConnector = {
        "start": objHit.point,
        "startrepetitionX":this.repetitionRightStart ? this.repetitionRightStart : 0,
        "stopRepetitionX":this.repetitionRight ? this.repetitionRight : 0,
        "startrepetitionY":this.repetitionUpStart ? this.repetitionUpStart : 0,
        "stopRepetitionY":this.repetitionUp ? this.repetitionUp : 0,
        "startrepetitionZ":this.repetitionDepthStart ? this.repetitionDepthStart : 0,
        "stopRepetitionZ":this.repetitionDepth ? this.repetitionDepth : 0,
        "spacing":this.spacing ? this.spacing : 0,
        "normal": norm,
        "right": right,
        "up":up, 
        "fragment": objHit.fragId,
        "modelId": objHit.model.id,
        "modelUrn": this.models.filter((el)=>{return el.id === objHit.model.id})[0].urn,
        "meshes": []
    }
    var selectList = document.getElementById("connector_list")
    this.connectors.push(newConnector)
    this.updateOptions();
    this.updateMeshes()
}
//update the options for the selectable connectors
Event_listener.prototype.updateOptions = function(){
    var selectList = document.getElementById("connector_list")
    for(el of selectList.children){
        el.value != "" ? selectList.removeChild(el) : []
    }
    for(con of this.connectors){
        var option = document.createElement("option")
        option.value = JSON.stringify({'start': con.start, 'model': con.modelId, 'fragment': con.fragment})
        option.innerText = 'model: ' + con.modelId.toString() + " fragment: " + con.fragment.toString();
        selectList.append(option)
    }
}
Event_listener.prototype.onExplodeEvent = function(event){
    var txt = document.getElementById('listener2');
    var expl = event.scale;
    txt.innerText = 'esploso con scala: ' + expl;
}
//key press event, used to move the selected elements, uses hjkl and bw for movement
Event_listener.prototype.keyEvent = async function(event){
    //console.log(event, this.selected)
   //console.log("loading extension")
    if(this.ext2 === undefined){
        this.ext2 = await this.viewer.getExtensionAsync("load_unload_extension")
        //console.log(this.ext2)
    }
    if(!this.fragments){
        this.fragments = [];
    }
    var dir = new THREE.Vector3(0, 0, 0);
    var speed = 40;
    switch(event.key){
        case "h" : dir.x = -speed; break;
        case "j" : dir.y = -speed; break;
        case "k" : dir.y = speed; break;
        case "l" : dir.x = speed; break;
        case "w" : dir.z = speed; break;
        case "b" : dir.z = -speed; break;
    }
    if(dir.x == 0 && dir.y == 0 && dir.z == 0){
        return
    }
    //moves the selected elements and updates children (fragments and or connectors)
    if(!this.selectModel){
        if(this.selected != undefined){
            for(var i = 0; i < this.selected.length; i ++){
                var pos = new THREE.Vector3();
                var rot = new THREE.Quaternion();
                var scale = new THREE.Vector3(1, 1, 1)
                var fragList = this.selected[i].model.getFragmentList();
                fragList.getAnimTransform(this.selected[i].fragment, scale, rot, pos)
                pos.add(dir)
                fragList.updateAnimTransform(this.selected[i].fragment, scale, rot, pos);
                var present = this.fragments.filter((el)=>{return el.fragid === this.selected[i].fragment && el.modelId == this.selected[i].model.id})[0]
                var mod = this.models.filter((el)=>{return el.id === this.selected[i].model.id})[0];
                var modUrn = mod.urn;
                var modId = mod.id;
                if(present){
                    present.position = pos;
                    present.rotation = rot;
                }
                else{
                    var frag = {
                        "fragid": this.selected[i].fragment,
                        'position': pos,
                        'rotation': rot,
                        'modelId': modId,
                        'modelUrn': modUrn
                    }
                    this.fragments.push(frag)
                }
                var affectedConnectors = this.connectors.filter((el) => {return el.modelId === modId && this.selected[i].fragment === el.fragment})
                //console.log(this.connectors, affectedConnectors, this.selected[i].fragment, modId)
                affectedConnectors.forEach((el) =>{el.start.x += dir.x; 
                                                   el.start.y += dir.y;
                                                   el.start.z += dir.z;
                })
                if(affectedConnectors.length > 0){
                    this.updateMeshes();
                    this.updateOptions();
                }
            }
        }
    }
    else{
        console.log("moving models")
        if(this.models){
            for(modelObject2 of this.selectedModels){
                if(modelObject2 === this.firstModel){
                    console.log("can't move the main model")
                    return;
                }
                var model2 = this.models.filter((el) => {return el.id === modelObject2.id})[0];
                if(model2 != undefined){
                    var tr = modelObject2.getPlacementTransform();
                    tr.elements[12] += dir.x;
                    tr.elements[13] += dir.y;
                    tr.elements[14] += dir.z;
                    modelObject2.setPlacementTransform(tr);
                    model2.transform = tr;
                    model2.globalOffset = modelObject2.getGlobalOffset();
                    if(this.collides(modelObject2)){
                        var tr = modelObject2.getPlacementTransform();
                        tr.elements[12] -= dir.x;
                        tr.elements[13] -= dir.y;
                        tr.elements[14] -= dir.z;
                        modelObject2.setPlacementTransform(tr);
                        model2.transform = tr;
                        model2.globalOffset = modelObject2.getGlobalOffset();
                        return;
                    }
                    if(!this.connectors){
                        this.connectors = [];
                    }
                    var affectedConnectors = this.connectors.filter((el)=>{return el.modelId === model2.id})
                    affectedConnectors.forEach((el)=>{el.start.x += dir.x;
                                                      el.start.y += dir.y;
                                                      el.start.z += dir.z;
                    })
                    if(affectedConnectors.length > 0){
                        this.updateMeshes()
                        this.updateOptions();
                    }
                }
            }
        }
    }
    viewer.impl.invalidate(true, true, true);
}
//render connectors, the selected ones are rendered as blue spheres
Event_listener.prototype.updateMeshes = function(){
    if(!this.connectors){
        return
    }
    if (!this.viewer.overlays.hasScene('custom-scene')) {
        this.viewer.overlays.addScene('custom-scene');
    }
    var sphereGeometry = new THREE.SphereGeometry(100, 15, 16)
    var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var selectedSphereMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    var selectedCon = this.connectors.filter((el)=>{
        return this.selectedConnector && 
            el.modelId === this.selectedConnector.model &&
            el.fragment === this.selectedConnector.fragment &&
            el.start.x === this.selectedConnector.start.x &&
            el.start.y === this.selectedConnector.start.y &&
            el.start.z === this.selectedConnector.start.z
    })
    //console.log('connectors', this.connectors)
    this.connectors.forEach((mod) => {
        mod.meshes.forEach((me) => {
            this.viewer.overlays.removeMesh(me, 'custom-scene')
        })
        var mat;
        !selectedCon.includes(mod) ? mat = sphereMaterial : mat = selectedSphereMaterial;
        for(var i = mod.startrepetitionX; i <= mod.stopRepetitionX; i++){
            for(var j = mod.startrepetitionY; j <= mod.stopRepetitionY; j++){
                for(var k = mod.startrepetitionZ; k <= mod.stopRepetitionZ; k++){
                    var repmesh = new THREE.Mesh(sphereGeometry, mat)
                    mod.meshes.push(repmesh);
                    repmesh.position.set(mod.start.x + i*mod.spacing, mod.start.y + j*mod.spacing, mod.start.z + k*mod.spacing);
                    this.viewer.overlays.addMesh(repmesh, 'custom-scene');
                }
            }
        }
    })
}
//saves newly loaded model
Event_listener.prototype.addModel = function(model, documento) {
    if(!this.models){
        this.models = []
    }
    if(!this.modelObjects){
        this.modelObjects = []
    }
    //the first loaded model is considered the base model
    if(this.first){
        this.firstModel = model;
        var tran = model.getPlacementTransform();
        this.initialPos = (new THREE.Vector3()).setFromMatrixPosition(tran); 
        this.globalOffset = model.getGlobalOffset();
        this.first = false;
    }
    //the other models must check for collisions when inserted
    else{
        var tr = model.getPlacementTransform();
        if(this.insertionPoint){
            tr.elements[12] = this.insertionPoint.x;
            tr.elements[13] = this.insertionPoint.y;
            tr.elements[14] = this.insertionPoint.z;
        }
        else{
            tr.elements[12] = this.initialPos.x;
            tr.elements[13] = this.initialPos.y;
            tr.elements[14] = this.initialPos.z;
        }
        model.setPlacementTransform(tr);
        model.setGlobalOffset(this.globalOffset)
        this.check_collisions(model)
    }
    var curmod = {
        'transform' : model.getPlacementTransform(),
        'urn' : documento.myPath,
        'id' : model.id,
        'globalOffset' : model.getGlobalOffset()
    }
    this.models.push(curmod)
    this.modelObjects.push(model)
    viewer.impl.invalidate(true, true, true);
}
//adds u.d. buttons for the toolbar
Event_listener.prototype.onToolbarCreated = function (toolbar){
    var btn = new Autodesk.Viewing.UI.Button('select_model');
    var btn2 = new Autodesk.Viewing.UI.Button('insert_connectors');
    var btn3 = new Autodesk.Viewing.UI.Button('insertion_point');
    var btn4 = new Autodesk.Viewing.UI.Button('hide_models');
    var btn5 = new Autodesk.Viewing.UI.Button('dehide_models');
    var vi = this.viewer;
    btn.onClick = (e) =>{
        this.selectModel = !this.selectModel;
    }
    btn2.onClick = (e) =>{
        this.insert_connectors = !this.insert_connectors;
    }
    btn3.onClick = (e) =>{
        this.change_insertion_point = !this.change_insertion_point;
    }
    btn4.onClick = (e) =>{
        this.hideModels = !this.hideModels;
    }
    btn5.onClick = (e) =>{
        this.dehide_models();
    }
    btn.addClass('select_model');
    btn.setToolTip('toggle model selection');
    btn2.addClass('insert_connectors');
    btn2.setToolTip('toggle connectors insertion');
    btn3.addClass('insertion_point');
    btn3.setToolTip('toggle insertion point change');
    btn4.addClass('hide_models');
    btn4.setToolTip('toggle model hiding');
    btn5.addClass('dehide_models');
    btn5.setToolTip('dehide models');
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('selection_mode');
    this.subToolbar.addControl(btn);
    this.subToolbar.addControl(btn2);
    this.subToolbar.addControl(btn3);
    this.subToolbar.addControl(btn4);
    this.subToolbar.addControl(btn5);
    toolbar.addControl(this.subToolbar);
}
//checks for collisions and moves the models if they collide with other geometries 
Event_listener.prototype.check_collisions = function(model, originalPosition){
    var collided = false;
    //calculates the main Model colliders if they weren't already
    if(!this.mainModelColliders){
        var tree = this.firstModel.getInstanceTree();
        this.getLeaves([tree.getRootId()], tree, this.firstModel)
    }
    //gets the bounding box for all the other models
    var modelBoxes = [];
    for(var mods of this.modelObjects){
        if(mods === this.firstModel){
            continue;
        }
        modelBoxes.push(mods.getBoundingBox());
    }
    for(var bx of modelBoxes.concat(this.mainModelColliders)){
        var boundingBox1 = model.getBoundingBox();
        if(boundingBox1.intersectsBox(bx)){
            var dir
            console.log(this.dirEscape)
            switch(this.dirEscape){
                case "x": dir = new THREE.Vector3(bx.max.x - boundingBox1.min.x, 0, 0); break;
                case "-x": dir = new THREE.Vector3(bx.min.x - boundingBox1.max.x, 0, 0); break;
                case "y": dir = new THREE.Vector3(0, bx.max.y - boundingBox1.min.y, 0); break;
                case "-y": dir = new THREE.Vector3(0, bx.min.y - boundingBox1.max.y, 0); break;
                case "z": dir = new THREE.Vector3(0, 0, bx.max.z - boundingBox1.min.z); break;
                case "-z": dir = new THREE.Vector3(0, 0, bx.min.z - boundingBox1.max.z); break;
            }
            this.moveSelectedModel(dir, [model])
            collided = true;
            console.log(this.mainBox, model.getBoundingBox())
            //exited the bounds, check for free space in another direction
            if(!this.checkBounds(model.getBoundingBox())){
                this.moveSelectedModel(dir.multiplyScalar(-1), [model])
                switch(this.dirEscape){
                    case "x": this.dirEscape = "-x";break;
                    case "-x": this.dirEscape = "z";break;
                    case "z": this.dirEscape = "-z";break;
                    case "-z": this.dirEscape = "y";break;
                    case "y": this.dirEscape = "-y";break;
                    case "-y": this.dirEscape = "x";break;
                }
            }
        }
    }
    if(collided){
        this.check_collisions(model);
    }
}
//checks for the bounds of the main model considering the escape position
Event_listener.prototype.checkBounds= function(box){
    switch(this.dirEscape){
        case "x": {
            return box.max.x < this.mainBox.max.x
        }
        case "-x": {
            return box.min.x > this.mainBox.min.x
        }
        case "y": {
            return box.max.y < this.mainBox.max.y
        }
        case "-y": {
            return box.min.y > this.mainBox.min.y
        }
        case "z": {
            return box.max.z < this.mainBox.max.z
        }
        case "-z": {
            return box.min.z > this.mainBox.min.z
        }
    }
}
//only checks for collisions
Event_listener.prototype.collides = function(model){
    if(this.firstModel === model){
        return false;
    }
    for(var secondMod of this.modelObjects){
        if(secondMod === this.firstModel || secondMod === model){
            continue;
        }
        var boundingBox1 = model.getBoundingBox();
        var boundingBox2 = secondMod.getBoundingBox();
        if(boundingBox1.intersectsBox(boundingBox2)){
            return true
        }
    }
    for(maincol of this.mainModelColliders){
        var boundingBox1 = model.getBoundingBox();
        if(boundingBox1.intersectsBox(maincol)){
            return true
        }
    }
    return false;
}
//gets the elements without children in order to calculate the bounding boxes of the main model
Event_listener.prototype.getLeaves = function (dbIds, tree, model){
    let leaves = [];
    for(let i = 0; i < dbIds.length; i++){
        let subchildren = (id) =>{
            if(this.hiddenDbids.has(id)){
                return;
            }
            if(tree.getChildCount(id) === 0){
                leaves.push(id)
            }
            tree.enumNodeChildren(id, (child) => {subchildren(child)});
        }
        subchildren(dbIds[i]);
    }
    this.mainBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0,0,0));
    this.mainModelColliders = [];
    for(leaf of leaves){
        var bx = new Float32Array(6);
        tree.getNodeBox(leaf, bx);
        var threeBox = new THREE.Box3(new THREE.Vector3(bx[0], bx[1], bx[2]), new THREE.Vector3(bx[3],bx[4],bx[5]))
        this.mainModelColliders.push(threeBox)
        this.mainBox.union(threeBox)
    }
    return leaves;
}
Event_listener.prototype.getBox = function(dbid, model){
    var bx = new Float32Array(6);
    model.getInstanceTree().getNodeBox(dbid, bx);
    var threeBox = new THREE.Box3(new THREE.Vector3(bx[0], bx[1], bx[2]), new THREE.Vector3(bx[3],bx[4],bx[5]))
    return threeBox;
}
Event_listener.prototype.dehide_models = function(){
    var hiddenBoxes = []
    this.hiddenDbids.forEach((e)=>{
        hiddenBoxes.push(this.getBox(e, this.firstModel))
    })
    for(var md of this.modelObjects){
        if(md === this.firstModel){
            continue;
        }
        var bx = md.getBoundingBox();
        for(var hb of hiddenBoxes){
            if(bx.intersectsBox(hb)){
                intersects = true
                window.alert("unable to dehide models, collisions detected")
                return;
            }
        }
    }
    this.hiddenDbids = new Set();
    this.viewer.showAll()
}
