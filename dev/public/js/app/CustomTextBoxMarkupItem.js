import { TextBoxMarkupItem } from '../hcTextBox/TextBoxMarkupItem.js';


export class CustomTextBoxMarkupItem extends TextBoxMarkupItem {



    constructor(textBoxManager, firstPoint, secondPoint = null,secondPointRel = null,fontStyle = "monospace", fontSize = "12px", backgroundColor =  new Communicator.Color(238,243,249),
         circleColor = new Communicator.Color(128,128,255), circleRadius = 4.0, maxWidth = 300, pinned = false, extraDiv = null,uniqueid = null, userdata = null, checkVisibility = false, showLeaderLine = true) {
        super(textBoxManager, firstPoint, secondPoint,secondPointRel,fontStyle, fontSize, backgroundColor,circleColor, circleRadius, maxWidth, pinned, extraDiv,uniqueid, userdata, checkVisibility, showLeaderLine);
    }


    _setupTextDiv() {
        let html = "";
        // html += '<div id="' + this._uniqueid + '" style="z-index:1;width:500px;height:500px;display:flex;outline-style:solid;outline-width:2px;position: absolute;">';
        // html += '</div>';

        html += '<div id="' + this._uniqueid + '" style="z-index:1;display:flex;opacity:1.0;outline-style:solid;outline-width:2px;position: absolute;';  //set opacity to 1.0 initially here to avoid initial flicker on creation
        html += 'top:0px; left: 0px;outline-color: rgb(76, 135, 190);background-color: rgb(' + this._backgroundColor.r + ',' + this._backgroundColor.g + ',' + this._backgroundColor.b + ');">';
        html += '<textarea autofocus style="margin: 1px 0px 3px 3px; resize: auto;font-family:' + this._font + ';font-size:' + this._fontSize + ';height:' + (parseInt(this._fontSize) + 3) + 'px;position: relative;outline: none;border: none;word-break: break-word;padding: 0 0 0 0;background-color: transparent;width: 300px;height:200px;flex-grow: 1;overflow: auto;"></textarea>';
        html += '</div>';


        let _this = this;
        $(this._viewer.getViewElement().parentElement).append(html);

        this._textBoxDiv = $("#" + this._uniqueid);
        this._textBoxText = $(this._textBoxDiv).children()[0];

        new ResizeObserver(function () {
            _this._textBoxManager.refreshMarkup();
        }).observe(this._textBoxText);

    }

    _adjustTextBox() {

       return;
    }



    _getDivDimensions() {
        
        return ({width:$(this._viewer.getViewElement()).outerWidth(),height:$(this._viewer.getViewElement()).outerHeight()});
    }

  
}
