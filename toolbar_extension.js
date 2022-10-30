//extension that adds functionalities to the viewer toolbar
function Toolbar_extension(viewer, options){
    Autodesk.Viewing.Extension.call(this, viewer, options);
}
Toolbar_extension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);

Toolbar_extension.prototype.constructor = Toolbar_extension;

Toolbar_extension.prototype.load = function (){
    this.viewer.setLightPreset(6);
    this.viewer.setEnvMapBackground(true);
    this.viewer.fitToView();
    console.log("toolbar extension loaded");
    return true;
}

Toolbar_extension.prototype.unload = function (){
    console.log("toolbar extension unloaded");
    return true;
}

Toolbar_extension.prototype.onToolbarCreated = function (toolbar){
    var btn = new Autodesk.Viewing.UI.Button('env-button');
    var vi = this.viewer;
    btn.onClick = function(e){
        viewer.setEnvMapBackground(true);
    }
    btn.addClass('env-button');
    btn.setToolTip('environment button');

    var btn2 = new Autodesk.Viewing.UI.Button('not-env-button');
    btn2.onClick = function(e){
        viewer.setEnvMapBackground(false);
    }
    btn2.addClass('not-env-button');
    btn2.setToolTip('not environment button');

    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-toolbar');
    this.subToolbar.addControl(btn);
    this.subToolbar.addControl(btn2);

    toolbar.addControl(this.subToolbar);
}
