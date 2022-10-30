function Event_listener(viewer, options){
    Autodesk.Viewing.Extension.call(this, viewer, options)
}

Event_listener.prototype = Object.create(Autodesk.Viewing.Extension.prototype);

Event_listener.prototype.constructor = Event_listener;

Event_listener.prototype.load = function (){
    console.log('event extension loaded');
    this.onSelection = this.onSelectionEvent.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelection);

    this.onExplode = this.onExplodeEvent.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.EXPLODE_CHANGE_EVENT, this.onExplode);

    return true;
}

Event_listener.prototype.unload = function (){
    console.log('event extension unloaded');
    return true;
}

Event_listener.prototype.onSelectionEvent = function(event){
    var txt = document.getElementById('listener');
    var cursel = this.viewer.getSelection();
    txt.innerText = 'cose: ' + cursel.length;
}

Event_listener.prototype.onExplodeEvent = function(event){
    var txt = document.getElementById('listener2');
    var expl = event.scale;
    txt.innerText = 'esploso con scala: ' + expl;
}

