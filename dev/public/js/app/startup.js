var myLayout;
var textBoxOperator;
async function msready() {

    textBoxOperator = new hcTextBox.TextBoxOperator(hwv);
    const opHandle = hwv.operatorManager.registerCustomOperator(textBoxOperator);
    hwv.operatorManager.push(opHandle);
}

function startup()
{
    createUILayout();
} 

function createUILayout() {

    var config = {
        settings: {
            showPopoutIcon: false,
            showMaximiseIcon: true,
            showCloseIcon: false
        },
        content: [
            {
                type: 'row',
                content: [
                    {
                        type: 'column',
                        content: [{
                            type: 'component',
                            componentName: 'Viewer',
                            isClosable: false,
                            width: 83,
                            componentState: { label: 'A' }
                        }],
                    },
                    {
                        type: 'column',
                        width: 15,
                        height: 35,
                        content: [
                            {
                                type: 'component',
                                componentName: 'Settings',
                                isClosable: true,
                                height: 15,
                                componentState: { label: 'C' }
                            }                                                   
                        ]
                    },                  
                ],
            }]
    };



    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Viewer', function (container, componentState) {
        $(container.getElement()).append($("#content"));
    });

    myLayout.registerComponent('Settings', function (container, componentState) {
        $(container.getElement()).append($("#settingsdiv"));
    });

   

    myLayout.on('stateChanged', function () {
        if (hwv != null) {
            hwv.resizeCanvas();
          
        }
    });
    myLayout.init();

}


function createMarkupItemCallback(manager, pos, config) {  
    let myConfig = structuredClone(config);
    myConfig.pinned = true;
    let markup = new CustomTextBoxMarkupItem(manager, pos,myConfig);
    return markup;

}


function createMarkupItemCallbackQuill(manager, pos, config) {
    let markup = new QuillTextBoxMarkupItem(manager, pos, config);
    return markup;

}


function textBoxTypeChanged() {
    let type = $("#textBoxTypeSelect").val();

    if (type == "Minimal") {
        textBoxOperator.setCreateMarkupItemCallback(null);
    }
    else if (type == "Title Bar") {
        let titleBar = new TextBoxTitleBar(textBoxOperator.getTextBoxManager(), textBoxOperator);
    }
    else if (type == "Custom") {
        textBoxOperator.setCreateMarkupItemCallback(createMarkupItemCallback);
    }
    else if (type == "Quill") {
        textBoxOperator.setCreateMarkupItemCallback(createMarkupItemCallbackQuill);
    }
}

function switchAllowCreation() {
    textBoxOperator.setAllowCreation(document.getElementById('allowCreationCheck').checked ? 2 : 0);
}

function switchCreatePins() {
    if (document.getElementById('createPinsCheck').checked) {
        textBoxOperator.setMarkupConfig({hasPin:true});
    }
    else {
        textBoxOperator.setMarkupConfig({hasPin:false});
    }
}