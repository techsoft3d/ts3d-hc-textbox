import { PinUtility } from './PinUtility.js';

/** This class represents a single textbox markup element.*/

export class TextBoxMarkupItem extends Communicator.Markup.MarkupItem {
    /**
     * Creates a markup item from a previously serialized JSON object
     * @param  {TextBoxManager} textBoxManager - The manager that will own this markup item
     * @param  {json} json - The JSON object to deserialize
     * @return {TextBoxMarkupItem} Markup Item
     */

    static fromJson(textBoxManager,json) {
        let config = {          
            secondPoint : Communicator.Point3.fromJson(json.secondPoint),
            secondPointRel : Communicator.Point2.fromJson(json.secondPointRel),
            font : json.font,
            fontSize : json.fontSize,
            backgroundColor : Communicator.Color.fromJson(json.backgroundColor),
            circleColor : Communicator.Color.fromJson(json.circleColor),
            circleRadius : json.circleRadius,
            maxWidth : json.maxWidth,
            fixed : json.fixed,
            extraDiv : json.extraDiv ? json.extraDiv : null,
            uniqueid : json.uniqueid,
            userdata : json.userdata,
            showLeaderLine: json.showLeaderLine,         
            allowFirstPointMove: json.allowFirstPointMove,
            allowSecondPointMove: json.allowSecondPointMove,
            hasPin: json.hasPin,
            pinSphereColor : Communicator.Color.fromJson(json.pinSphereColor),
            pinStemColor : Communicator.Color.fromJson(json.pinStemColor)
        };

        let markup = new TextBoxMarkupItem(textBoxManager, Communicator.Point3.fromJson(json.firstPoint),config);
        markup.setText(decodeURIComponent(json.text));
        markup.setCheckVisibility(json.checkVisibility);
        markup.deselect();
        return markup;
    }

    static _svgPointString(a) {
        let b = "";
        for (let c = 0; c < a.length; c++) 
            c && (b += " "),
            b += a[c].x + "," + a[c].y;
        return b;
    }


  /**
     * Creates a new TextBoxManager object
     * @param  {TextBoxManager} textBoxManager - The manager that will own this markup item
     * @param  {Point3} firstPoint - The position of insertion point on the model
     * @param  {Object} config - Text Box Configuration:
     *  secondPoint - The position of the textbox in relation to the insertion point  
     *  secondPointRel - A normalized 2D point that is used if the position of the textbox is fixed  
     *  fontStyle - The font used for the textbox text  
     *  fontSize - The font size used for the textbox text  
     *  backgroundColor - The background color of the textbox  
     *  circleColor - The color of the circle that is rendered at the insertion point  
     *  circleRadius - The radius of the circle that is rendered at the insertion point  
     *  maxWidth - The maximum width of the textbox  
     *  fixed - If true, the textbox will be fixed in position  
     *  extraDiv - Extra div text to be added to the textbox  
     *  uniqueid - Id of Markup Element  
     *  userdata - User data to be stored with the markup element  
     *  checkVisibility - If true, the textbox will be hidden if the insertion point is not visible  
     *  showLeaderLine - If true, the textbox will have a leader line  
     *  hasPin - If true, the textbox will have a 3d pin object
     *  allowFirstPointMove - If true, the insertion point can be moved
     *  allowSecondPointMove - If true, the textbox can be moved
     */    
    constructor(textBoxManager,firstPoint,config) {

        super();
        this._textBoxManager = textBoxManager;
        this._viewer = textBoxManager._viewer;
        this._font = config && config.fontStyle ? config.fontStyle : "monospace";
        this._fontSize = config && config.fontSize ? config.fontSize : "12px";
        this._created = true;
        if (config && config.uniqueid) {
            this._uniqueid = config.uniqueid;
        }
        else {
            this._uniqueid = this._generateGUID();
        }
        this._backgroundColor = config && config.backgroundColor ? config.backgroundColor : new Communicator.Color(238,243,249);
        this._circleColor = config && config.circleColor ? config.circleColor : new Communicator.Color(128,128,255);
        this._circleRadius = config && config.circleRadius ? config.circleRadius : 4.0;
        
        this._pinSphereColor = config && config.pinSphereColor ? config.pinSphereColor : new Communicator.Color(255,255,255);
        this._pinStemColor = config && config.pinStemColor ? config.pinStemColor : new Communicator.Color(0,0,0);

        
        this._firstPoint = firstPoint.copy();
        this._allowEditing = true;
        this._extraDiv =  config && config.extraDiv ? config.extraDiv : null;
        this._userdata = config && config.userdata ? config.userdata : null;

        this._selected = false;
        
        this._textHit = true;
        this._maxWidth = config && config.maxWidth ? config.maxWidth : 300;

        this._fixed = config && config.fixed ? config.fixed : false;
        this._checkVisibility = config && config.checkVisibility ? config.checkVisibility : false;
        this._lineGeometryShape = new Communicator.Markup.Shape.Polyline();
        this._circleGeometryShape = new Communicator.Markup.Shape.Circle();

        if (config && config.secondPoint != null) {
            this._secondPoint = config.secondPoint.copy();
        }
        else {
            this.setSecondPoint(firstPoint.copy());
        }

        if (config && config.secondPointRel != null) {
            this._secondPointRel = config.secondPointRel.copy();
        }

        this._initialize();
        this._hidden = false;
        this._showLeaderLine = config && config.showLeaderLine ? config.showLeaderLine : true;
        this._hasPin = config && config.hasPin ? config.hasPin : false;
        this._pinSize = config && config.pinSize ? config.pinSize : 0.025;
        this._allowFirstPointMove = config && config.allowFirstPointMove ? config.allowFirstPointMove : true;
        this._allowSecondPointMove = config && config.allowSecondPointMove ? config.allowSecondPointMove : true;
    }

