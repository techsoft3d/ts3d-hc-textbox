var myLayout;
var textBoxOperator;
async function msready() {



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
                    {
                        type: 'column',
                        width: 20,
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

    var viewermenu = [
        {
            name: 'Setup Basic Text Box',
            fun: function () {

                textBoxOperator = new hcTextBox.TextBoxOperator(hwv);
                const opHandle = hwv.operatorManager.registerCustomOperator(textBoxOperator);
                hwv.operatorManager.push(opHandle);

            }
        },
        {
            name: 'Setup Text Box with Title Bar',
            fun: function () {
                          
                textBoxOperator = new hcTextBox.TextBoxOperator(hwv);
//                textBoxOperator.setAllowCreation(1);
                const opHandle = hwv.operatorManager.registerCustomOperator(textBoxOperator);
                hwv.operatorManager.push(opHandle);
                new TextBoxTitleBar(textBoxOperator.getTextBoxManager(), textBoxOperator);

            }
        },   
        {
            name: 'Setup Custom Text Box',
            fun: function () {
                          
                textBoxOperator = new hcTextBox.TextBoxOperator(hwv);                
//                textBoxOperator.setAllowCreation(1);
                const opHandle = hwv.operatorManager.registerCustomOperator(textBoxOperator);
                hwv.operatorManager.push(opHandle);
                textBoxOperator.setCreateMarkupItemCallback(createMarkupItemCallback);


            }
        },             
        {
            name: 'Create Text Box',
            fun: function () {
            
                textBoxOperator.setAllowCreation(1);
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