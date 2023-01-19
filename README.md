# TextBox Markup

## Version Update (0.2.1) 
*  Quill Editor Support added to demo

## Overview
This set of classes implements a new, flexible markup type for adding text notes to a model. The base functionality adds a textbox that automatically resizes with the text entered, and a callout line pointing to the original insertion point. The text box either rotates with the model or stays fixed. Additionally, the markup can be set to automatically hide when the insertion point is invisible. It is easy to extend the functionality via subclassing and callbacks.

For questions/feedback please post in our [forum](https://forum.techsoft3d.com/) or send an email to guido@techsoft3d.com. To learn more about the HOOPS Web Platform and for a 60 day trial go to https://www.techsoft3d.com/products/hoops/web-platform.


## GitHub Project

The public github project can be found here:  
https://github.com/techsoft3d/ts3d-hc-textbox


## Install

* Clone above GitHub project (libraries can be found in the ./dist folder)
* Add library to your application with a script tag or use module version
```
<script src="./js/hcTextBox.min.js"></script>
```
If you are planning to fork the project and make changes to the core library make sure to run `npm install` in the root folder to install required dependencies.


## Documentation
Live Documentation can be found here: [https://techsoft3d.github.io/ts3d-hc-textbox/](https://techsoft3d.github.io/ts3d-hc-textbox/)

## Basic Usage

Below is the minimum code required to activate the new markup type. This code creates and registers an instance of the new TextBox operator that manages the creation and editing of textboxes. By default, this operator creates a new textbox when left clicking on the model and allows the users to select and drag existing textboxes across the screen.


```
  textBoxOperator = new hcTextBox.TextBoxOperator(hwv);
  const opHandle = hwv.operatorManager.registerCustomOperator(textBoxOperator);
  hwv.operatorManager.push(opHandle);
```

## Demo

For a live demo of the this library please check out the [HOOPS Communicator 3D Sandbox](https://3dsandbox.techsoft3d.com) which includes the textbox functionality as a new markup type in collaboration mode. Each note created is fully synced with all connected clients. There is also a demo available as part of this project you can run directly from the dev/public folder (http://127.0.0.1:5500/dev/public/viewer.html?scs=models/microengine.scs). Initially, the basic textbox markup is active. The "..." menu demonstrates three additional ways to customize the textbox markup, including an implementation that uses the popular open source rich text editor [Quill](https://quilljs.com/).

Looking through the code of this demo should help you understand some of the concepts mentioned below.


## Customizing TextBox Creation

### Creation Modes
The textbox operator supports three markup creation modes which can be set via the `setAllowCreation` function.

0 -  No text box creation is allowed.  
1 -  The textbox is inserted on the next click, after that creation is disabled  
2 -  A new textbox is inserted on every click on the model (default)  

To play well with other operators it makes sense to control the textbox creation by using mode "1". In this case, after a single text box is created the operator "flips" back to mode 0 until setAllowCreation() is called again. 

### Manual Creation
You can also use the operator only for manipulating existing textbox markup and create the textboxes directly. See below for the minimal code required to do that. Of course in this case it is your responsibility to calculate a suitable initial insertion position. 

```
let textBoxManager = myTextBoxOperator.getTextBoxManager();
let markup = new TextBoxMarkupItem(this._textBoxManager, selectionPosition);
textBoxManager.add(markup);
```

### Customizing Mouse Button Behavior

You can customize which mouse/keyboard button combination constitute a "click" on the model. By default, this is the left mouse button. You can change this by supplying a callback to the `setMouseActivationCallback` function. See below for code that modifies the default behavior to only allow textbox creation when the left mouse button is pressed while holding down the shift key:

```
myTextBoxOperator.setMouseActivationCallback(function(event) {
      return (event.getButton() == Communicator.Button.Left && event.shiftDown());
    }
  );

```

### Handling Markup creation in the TextBox operator
The textbox markup has a lot of different properties that can be set during creation. In order to set those properties when markup creation is handled by the TextBox operator there is a callback that can be set via the `setCreateMarkupCallback` function. This callback is triggered when a new markup is created and allows you to set the properties of the markup before it is added in the constructor. See below for an example that sets the background color of the textbox to red:

```
    function createMarkupItemCallback(manager, pos) {
        let backgroundColor = new Communicator.Color(255, 0, 0);
        let markup = new hcTextBox.TextBoxMarkupItem(manager, pos, undefined, undefined, undefined, undefined, backgroundColor,
            undefined, undefined, undefined, true, undefined, undefined, null, false);
        return markup;
    }

  myTextBoxOperator.setCreateMarkupItemCallback(function (manager, pos) { return createMarkupItemCallback(manager, pos); });

```

## Adding a Title Bar or other content to the Text Box.
During creation of a new markup element you can add an extra "div" element to the markup that will be displayed alongside the standard textbox under the main textbox div element. This could be a title bar or other UI elements. Its only requirements is that it needs a fixed with and height so that the textbox can take it into account in a hit-test. For an example of how to add a title-bar, please see the code in the dev/public/js/app/TextBoxTitleBar.js of the project.

## Customizing the TextBox Markup via Subclassing
You can also subclass from TextBoxMarkupItem to completely change its default behavior. For an example, see the code in the dev/public/js/app/CustomTextBoxMarkupItem.js of the project, which changes the textbox to be manually resizable with a fixed startup size. To use your new class simply instantiate it in the 'setCreateMarkupItemCallback' of the operator or create the markup manually as explained above.

## Markup Manager Integration
By default, the MarkupManager in HOOPS Communicator will manage the textbox markup items, which means it will trigger a redraw as necessary and render the SVG into its internal drawing layer. It will also automatically serialize the textbox markup alongside its internal markup types. However it is possible to bypass the markup manager by passing false in the second parameter of the TextBox manager constructor. In this case the markup manager is not used and the TextBoxMarkup is directly managed by the TextBoxManager. This can be useful if you want to separate the textbox markup more cleanly from the other internal markup types in HOOPS Communicator. For example, this mode is used in the Collaboration Library integration.

## Collaboration Support
Via a plugin to the [Collaboration Library](https://github.com/techsoft3d/ts3d-hc-collabServer) for HOOPS Communicator, the textbox markup is fully supported in a collaborative environment as demonstrated in the [HOOPS Communicator 3D Sandbox](https://3dsandbox.techsoft3d.com). This plugin is included in the [Collaboration Library](https://github.com/techsoft3d/ts3d-hc-collabServer) project and can be found in the dev/public/js/collabPlugins folder. Please see the documentation of the collaboration library for more information on how to use the plugin (coming soon).


## Disclaimer
**This library is not an officially supported part of HOOPS Communicator and provided as-is.**


