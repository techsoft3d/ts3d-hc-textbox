export class TextBoxManager {

    constructor(viewer, useMarkupManager = true) {
        this._viewer = viewer;
        this._markups = [];
        this._useMarkupManager = useMarkupManager;
        this._markupUpdatedCallback = null;

        let _this = this;
        if (!this._useMarkupManager) {
            new ResizeObserver(function () {
                setTimeout(function () {
                    _this.refreshMarkup();
                }, 250);
            }).observe(this._viewer.getViewElement());


            this._viewer.setCallbacks({
                camera: function () {

                    _this.refreshMarkup();
                    setTimeout(function () {
                        _this.refreshMarkup();
                    }, 50);
                }
            });
        }
        this._viewer.setCallbacks({
            frameDrawn: function (cam, p) {
                for (let i = 0; i < _this._markups.length; i++) {
                    if (_this._markups[i].getCheckVisibility()) {
                        _this._markups[i].hide();
                    }
                }


                for (let i = 0; i < p.length; i++) {
                    if (_this.markupsToTestVisibility[p[i]].getCheckVisibility() && _this.markupsToTestVisibility[p[i]].getHidden()) {
                        _this.markupsToTestVisibility[p[i]].show();
                        _this.markupsToTestVisibility[p[i]].refreshText();
                    }
                }
            }
        });

    }

    setMarkupUpdatedCallback(callback) {
        this._markupUpdatedCallback = callback;
    }

    getMarkupUpdatedCallback() {
        return this._markupUpdatedCallback;
    }

    getUseMarkupManager() {
        return this._useMarkupManager;
    }

    add(markup) {
        this._markups.push(markup);
        if (this._useMarkupManager) {
            let uuid = this._viewer.markupManager.registerMarkup(markup);
            markup.setMarkupId(uuid);        
        }
        this.updateVisibilityList();
        
    }

    updateVisibilityList() { 

        let visibilities = [];
        this.markupsToTestVisibility = [];
        for (let i=0;i<this._markups.length;i++) {
            if (this._markups[i].getCheckVisibility()) {
                visibilities.push(this._markups[i].getFirstPoint());
                this.markupsToTestVisibility.push(this._markups[i]);
            }
        }
        this._viewer.view.setPointVisibilityTest(visibilities);
    }
    
    delete(uniqueid) {
        for (let i=0;i<this._markups.length;i++) {

            if (this._markups[i].getUniqueId() == uniqueid) {    
                if (this.getMarkupUpdatedCallback()) {
                    this.getMarkupUpdatedCallback()(this._markups[i], true);
                }        
                this._viewer.markupManager.unregisterMarkup(this._markups[i].getMarkupId());
                this._markups[i].destroy();
                this._markups.splice(i,1);
                break;
            }
        }      
    }

    getByID(uniqueid) {
        for (let i=0;i<this._markups.length;i++) {

            if (this._markups[i].getUniqueId() == uniqueid) {            
                return this._markups[i];                
            }
        }      
    }

    getSelected() {
        for (let i=0;i<this._markups.length;i++) {

            if (this._markups[i].getSelected()) {            
                return this._markups[i];                
            }
        }      

    }
    
    exportMarkup() {
        let json = [];
        for (let i=0;i<this._markups.length;i++) {
            json.push(this._markups[i].toJson());
        }
        return json;
    }

       
    refreshMarkup() {
        if (this._useMarkupManager) {
            this._viewer.markupManager.refreshMarkup();
        }
        else {
            for (let i=0;i<this._markups.length;i++) {
                this._markups[i].draw();
            }
        }
    }

    pickMarkupItem(position) {
        if (this._useMarkupManager) {
            return this._viewer.markupManager.pickMarkupItem(position);
        }
        else {

            for (let i = 0; i < this._markups.length; i++) {
                if (this._markups[i].hit(position)) {
                    return this._markups[i];
                }
            }
            return null;
        }
    }

    loadData(json) {
        for (let i=0;i<json.length;i++) {
            let markup = TextBoxMarkupItem.fromJson(this, json[i]);
            markup.setAllowEditing(false);
            this.add(markup);
        }

        this.refreshMarkup();
    }
}