     /**
     * Determines if the provided nodeid is part of the note-pin geometry
     * @param  {nodeid} nodeid - Node Id
     * @return {boolean} - True if the nodeid is part of the note-pin geometry, false otherwise
     */
    isPinGeometry(nodeid) {
        if (!this._hasPin) {
            return false;
        }
        if (this._stemID == nodeid || this._sphereID == nodeid) {
            return true;
        }
        return false;
    }


    /**
     * Returns true if first point can be moved
     * @return {boolean} - True if first point can be moved, false otherwise
     */    
    getAllowFirstPointMove() {
        return this._allowFirstPointMove;
    }

     /**
     * Returns true if second point can be moved
     * @return {boolean} - True if second point can be moved, false otherwise
     */    

    getAllowSecondPointMove() {
        return this._allowSecondPointMove;
    }

    

    async setupPin(position, normal) {
        if (this._hasPin) {
            let matrix = PinUtility.createPinTransformationMatrix(position,normal,this._pinSize);
            this._stemID = await PinUtility.createPinStemInstance(this._viewer, matrix,this._pinStemColor);
            this._sphereID = await PinUtility.createPinSphereInstance(this._viewer, matrix, this._pinSphereColor);
            let pinBounding = await this._viewer.model.getNodeRealBounding(this._sphereID);
            this._firstPoint =  pinBounding.center();
            this._secondPoint =  pinBounding.center();
            this._allowFirstPointMove = false;
        }
    }


    /**
     * Shows the markup (if hidden)
     */    
    show() {
        if (this._hidden) { 
            this._hidden = false;        
        }
    }

    /**
     * Hides the markup (if visible)
     */    
    hide() {
        if (!this._hidden) {
            this._hidden = true;           
        }
    }

    /**
     * Retrieves the markup's hidden state
     * @return {boolean} - True if the markup is hidden, false otherwise
     */    
    getHidden() {
        return this._hidden;
    }

    /**
     * Sets if the markup should be hidden if the insertion point is not visible
     * @param  {boolean} check - True if the markup should be hidden if the insertion point is not visible
     */
    setCheckVisibility(check) {
        this._checkVisibility = check;
        this._textBoxManager.updateVisibilityList();
        if (this._textBoxManager.getMarkupUpdatedCallback()) {
            this._textBoxManager.getMarkupUpdatedCallback()(this);
        }
    }

    /**
     * Retrieves the markup's check visibility state     
     * @return {boolean} - True if the markup will be hidden if the insertion point is not visible, false otherwise
     */
    getCheckVisibility() {
        return this._checkVisibility;
    }

