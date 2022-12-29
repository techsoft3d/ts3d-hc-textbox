/** This class represents a single textbox markup element.*/

export class TextBoxMarkupItem extends Communicator.Markup.MarkupItem {
    /**
     * Creates a markup item from a previously serialized JSON object
     * @param  {TextBoxManager} textBoxManager - The manager that will own this markup item
     * @param  {json} json - The JSON object to deserialize
     * @return {TextBoxMarkupItem} Markup Item
     */

    static fromJson(textBoxManager,json) {
        let markup = new TextBoxMarkupItem(textBoxManager, Communicator.Point3.fromJson(json.firstPoint), Communicator.Point3.fromJson(json.secondPoint), Communicator.Point3.fromJson(json.secondPointRel), 
        json.font, json.fontSize, Communicator.Color.fromJson(json.backgroundColor), Communicator.Color.fromJson(json.circleColor), json.circleRadius, 
        json.maxWidth, json.pinned,json.extraDiv ? json.extraDiv : null, json.uniqueid,json.userdata, json.showLeaderLine);
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
     * @param  {Point3} secondPoint - The position of the textbox in relation to the insertion point
     * @param  {Point2} secondPointRel - A normalized 2D point that is used if the position of the textbox is fixed
     * @param  {string} fontStyle - The font used for the textbox text
     * @param  {string} fontSize - The font size used for the textbox text
     * @param  {Color} backgroundColor - The background color of the textbox
     * @param  {Color} circleColor - The color of the circle that is rendered at the insertion point
     * @param  {number} circleRadius - The radius of the circle that is rendered at the insertion point
     * @param  {number} maxWidth - The maximum width of the textbox
     * @param  {boolean} pinned - If true, the textbox will be fixed in position
     * @param  {string} extraDiv - Extra div text to be added to the textbox
     * @param  {guid} uniqueid - Id of Markup Element
     * @param  {object} userdata - User data to be stored with the markup element
     * @param  {boolean} checkVisibility - If true, the textbox will be hidden if the insertion point is not visible
     * @param  {boolean} showLeaderLine - If true, the textbox will have a leader line
     */    
    constructor(textBoxManager, firstPoint, secondPoint = null,secondPointRel = null,fontStyle = "monospace", fontSize = "12px", backgroundColor =  new Communicator.Color(238,243,249),
         circleColor = new Communicator.Color(128,128,255), circleRadius = 4.0, maxWidth = 300, pinned = false, extraDiv = null,uniqueid = null, userdata = null, checkVisibility = false, showLeaderLine = true) {
        super();
        this._textBoxManager = textBoxManager;
        this._viewer = textBoxManager._viewer;
        this._font = fontStyle;
        this._fontSize = fontSize;
        this._created = true;
        if (uniqueid) {
            this._uniqueid = uniqueid;
        }
        else {
            this._uniqueid = this._generateGUID();
        }
        this._backgroundColor = backgroundColor;
        this._circleColor = circleColor;
        this._circleRadius = circleRadius;
        this._firstPoint = firstPoint.copy();
        this._allowEditing = true;
        this._extraDiv = extraDiv;
        this._userdata = userdata;

        this._selected = false;
        
        this._textHit = true;
        this._maxWidth = maxWidth;

        this._pinned = pinned;
        this._checkVisibility = checkVisibility;
        this._lineGeometryShape = new Communicator.Markup.Shape.Polyline();
        this._circleGeometryShape = new Communicator.Markup.Shape.Circle();

        if (secondPoint != null) {
            this._secondPoint = secondPoint.copy();
        }
        else {
            this.setSecondPoint(firstPoint.copy());
        }
        if (secondPointRel != null) {
            this._secondPointRel = secondPointRel.copy();
        }

        this._initialize();
        this._hidden = false;
        this._showLeaderLine = showLeaderLine;
    }

    /**
     * Shows the markup (if hidden)
     */    
    show() {
        if (this._hidden) { 
            this._hidden = false;
            $(this._textBoxDiv).css("display","flex");
            $(this._svgElement).css("display","block");
        }
    }

    /**
     * Hides the markup (if visible)
     */    
    hide() {
        if (!this._hidden) {
            this._hidden = true;
            $(this._textBoxDiv).css("display","none");
            $(this._svgElement).css("display","none");
        }
    }

    /**
     * Retrieves the markup's hidden state
     * @return {boolean} - True if the markup is hidden, false otherwise
     */    getHidden() {
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
            "pinned": this._pinned,
            "allowEditing": this._allowEditing,
            "text": this._textBoxText ? encodeURIComponent($(this._textBoxText).val()) : "",
            "userdata": this._userdata,
            "checkVisibility": this._checkVisibility,
            "showLeaderLine": this._showLeaderLine

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
     * Sets the markup's pinned state
     * @param  {boolean} pinned - True if the markup is pinned, false otherwise
     */    
    setPinned(pinned) {
        if (pinned != this._pinned) {
            if (this._pinned) {
                this.setSecondPoint(this._firstPoint);
            }
            this._textBoxManager.refreshMarkup();
            this._pinned = pinned;
            if (this._textBoxManager.getMarkupUpdatedCallback()) {
                this._textBoxManager.getMarkupUpdatedCallback()(this);
            }
        }
    }


 /**
    * Returns the markups pinned state
    * @return {boolean} - True if the markup is pinned, false otherwise
    */    
    getPinned() {
        return this._pinned;
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
            return;
        }

        $(this._svgElement).empty();
        const renderer = this._viewer.markupManager.getRenderer();
        const view = this._viewer.view;
        this._lineGeometryShape.clearPoints();
        let p1 = Communicator.Point2.fromPoint3(view.projectPoint(this._firstPoint));
        this._lineGeometryShape.pushPoint(p1);
        this._circleGeometryShape.setCenter(p1);

        let dims = this._getDivDimensions();

        let p2;
        if (this._pinned) {
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
                this._addPolylineElement(this._lineGeometryShape);
                this._addCircleElement(this._circleGeometryShape);
            }
            else {

                renderer.drawPolyline(this._lineGeometryShape);
                renderer.drawCircle(this._circleGeometryShape);
            }
        }


        $(this._textBoxDiv).css("top", p2.y + "px");
        $(this._textBoxDiv).css("left", p2.x + "px");
        if (this._created) {
            $(this._textBoxDiv).css("display","flex");
            this._created = false;           
        }
    }

    hit(point) {
        if (this._hidden) {
            return false;
        }

        let minx =  parseInt($(this._textBoxDiv).css("left"));
        let miny =  parseInt($(this._textBoxDiv).css("top"));
        let maxx = parseInt(minx) + parseInt($(this._textBoxDiv).css("width"));
        let maxy = parseInt(miny) + parseInt($(this._textBoxDiv).css("height"));

   
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



        let p1 = Communicator.Point2.fromPoint3(this._viewer.view.projectPoint(this._firstPoint));
        minx =  p1.x - 7;
        miny =  p1.y - 7;
        maxx =  p1.x + 7;
        maxy =  p1.y + 7;
        if (point.x >= minx && point.x <= maxx &&
            point.y >= miny && point.y <= maxy) {
                this._textHit = false;
                return true;
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
        html += '<div id="' + this._uniqueid + '" style="z-index:1;max-width:' + this._maxWidth + 'px;display:none;outline-style:solid;outline-width:2px;position: absolute;';
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
