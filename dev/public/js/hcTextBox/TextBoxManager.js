import { PinUtility } from './PinUtility.js';

/** This class manages all textbox markup elements.*/
export class TextBoxManager {
    /**
     * Creates a new TextBoxManager object
     * @param  {WebViewer} viewer - Webviewer Object
     * @param  {bool} useMarkupManager - Use markup manager to manage TextBoxMarkups
     */
    constructor(viewer, useMarkupManager = true) {
        this._viewer = viewer;
        this._markups = [];
        this._useMarkupManager = useMarkupManager;
        this._markupUpdatedCallback = null;

        PinUtility.createMeshes(viewer, 2,2);

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


    /**
       * Sets a callback that gets triggered when a markup is updated
       * @param  {callback} callback - callback function with the markup element as parameter
       */
    setMarkupUpdatedCallback(callback) {
        this._markupUpdatedCallback = callback;
    }

    /**
       * Retrieves the callback that gets triggered when a markup is updated
       * @return {callback} callback
       */
    getMarkupUpdatedCallback() {
        return this._markupUpdatedCallback;
    }

    getUseMarkupManager() {
        return this._useMarkupManager;
    }


    /**
        * Adds a new markup to the manager
        * @param  {TextBoxMarkupItem} markup - new TextBoxMarkupItem to add
        */
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
        for (let i = 0; i < this._markups.length; i++) {
            if (this._markups[i].getCheckVisibility()) {
                visibilities.push(this._markups[i].getFirstPoint());
                this.markupsToTestVisibility.push(this._markups[i]);
            }
        }
        this._viewer.view.setPointVisibilityTest(visibilities);
    }

    deleteAll() {
        for (let i = 0; i < this._markups.length; i++) {

            if (this.getMarkupUpdatedCallback()) {
                this.getMarkupUpdatedCallback()(this._markups[i], true);
            }
            this._viewer.markupManager.unregisterMarkup(this._markups[i].getMarkupId());
            this._markups[i].destroy();
        }
        this._markups = [];
    }

    /**
       * Deletes a markup item from the manager
       * @param  {guid} uniqueid - Id of Markup Element
       */
    delete(uniqueid) {
        for (let i = 0; i < this._markups.length; i++) {

            if (this._markups[i].getUniqueId() == uniqueid) {
                if (this.getMarkupUpdatedCallback()) {
                    this.getMarkupUpdatedCallback()(this._markups[i], true);
                }
                this._viewer.markupManager.unregisterMarkup(this._markups[i].getMarkupId());
                this._markups[i].destroy();
                this._markups.splice(i, 1);
                break;
            }
        }
    }

    /**
       * Retrieves a markup element given its unique id
       * @param  {guid} uniqueid - Id of Markup Element
       * @return {TextBoxMarkupItem} TextBoxMarkupItem or undefined
       */

    getByID(uniqueid) {
        for (let i = 0; i < this._markups.length; i++) {

            if (this._markups[i].getUniqueId() == uniqueid) {
                return this._markups[i];
            }
        }
    }

    /**
     * Retrieves the currently selected markup element       
     * @return {TextBoxMarkupItem} TextBoxMarkupItem or undefined
     */

    getSelected() {
        for (let i = 0; i < this._markups.length; i++) {

            if (this._markups[i].getSelected()) {
                return this._markups[i];
            }
        }

    }


    /**
     * Exports all markup elements  
     * @return {json} Array of json objects
     */
    exportMarkup() {
        let json = [];
        for (let i = 0; i < this._markups.length; i++) {
            json.push(this._markups[i].toJson());
        }
        return json;
    }


    /**
     * Redraws all markup elements
     */
    refreshMarkup() {
        if (this._useMarkupManager) {
            this._viewer.markupManager.refreshMarkup();
        }
        else {
            for (let i = 0; i < this._markups.length; i++) {
                this._markups[i].draw();
            }
        }
    }

    /**
       * Finds a markup element by a given 2D screenspace position
       * @param  {Point2} position - 2D screenspace position
       * @return {TextBoxMarkupItem} TextBoxMarkupItem or null
       */

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

   /**
       * Loads markup elements from a json array
       * @param  {json} json - Array of json objects representing markup
       */
   loadData(json) {
        for (let i = 0; i < json.length; i++) {
            let markup = TextBoxMarkupItem.fromJson(this, json[i]);
            markup.setAllowEditing(false);
            this.add(markup);
        }

        this.refreshMarkup();
    }

    isPinGeometry(nodeid) {
        for (let i = 0; i < this._markups.length; i++) {
            if (this._markups[i].isPinGeometry(nodeid)) {
                return this._markups[i];
            }
        }
        return false;
    }

    
    hideAll() {
        for (let i = 0; i < this._markups.length; i++) {
            this._markups[i].hide();           
        }
        this.refreshMarkup();
    }
}