    /**
       * Retrieves the markup's user data
       * @return {json} - The markup's user data
       */
    getUserData() {
        return this._userdata;
    }

    /**
    * Retrieves the markup's selected state
    * @return {boolean} - True if the markup is selected, false otherwise
    */
    getSelected() {
        return this._selected;
    }


    /**
    * Sets if text editing is allowed
    * @param  {boolean} allow - True if text editing is allowed, false otherwise
    */
    setAllowEditing(allow) {
        this._allowEditing = allow;
    }

 /**
    * Retrieves the markup's allow editing state
    * @return {boolean} - True if text editing is allowed, false otherwise
    */
    getAllowEditing() {
        return this._allowEditing;
    }


    /**
    * Deletes the markup
    */
    destroy() {
        $(this._textBoxDiv).remove();
        if (!this._textBoxManager.getUseMarkupManager()) {
            $(this._svgElement).remove();
        }

        if (this._hasPin) {
            this._viewer.model.deleteNode(this._sphereID);
            this._viewer.model.deleteNode(this._stemID);
        }
    }

    refreshText() {
        this._adjustTextBox();
        this._textBoxManager.refreshMarkup();
    }

 /**
    * Sets the markup's text
    * @param  {text} text - The text to set
    */
    setText(text) {
        $(this._textBoxText).val(text);
        this._adjustTextBox();
        this._textBoxManager.refreshMarkup();
    }


    setMarkupId(markupid) {
        this._markupId = markupid;
    }

    getMarkupId() {
        return this._markupId;
    }


 /**
    * Retrieves the markup's unique id
    * @return {guid} - The markup's unique id
    */    
    getUniqueId() {
        return this._uniqueid;
    }


 /**
    * Returns a json representation of the markup
    * @return {json} - The json representation of the markup
    */    
    toJson() {
        let json = {
            "uniqueid": this._uniqueid,
            "font": this._font,
            "fontSize": this._fontSize,
            "backgroundColor": this._backgroundColor.toJson(),
            "circleColor": this._circleColor.toJson(),
            "circleRadius": this._circleRadius,
            "firstPoint": this._firstPoint.toJson(),
            "secondPoint": this._secondPoint.toJson(),
            "secondPointRel": this._secondPointRel.toJson(),
            "maxWidth": this._maxWidth,
            "fixed": this._fixed,
            "allowEditing": this._allowEditing,
            "text": this._textBoxText ? encodeURIComponent($(this._textBoxText).val()) : "",
            "userdata": this._userdata,
            "checkVisibility": this._checkVisibility,
            "showLeaderLine": this._showLeaderLine,
            "allowFirstPointMove": this._allowFirstPointMove,
            "allowSecondPointMove": this._allowSecondPointMove,
            "hasPin": this._hasPin,
            "pinSphereColor": this._pinSphereColor.toJson(),
            "pinStemColor": this._pinStemColor.toJson()
        };
        return json;
    }

    

 /**
    * Returns the markups extra div (if any)
    * @return {object} - The extra div
    */    
    getExtraDiv() {
        return this._extraTextDiv;
    }

  /**
     * Sets the markup's fixed state
     * @param  {boolean} fixed - True if the markup is fixed, false otherwise
     */    
    setFixed(fixed) {
        if (fixed != this._fixed) {
            if (this._fixed) {
                this.setSecondPoint(this._firstPoint);
            }
            this._textBoxManager.refreshMarkup();
            this._fixed = fixed;
            if (this._textBoxManager.getMarkupUpdatedCallback()) {
                this._textBoxManager.getMarkupUpdatedCallback()(this);
            }
        }
    }


 /**
    * Returns the markups fixed state
    * @return {boolean} - True if the markup is fixed, false otherwise
    */    
    getFixed() {
        return this._fixed;
    }



  /**
     * Sets the markup's background color
     * @param  {Color} color - The color to set
     */        
    setBackgroundColor(color) {
        this._backgroundColor = color;
        $(this._textBoxDiv).css("background-color", "rgb(" + color.r + "," + color.g + "," + color.b + ")");
    }


