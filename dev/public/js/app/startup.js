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
                            width: 80,
                            componentState: { label: 'A' }
                        }],
                    },                  
                ],
            }]
    };



    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Viewer', function (container, componentState) {
        $(container.getElement()).append($("#content"));
    });


   

    myLayout.on('stateChanged', function () {
        if (hwv != null) {
            hwv.resizeCanvas();
          
        }
    });
    myLayout.init();

    var viewermenu = [        
        {
            name: 'Setup Text Box with Title Bar',
            fun: function () {
                          
                new TextBoxTitleBar(textBoxOperator.getTextBoxManager(), textBoxOperator);

            }
        },   
        {
            name: 'Setup Custom Text Box',
            fun: function () {
                          
                textBoxOperator.setCreateMarkupItemCallback(createMarkupItemCallback);


            }
        },                                              
        
    ];

    $('#viewermenu1button').contextMenu(viewermenu, undefined, {
        'displayAround': 'trigger',
        'containment': '#viewerContainer'
    });

}


function createMarkupItemCallback(manager, pos) {
    let markup = new CustomTextBoxMarkupItem(manager, pos, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, true, undefined, undefined, null, false);
    return markup;

}