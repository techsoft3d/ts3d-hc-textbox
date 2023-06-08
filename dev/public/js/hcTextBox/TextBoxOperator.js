import { TextBoxMarkupItem } from './TextBoxMarkupItem.js';
import { TextBoxManager } from './TextBoxManager.js';


/** This class represents an operator for creating and manipulating textboxmarkup items.*/

export class TextBoxOperator {

 /**
     * Creates a new TextBoxOperator object
     * @param  {WebViewer} viewer - Webviewer Object
     * @param  {TextBoxManager} textBoxManager -If null, the operator will create a new TextBoxManager object
     */    
    constructor(viewer, textBoxManager = null) {
        
        this._viewer = viewer;
        if (!textBoxManager) {
            this._textBoxManager = new TextBoxManager(this._viewer);
            this._viewer.markupManager.registerMarkupTypeManager("TextBox",  this._textBoxManager);
        }
        else {
            this._textBoxManager = textBoxManager;
        }

        this._allowCreation = 2;
        this._createMarkupItemCallback = null;

        this._mouseActivationCallback = null;

        // this._mouseActivationCallback = function(event) {
        //     return (event.getButton() == Communicator.Button.Left && event.shiftDown());
        // };
    }


  /**
     * Sets one of the three markup creation modes.  
     * 0 -  No text box creation is allowed.  
     * 1 -  The textbox is inserted on the next click, after that creation is disabled  
     * 2 -  A new textbox is inserted on every click on the model (default)  
     * @param  {number} creationMode - Creation Mode
     */
    setAllowCreation(creationMode) {
        this._allowCreation = creationMode;
    }


  /**
     * Retrieves the TextBoxManager object    
     * @return {TextBoxManager} - TextBoxManager object
     */    
    getTextBoxManager() {
        return this._textBoxManager;
    }

  /**
     * Sets callback for markup creation
     * @param  {callback} callback -Callback to use for markup creation
     */
    setCreateMarkupItemCallback(callback) {
        this._createMarkupItemCallback = callback;
    }

  /**
     * Sets callback for mouse button/keyboard combo for markup creation
     * @param  {callback} callback -Callback
     */
  setMouseActivationCallback(callback) {
        this._mouseActivationCallback = callback;
    }

    onMouseDown(event) {

        this._handled = false;
        if ((!this._mouseActivationCallback && event.getButton() == Communicator.Button.Left) ||
            (this._mouseActivationCallback && this._mouseActivationCallback(event))) {
            const markup = this._textBoxManager.pickMarkupItem(event.getPosition());
            if (markup && markup instanceof TextBoxMarkupItem) {
                if (markup.getPinned()) {
                    markup.unprojectTextAnchor();                    
                }
                this._offset = Communicator.Point2.subtract(event.getPosition(), this._viewer.view.projectPoint(markup.getSecondPoint()));
                this._dClickTime = new Date();
                this._activeMarkupItem = markup;
                this._handled = true;


            }
            else {
                if (this._allowCreation) {
                    this._addMarkupItem(event.getPosition());                 
                    if (this._allowCreation == 1) {
                        this._allowCreation = 0;
                    }

                }
            }
        }
        event.setHandled(this._handled);

    }
    onMouseMove(event) {
        this._dClickTime = null;

        event.setHandled(this._handled);
        if (this._activeMarkupItem !== null && this._handled) {
            this._updateActiveMarkupItem(event.getPosition());
        }
    }

    onMouseUp(event) {

        if (this._dClickTime !== null) {
                this._activeMarkupItem.select();

        }
        this._dClickTime = null;
        event.setHandled(this._handled);
        this._activeMarkupItem = null;
    }

    async _addMarkupItem(position) {
        const model = this._viewer.model;
        const config = new Communicator.PickConfig(Communicator.SelectionMask.Face);
        const selectionItem = await this._viewer.view.pickFromPoint(position, config);
        if (selectionItem === null || !!selectionItem.overlayIndex()) {
            return;
        }
        const nodeId = selectionItem.getNodeId();
        let selectionPosition = selectionItem.getPosition();
        const faceEntity = selectionItem.getFaceEntity();
        if (nodeId === null || selectionPosition === null || faceEntity === null) {
            return;
        }
        const parentNodeId = model.getNodeParent(nodeId);
        if (parentNodeId === null) {
            return;
        }

        if (!this._createMarkupItemCallback) {
            this._activeMarkupItem = new TextBoxMarkupItem(this._textBoxManager, selectionPosition);
        }
        else {
            this._activeMarkupItem = this._createMarkupItemCallback(this._textBoxManager, selectionPosition);
        }

        this._activeMarkupItem.setupPin(selectionItem.getPosition(),faceEntity.getNormal());

        this._textBoxManager.add(this._activeMarkupItem);

      
        this._offset = new Communicator.Point2(0,0);
        this._updateActiveMarkupItem(position);

        this._handled = true;
    }

    async _updateActiveMarkupItem(position) {
        if (this._activeMarkupItem === null) {
            return;
        }

        if (!this._activeMarkupItem._textHit) {
            if (!this._activeMarkupItem.getAllowFirstPointMove()) {
                return;
            }

            const model = this._viewer.model;
            const config = new Communicator.PickConfig(Communicator.SelectionMask.Face);
            const selectionItem = await this._viewer.view.pickFromPoint(position, config);
            if (selectionItem === null || !!selectionItem.overlayIndex()) {
                return;
            }
            const nodeId = selectionItem.getNodeId();
            const selectionPosition = selectionItem.getPosition();
            const faceEntity = selectionItem.getFaceEntity();
            let selectionSuccess = true;
            if (nodeId === null || selectionPosition === null || faceEntity === null) {
                selectionSuccess = false;
            }
            const parentNodeId = model.getNodeParent(nodeId);
            if (parentNodeId === null) {
                selectionSuccess = false;
            }

            if (!selectionSuccess) {
                let c = this._viewer.view.getCamera();
                let pos = c.getPosition();
                let tar = c.getTarget();
                let vec = Communicator.Point3.subtract(tar, pos).normalize();
                let cameraplane = Communicator.Plane.createFromPointAndNormal(this._activeMarkupItem.getSecondPoint(), vec);

                let out = new Communicator.Point3();
                let ray = this._viewer.view.raycastFromPoint(new Communicator.Point2(position.x, position.y));
                let res = null;
                res = cameraplane.intersectsRay(ray, out);
                if (res) {
                    this._activeMarkupItem.setFirstPoint(new Communicator.Point3(out.x, out.y, out.z));
                }
            }
            else {
                this._activeMarkupItem.setFirstPoint(selectionPosition);
            }
            this._textBoxManager.refreshMarkup();

            return;
        }

        let c = this._viewer.view.getCamera();
        let pos = c.getPosition();
        let tar = c.getTarget();
        let vec = Communicator.Point3.subtract(tar, pos).normalize();
        let cameraplane = Communicator.Plane.createFromPointAndNormal(this._activeMarkupItem.getSecondPoint(), vec);

        let out = new Communicator.Point3();
        let ray = this._viewer.view.raycastFromPoint(new Communicator.Point2(position.x - this._offset.x, position.y - this._offset.y));
        let res = null;
        res = cameraplane.intersectsRay(ray, out);
        if (res) {
            this._activeMarkupItem.setSecondPoint(new Communicator.Point3(out.x, out.y, out.z));
            this._textBoxManager.refreshMarkup();
        }
        
    }
}