  /**
     * Sets the markup's circle color
     * @param  {Color} color - The color to set
     */        
    setCircleColor(color) {
        this._circleColor = color;
        this._textBoxManager.refreshMarkup();

    }

    draw() {
        if (this._hidden) {            
            $(this._textBoxDiv).css("display","none");
            // $(this._svgElement).css("display","none");
            // return;
        }
        else {
            $(this._textBoxDiv).css("display","flex");
            $(this._svgElement).css("display","block");
        }
        

        $(this._svgElement).empty();
        const renderer = this._viewer.markupManager.getRenderer();
        const view = this._viewer.view;
        this._lineGeometryShape.clearPoints();

        if (this._hasPin && !this._fixed) {
            (async () => {
                let pinBounding = await this._viewer.model.getNodeRealBounding(this._sphereID);
                this._firstPoint =  pinBounding.center();
                if (!this._allowSecondPointMove) {
                    this._secondPoint =  pinBounding.center();
                }
            })();
        }
        let p1 = Communicator.Point2.fromPoint3(view.projectPoint(this._firstPoint));
        this._lineGeometryShape.pushPoint(p1);
        this._circleGeometryShape.setCenter(p1);

        let dims = this._getDivDimensions();

        let p2;
        if (this._fixed) {
            p2 = new Communicator.Point2(this._secondPointRel.x * dims.width,this._secondPointRel.y * dims.height);
        }
        else {
            p2 = Communicator.Point2.fromPoint3(view.projectPoint(this._secondPoint));         
            this._secondPointRel = new Communicator.Point2(p2.x / dims.width, p2.y / dims.height);
        }


        let w = parseInt($(this._textBoxDiv).css("width"));
        let h = parseInt($(this._textBoxDiv).css("height"));
        let fsecond = new Communicator.Point2(0,0);


        if (p1.x <= p2.x) {
            fsecond.x = p2.x;
        }
        else if (p1.x >= p2.x + w) {
            fsecond.x = p2.x + w;
        }
        else {
            if (Math.abs(p1.x - (p2.x + w/2)) < w/4) {
                fsecond.x = p2.x + w/2;
            }
            else if (p1.x > p2.x + w/2) {
                fsecond.x = p2.x + w;
            }
            else {
                fsecond.x = p2.x;
            }
        }

        
        if (p1.y <= p2.y) {
            fsecond.y = p2.y;
        }
        else if (p1.y >= p2.y + h) {
            fsecond.y = p2.y + h;
        }
        else {
            if (Math.abs(p1.y - (p2.y + h/2)) < h/4) {
                fsecond.y = p2.y + h/2;
            }
            else if (p1.y > p2.y + h/2) {
                fsecond.y = p2.y + h;
            }
            else {
                fsecond.y = p2.y;
            }
        }

        if (this._showLeaderLine) {
            this._lineGeometryShape.pushPoint(fsecond);

            if (!this._textBoxManager.getUseMarkupManager()) {
                if (!this._hidden) {
                    this._addPolylineElement(this._lineGeometryShape);
                }
                if (!this._hasPin || !this._hidden) {
                    this._addCircleElement(this._circleGeometryShape);
                }
            }
            else {
                if (!this._hidden) {
                    renderer.drawPolyline(this._lineGeometryShape);
                }
                if (!this._hasPin || !this._hidden) {
                    renderer.drawCircle(this._circleGeometryShape);
                }
            }
        }


        $(this._textBoxDiv).css("top", p2.y + "px");
        $(this._textBoxDiv).css("left", p2.x + "px");
        if (this._created) {
            $(this._textBoxDiv).css("opacity","");
            this._created = false;           
        }
    }

