class TextBoxTitleBar {
    constructor(manager, operator) {

        let _this = this;
        operator.setCreateMarkupItemCallback(function (manager, pos) { return _this.createMarkupItemCallback(manager, pos); });
        this.textBoxManager = manager;
        this.textBoxOperator = operator;
    }

    
    createExtraDiv(text) {
        let html = "";
        html += '<div style="white-space: nowrap;overflow:hidden;pointer-events:none;max-width:300px;position:absolute;left:0px;top:-18px;min-width:50px;width:inherit;height:15px;';
        html += 'outline-width:inherit;outline-style:solid;background-color:white;background: white;font-size:12px;font-weight:bold"><div style="overflow:hidden;width:calc(100% - 38px)">' + text + '</div>';
        html += '<div title = "Delete" style="pointer-events:all;position:absolute;right:0px;top:0px;width:10px;font-size:10px;outline-style:solid;outline-width:1px;padding-left:1px;height:inherit;cursor:pointer">&#x2715</div>';
        html += '<div title = "Unpin" style="pointer-events:all;position:absolute;right:12px;top:0px;width:10px;font-size:10px;outline-style:solid;outline-width:1px;padding-left:1px;height:inherit;cursor:pointer"><span style="pointer-events:none;height:7px;width:7px;top:4px;left:2px;position:absolute;outline-color:black;outline-style:solid;outline-width:1px;border-radius:50%;display:inline-block;background-color:black"></span></div>';
        html += '<div  title = "Activate Visiblity Test" title = "Unpin" style="pointer-events:all;position:absolute;right:24px;top:0px;width:10px;font-size:10px;outline-style:solid;outline-width:1px;padding-left:1px;height:inherit;cursor:pointer">';
        html += '<div style="opacity:0.3;pointer-events:none;position:absolute;width:3px;height:3px;border:solid 1px #000;border-radius:50%;left:3px;top:5px;"></div><div style="opacity:0.3;pointer-events:none;position:absolute;width:7px;height:7px;border:solid 1px #000;border-radius:75% 15%;transform:rotate(45deg);left:1px;top:3px"></div></div>';
        html += '</div>';

        let _this = this;

        let titlediv = $(html);
        $("body").append(titlediv);
        let deleteButton = $(titlediv).children()[1];
        $(deleteButton).on("click", (e) => {
            _this.textBoxManager.delete(e.target.parentElement.parentElement.id);
            _this.textBoxManager.getByID(e.target.parentElement.parentElement.id);
        });
     

        let pinnedButton = $(titlediv).children()[2];
        $(pinnedButton).on("click", (e) => {
            let markup = _this.textBoxManager.getByID(e.target.parentElement.parentElement.id);
            markup.setPinned(!markup.getPinned());
            _this.updatePinned(markup);
        });

        let visibilityButton= $(titlediv).children()[3];
        $(visibilityButton).on("click", (e) => {
            let markup = _this.textBoxManager.getByID(e.target.parentElement.parentElement.id);
            markup.setCheckVisibility(!markup.getCheckVisibility());
            _this.updateVisiblityTest(markup);
        });


        $(deleteButton).hover(
            function() { $( this).css("background-color", "lightgrey" ); }, function() { $( this).css("background-color", "white" );}
        );
        $(pinnedButton).hover(
            function() { $( this).css("background-color", "lightgrey" ); }, function() { $( this).css("background-color", "white" );}
        );
        $(visibilityButton).hover(
            function() { $( this).css("background-color", "lightgrey" ); }, function() { $( this).css("background-color", "white" );}
        );

        return titlediv;
    }

    createMarkupItemCallback(manager, pos) {
        let extradiv = this.createExtraDiv("");             
        let backgroundColor = new Communicator.Color(200, 200, 200);
        let markup = new hcTextBox.TextBoxMarkupItem(manager, pos, undefined, undefined, undefined, undefined, backgroundColor,
            undefined, undefined, undefined, true, extradiv, undefined, null, false);
        return markup;

    }

    updatePinned(markup) {

        let button = $(markup.getExtraDiv()).children()[2];
        if (markup.getPinned()) {
            $($(button).children()[0]).css("background-color", "black");
            $(button).prop('title', 'Unpin');
        }
        else {
            $($(button).children()[0]).css("background-color", "white");
            $(button).prop('title', 'Pin');
        }
    }


    updateVisiblityTest(markup) {

        let button = $(markup.getExtraDiv()).children()[3];
        if (markup.getCheckVisibility()) {
            $($(button).children()[0]).css("opacity", "1.0");
            $($(button).children()[1]).css("opacity", "1.0");
            $(button).prop('title', 'Deactivate Visiblity Test');
        }
        else {
            $($(button).children()[0]).css("opacity", "0.3");
            $($(button).children()[1]).css("opacity", "0.3");
            $(button).prop('title', 'Activate Visiblity Test');
        }
    }
}