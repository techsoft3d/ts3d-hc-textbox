class TextBoxTitleBar {
    constructor(manager, operator, callback  = null) {

        let _this = this;
        operator.setCreateMarkupItemCallback(function (manager, pos) { return _this.createMarkupItemCallback(manager, pos); });
        this.textBoxManager = manager;
        this.textBoxOperator = operator;
        this._markupItemcallback = callback;
    }

    
    createExtraDiv(text) {
        let html = "";
        html += '<div style="white-space: nowrap;overflow:hidden;pointer-events:none;max-width:300px;position:absolute;left:0px;top:-18px;min-width:50px;width:inherit;height:15px;';
        html += 'outline-width:inherit;outline-style:solid;background-color:white;background: white;font-size:12px;font-weight:bold"><div style="overflow:hidden;width:calc(100% - 38px)">' + text + '</div>';
        html += '<div title = "Delete" style="pointer-events:all;position:absolute;right:0px;top:0px;width:10px;font-size:10px;outline-style:solid;outline-width:1px;padding-left:1px;height:inherit;cursor:pointer">&#x2715</div>';
        html += '<div title = "Unpin" style="pointer-events:all;position:absolute;right:13px;top:0px;width:10px;font-size:10px;outline-style:solid;outline-width:1px;padding-left:1px;height:inherit;cursor:pointer"><span style="pointer-events:none;height:7px;width:7px;top:4px;left:2px;position:absolute;outline-color:black;outline-style:solid;outline-width:1px;border-radius:50%;display:inline-block;background-color:black"></span></div>';
        html += '<div  title = "Activate Visiblity Test" title = "Unpin" style="opacity:0.3;pointer-events:all;position:absolute;right:26px;top:0px;width:10px;font-size:10px;outline-style:solid;outline-width:1px;padding-left:1px;height:inherit;cursor:pointer">';
        html += '<div style="pointer-events:none;position:absolute;width:3px;height:3px;border:solid 1px #000;border-radius:50%;left:3px;top:5px;"></div><div style="pointer-events:none;position:absolute;width:7px;height:7px;border:solid 1px #000;border-radius:75% 15%;transform:rotate(45deg);left:1px;top:3px"></div></div>';
        html += '</div>';

        let _this = this;

        let test = $(html);
        $("body").append(test);
        let test2 = $(test).children()[1];
        $(test2).on("click", (e) => {
            _this.textBoxManager.delete(e.target.parentElement.parentElement.id);
            _this.textBoxManager.getByID(e.target.parentElement.parentElement.id);
        });


        let test3 = $(test).children()[2];
        $(test3).on("click", (e) => {
            let markup = _this.textBoxManager.getByID(e.target.parentElement.parentElement.id);
            markup.setPinned(!markup.getPinned());
            _this.updatePinned(markup);
        });

        let test4= $(test).children()[3];
        $(test4).on("click", (e) => {
            let markup = _this.textBoxManager.getByID(e.target.parentElement.parentElement.id);
            markup.setCheckVisibility(!markup.getCheckVisibility());
            _this.updateVisiblityTest(markup);
        });
        return test;
    }

    createMarkupItemCallback(manager, pos) {
        if (this._markupItemcallback) {
            return this._markupItemcallback(manager, pos);
        }
        else {
            let extradiv = this.createExtraDiv("");
            let backgroundColor = new Communicator.Color(200, 200, 200);
            let markup = new hcTextBox.TextBoxMarkupItem(manager, pos, undefined, undefined, undefined, undefined, backgroundColor,
                undefined, undefined, undefined, true, extradiv, undefined, null, false);
            return markup;
        }

    }

    updatePinned(markup) {

        let pinnedPart = $(markup.getExtraDiv()).children()[2];
        if (markup.getPinned()) {
            $($(pinnedPart).children()[0]).css("background-color", "black");
            $(pinnedPart).prop('title', 'Unpin');
        }
        else {
            $($(pinnedPart).children()[0]).css("background-color", "white");
            $(pinnedPart).prop('title', 'Pin');
        }
    }


    updateVisiblityTest(markup) {

        let pinnedPart = $(markup.getExtraDiv()).children()[3];
        if (markup.getCheckVisibility()) {
            $(pinnedPart).css("opacity", "1.0");
            $(pinnedPart).prop('title', 'Deactivate Visiblity Test');
        }
        else {
            $(pinnedPart).css("opacity", "0.3");
            $(pinnedPart).prop('title', 'Activate Visiblity Test');
        }
    }
}