    hit(point) {      
        
        let minx =  parseInt($(this._textBoxDiv).css("left"));
        let miny =  parseInt($(this._textBoxDiv).css("top"));
        let maxx = parseInt(minx) + parseInt($(this._textBoxDiv).css("width"));
        let maxy = parseInt(miny) + parseInt($(this._textBoxDiv).css("height"));

   
        if (!this._hidden) {
            if (point.x >= minx && point.x <= maxx &&
                point.y >= miny && point.y <= maxy) {
                    this._textHit = true;
                    return true;
            }

            if (this._extraTextDiv) {
                let pos = $(this._extraTextDiv).position();
                minx = minx + pos.left;
                miny = miny + pos.top;
                let maxx = minx + parseInt($(this._extraTextDiv).css("width"));
                let maxy = miny + parseInt($(this._extraTextDiv).css("height"));


                if (point.x >= minx && point.x <= maxx &&
                    point.y >= miny && point.y <= maxy) {
                //  this.deselect();
                    this._textHit = true;
                    return true;
                }
            }
        }


        if (!this._hasPin || !this._hidden) {
            let p1 = Communicator.Point2.fromPoint3(this._viewer.view.projectPoint(this._firstPoint));
            minx = p1.x - 7;
            miny = p1.y - 7;
            maxx = p1.x + 7;
            maxy = p1.y + 7;
            if (point.x >= minx && point.x <= maxx &&
                point.y >= miny && point.y <= maxy) {
                this._textHit = false;
              
                return true;
            }
        }
        this.deselect();
        return false;            
    }



  /**
     * Sets the position of the textbox in relation to the insertion point
     * @param  {Point3} point - The position of the textbox
     */        
    setSecondPoint(point) {
        this._secondPoint = point.copy();
        let dims = this._getDivDimensions();

        let p = this._viewer.view.projectPoint(this._secondPoint);
        this._secondPointRel = new Communicator.Point2(p.x / dims.width, p.y / dims.height);
        if (this._textBoxManager.getMarkupUpdatedCallback()) {
            this._textBoxManager.getMarkupUpdatedCallback()(this);
        }
        
    }

  /**
     * Sets the position of insertion point on the model
     * @param  {Point3} point - The position of the insertion point
     */        
  setFirstPoint(point) {
        this._firstPoint = point.copy();
        if (this._textBoxManager.getMarkupUpdatedCallback()) {
            this._textBoxManager.getMarkupUpdatedCallback()(this);
        }
        this._textBoxManager.updateVisibilityList();
    }

  /**
     * Retrieves the position of the insertion point
     * @return {Point3} Insertion point
     */
    getFirstPoint() {
        return this._firstPoint.copy();
    }


  /**
     * Retrieves the position of the text box
     * @return {Point3} Text Box Position
     */
    getSecondPoint() {
        return this._secondPoint.copy();
    }

    /**
        * Selects the markup
        */
    select() {
        if (this._allowEditing) {
            $(this._textBoxText).attr("disabled", false);
            $(this._textBoxText).focus();
            $(this._textBoxDiv).css("pointer-events", "auto");
        }
        $(this._textBoxDiv).css("outline-width", "3px");
        this._selected = true;
    }

    /**
        * Deselects the markup
        */
    deselect() {
        $(this._textBoxText).attr("disabled", true);
        $(this._textBoxDiv).css("pointer-events", "none");
        $(this._textBoxDiv).css("outline-width", "1px");
        this._selected = false;
    }


    unprojectTextAnchor() {
        let dims = this._getDivDimensions();
        this._secondPoint = this._viewer.view.unprojectPoint(new Communicator.Point2(this._secondPointRel.x * dims.width, this._secondPointRel.y * dims.height), 0.5);
        if (this._textBoxManager.getMarkupUpdatedCallback()) {
            this._textBoxManager.getMarkupUpdatedCallback()(this);
        }
    }


    _addPolylineElement(a) {

        let c = TextBoxMarkupItem._svgPointString(a.getPoints());
        let d = document.createElementNS('http://www.w3.org/2000/svg', "polyline");
        d.setAttributeNS(null, "points", c);
        d.setAttributeNS(null, "fill", "none");
        d.setAttributeNS(null, "stroke", 'rgb(0, 0, 0)');
        d.setAttributeNS(null, "stroke-width", "1");
        $(this._svgElement)[0].appendChild(d);
    }


    _addCircleElement(element) {
        let a = element.getCenter();
        let b = element.getRadius();
        let c = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        c.setAttributeNS(null, "cx", a.x.toString());
        c.setAttributeNS(null, "cy", a.y.toString());
        c.setAttributeNS(null, "r", b.toString());

        c.setAttributeNS(null, "fill", 'rgb(' + this._circleColor.r + ',' + this._circleColor.g + ',' + this._circleColor.b + ')');
        c.setAttributeNS(null, "fill-opacity", "1");

        c.setAttributeNS(null, "stroke", 'rgb(0, 0, 0)');
        c.setAttributeNS(null, "stroke-width", "1");
        $(this._svgElement)[0].appendChild(c);
    }

