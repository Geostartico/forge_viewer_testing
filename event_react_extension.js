//extension that reacts to change of selection and to the change of the explode parameter of the model viewer
function Event_listener(viewer, options){
    Autodesk.Viewing.Extension.call(this, viewer, options)
}

Event_listener.prototype = Object.create(Autodesk.Viewing.Extension.prototype);

Event_listener.prototype.constructor = Event_listener;

Event_listener.prototype.load = function (){
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
    console.log('event extension loaded');
    return true;
}
Event_listener.prototype.getSelection = async function(event){
    var jason = event.target.options[event.target.selectedIndex].value;
    this.selectedConnector = await JSON.parse(jason);
    this.updateMeshes();
}
Event_listener.prototype.getFile = function (event) {
    var file = event.target.files;
    var reader = new FileReader();
    reader.onload = () =>{
        this.restore(reader.result)
    }
    reader.readAsText(file.item(0))
}
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
Event_listener.prototype.restore = async function (str){
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
    for(var i = 0; i < this.modelObjects.length; i ++){
        this.modelObjects[i].setGlobalOffset(this.models[i].globalOffset)
        var tr = this.modelObjects[i].getPlacementTransform();
        for(var j = 0; j < tr.elements.length; j++){
            tr.elements[j] = this.models[i].transform.elements[j];
        }
        this.modelObjects[i].setPlacementTransform(tr);
    }
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
Event_listener.prototype.onSelectionEvent = async function(event){
    var txt = document.getElementById('listener');
    var cursel = this.viewer.getSelection();
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
    for(var ii = 0; ii < event.selections.length; ii++){
        this.selectedModels.push(event.selections[ii].model);
        var fraglist = event.selections[ii].model.getFragmentList()
        for(var i = 0; i < event.selections[ii].fragIdsArray.length; i ++){
                //console.log("moving")
                //var fragmesh = this.viewer.impl.getFragmentProxy(event.selections[ii].model, event.selections[ii].fragIdsArray);
                //console.log(fragmesh)
                this.selected.push({'fragment': event.selections[ii].fragIdsArray[i], 'model': event.selections[ii].model});
        }
    }
    txt.innerText = 'selezioni: ' + cursel.length;
//    this.viewer.impl.sceneUpdated(true)
}
Event_listener.prototype.listen = async function(event){
    if(this.ext2 === undefined){
        this.ext2 = await this.viewer.getExtensionAsync("load_unload_extension")
    }
    //console.log("click", event)
    const rect = this.viewer.container.getBoundingClientRect();
    var objHit = this.viewer.hitTest(event.clientX - rect.left, event.clientY - rect.top, true)
    //console.log(objHit)
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
    var dirmod2 = new THREE.Vector3(0, 0, 0)
    var speed = 40;
    switch(event.key){
        case "h" : dir.x = -speed; break;
        case "j" : dir.y = -speed; break;
        case "k" : dir.y = speed; break;
        case "l" : dir.x = speed; break;
        case "w" : dir.z = speed; break;
        case "b" : dir.z = -speed; break;
        case "H": dirmod2.x = speed; break;
        case "L": dirmod2.x = -speed; break;
        case "K": dirmod2.y = speed; break;
        case "J": dirmod2.y = -speed; break;
    }
    if(dir.x == 0 && dir.y == 0 && dir.z == 0 && dirmod2.x == 0 && dirmod2.y == 0 && dirmod2.z == 0){
        return
    }
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
    if(this.models){
        var model2 = this.models.filter((el) => {return el.id === 2})[0];
        var modelObject2 = this.modelObjects.filter((el) => {return el.id === 2})[0];
        if(model2 != undefined){
            var tr = modelObject2.getPlacementTransform();
            tr.elements[12] += dirmod2.x;
            tr.elements[13] += dirmod2.y;
            tr.elements[14] += dirmod2.z;
            modelObject2.setPlacementTransform(tr);
            model2.transform = tr;
            model2.globalOffset = modelObject2.getGlobalOffset();
            var affectedConnectors = this.connectors.filter((el)=>{return el.modelId === model2.id})
            affectedConnectors.forEach((el)=>{el.start.x += dirmod2.x;
                                              el.start.y += dirmod2.y;
                                              el.start.z += dirmod2.z;
            })
            if(affectedConnectors.length > 0){
                this.updateMeshes()
                this.updateOptions();
            }
        }
    }
    viewer.impl.invalidate(true, true, true);
}
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
Event_listener.prototype.addModel = function(model, documento) {
    if(!this.models){
        this.models = []
    }
    if(!this.modelObjects){
        this.modelObjects = []
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