    _initialize() {
        this._lineGeometryShape.setStrokeWidth(1);
        this._circleGeometryShape.setFillColor(this._circleColor);
        this._circleGeometryShape.setRadius(this._circleRadius);
      
        this._setupTextDiv();
        
        if (this._extraDiv) {
            $(this._textBoxDiv).append(this._extraDiv);        
            this._extraTextDiv = $( this._textBoxDiv).children()[1];
        }

        this._setupSVGDiv();
        this.select();
    }

    _setupTextDiv() {
        let html = "";
        html += '<div id="' + this._uniqueid + '" style="z-index:1;max-width:' + this._maxWidth + 'px;opacity:1.0;display:flex;outline-style:solid;outline-width:2px;position: absolute;';
        html += 'top:0px; left: 0px;width:100px;outline-color: rgb(76, 135, 190);background-color: rgb(' + this._backgroundColor.r + ',' + this._backgroundColor.g + ',' + this._backgroundColor.b + ');">';
        html += '<textarea autofocus style="max-width:' + this._maxWidth + 'px;margin: 1px 0px 3px 3px; resize: none;font-family:' + this._font + ';font-size:' + this._fontSize + ';height:' + (parseInt(this._fontSize) + 3) + 'px;position: relative;outline: none;border: none;word-break: break-word;padding: 0 0 0 0;background-color: transparent;width: 100px;flex-grow: 1;overflow: hidden;"></textarea>';
        html += '</div>';

        if (!$("#measurecanvas").length) {
            $("body").append('<div style="display:none;position:absolute;background: white; z-index:1000"><canvas id="measurecanvas" width="420px" height="150px;"></canvas></div>');
            let ctxd = document.getElementById("measurecanvas").getContext('2d');
            ctxd.font = this._fontSize + " " + this._font;
        }

        let _this = this;
        $(this._viewer.getViewElement().parentElement).append(html);

        this._textBoxDiv = $("#" + this._uniqueid);
        this._textBoxText = $(this._textBoxDiv).children()[0];

        $(this._textBoxText).on('input', (event) => {

            this._adjustTextBox();
            if (this._textBoxManager.getMarkupUpdatedCallback()) {
                this._textBoxManager.getMarkupUpdatedCallback()(this);
            }
        });
    }

    _setupSVGDiv() {
        let html = "";

        if (!this._textBoxManager.getUseMarkupManager()) {
            this._svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this._viewer.getViewElement().parentElement.appendChild(this._svgElement);
            $(this._svgElement).css("position", "absolute");
            $(this._svgElement).css("pointer-events", "none");
            $(this._svgElement).css("width", "100%");
            $(this._svgElement).css("height", "100%");
        }

    }


    _adjustTextBox() {

        let maxvalues = this._calculateMaxTextWidth();
        $(this._textBoxDiv).css("width", maxvalues.width + "px");

        $(this._textBoxText).css("height", "0px");
        $(this._textBoxText).css("height",  $(this._textBoxText)[0].scrollHeight + "px");

        this._textBoxManager.refreshMarkup();

    }


    _calculateMaxTextWidth() {
        let ctxd = document.getElementById("measurecanvas").getContext('2d');
        let text = $(this._textBoxText).val();
      
        let textArray = text.split("\n");
        let rows = 0;
        let maxTextWidth = 0;
        
        for (let i = 0; i < textArray.length; i++) {

            let m = ctxd.measureText(textArray[i]);
           if (m.width >  maxTextWidth) {
                maxTextWidth = m.width;
            }
        }

        if (maxTextWidth  < 90) {
            maxTextWidth = 90;
        }
       
        return {width: maxTextWidth + 10};
    }

    _getDivDimensions() {
        
        return ({width:$(this._viewer.getViewElement()).outerWidth(),height:$(this._viewer.getViewElement()).outerHeight()});
    }

    _generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
