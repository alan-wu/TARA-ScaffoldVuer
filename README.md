# TARA Acupoint viewer

A tool designed to integrate 3D whole body images, models and annotations.

## Table of Contents

* [Overview](#overview)
* [Getting Started](#getting-started)
    * [Import And Export Acupoints Information](#import-and-export-acupoints-information)
    * [Navigating and interacting...](#navigating-and-interacting-with-the-images-acupoints-and-3d-volume)
    * [Adding acupoints](#adding-acupoints)
    * [Editing acupoint location](#editing-acupoint-location)
* [TARA ScaffoldVuer on NPM](#tara-scaffoldvuer-on-npm)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
    * [Usage](#usage)
        * [Props & Events:](#props--events)
* [Development & Build](#development--build)
    * [To contribute or modify locally:](#to-contribute-or-modify-locally)
    * [Run the app locally:](#run-the-app-locally)
    * [To build for distribution:](#to-build-for-distribution)
* [License](#license)


## Overview

TARA Acupoint viewer is a Vue component/framework that enables you to load, display and interact with MRI images in the 3D scaffold model framework. It supports annotation and discovery of acupoint information.

## Getting Started


### Import And Export Acupoints Information

1. There is a default list of acupoint visulizations which can be read into the viewer using the **Load default** button in the top left menu
<img width="999" height="316" alt="image" src="https://github.com/user-attachments/assets/47996b3d-27c2-4e96-9302-fcf03394d859" />

2. Alternatively, visualizations can be imported and exported using the Import / Export button on the same menu.

3. All newly created acupoints can be imported or exported

4. It is recommended to export often to prevent information lost


### Navigating and interacting with the images, acupoints and 3D volume

1. Find an acupoint: Find an acupoint of interest by clicking on any acupoint in MRI image or search for it by name on the sidebar search field. Associated information of the selected acupoint will be displayed in the sidebar.
<img width="963" height="995" alt="image" src="https://github.com/user-attachments/assets/a529b3a0-eaff-441c-942f-748f1dd1c851" />

2. Several filters can be used for filtering the list of acupoints
<img width="942" height="492" alt="image" src="https://github.com/user-attachments/assets/387ed917-c9a7-4373-b070-11205143da42" />

3. The listing on the sidebar directly affect the visibility of the acupoints on the scaffold. e.g. when the user select Bladder meridian on the filter list, both the acupoints list and scaffold will only display acupoints from the Bladder Meridian.

4. Adjust region visibility: Use the Regions tree in the sidebar to toggle the visibility (show or hide) of different anatomical regions on the 3D model.
<img width="528" height="338" alt="image" src="https://github.com/user-attachments/assets/d28a458d-2f0a-4fd9-87f0-6420f674f49a" />

5. Manage image slices: Click the "Images" entry in the Regions tree to open the slice control panel. Use these controls to add new image slices or change the position (using the X, Y, Z sliders) of existing ones. Brightness and contrast of the MRI images can also be adjusted.
<img width="429" height="574" alt="image" src="https://github.com/user-attachments/assets/28bac460-c88a-43db-92c2-b74056417278" />

### Adding acupoints

1. Set Interactive Mode to Create at the top left corner
<img width="462" height="351" alt="image" src="https://github.com/user-attachments/assets/256d5773-fd46-4a41-856a-fc113552b94d" />

2. Hover over the volume surface and a turquoise point will appear, indicating the location the point will be created

3. A dialog will appear, enter the group name (this will be used as the display name for the acupoints) then press confirm to create a point. A list of acupoints will be displayed after clicking on the group text box, allowing user to select a new suitable name quickly.
<img width="619" height="799" alt="image" src="https://github.com/user-attachments/assets/d02b5eaa-74c4-4824-8fe0-18befd7f078e" />

4. After creating a new acupoint, a new entry may be added to the sidebar
<img width="545" height="331" alt="image" src="https://github.com/user-attachments/assets/3efd7df0-0b17-4958-9bb4-d6cfd696a912" />

**Hint 1: Choose a group name carefully, this will be used as the label for the point**

**Hint 2: Multiple points can be added to the same group by choosing the same group name at the time of creation**

### Editing acupoint location

1. Set Interactive Mode to Edit at the top left corner

2. Click on created points, make sure the label is displaying the correct information
<img width="372" height="338" alt="image" src="https://github.com/user-attachments/assets/4867f837-3968-45d8-8fc2-04c04d8e2db9" />

3. Move to a desired location, click and a prompt will appear and ask for confirmation, press Edit to confirm:
<img width="582" height="369" alt="image" src="https://github.com/user-attachments/assets/4bf68376-c4bb-4e25-b096-5679b0a0c8ea" />


### Resetting View

You may reset to the original scaffold view by using the **Reset View** button on the top left corner.
<img width="612" height="286" alt="image" src="https://github.com/user-attachments/assets/251e6eb9-8f50-42b5-88c4-7b0b51983985" />


## TARA ScaffoldVuer on NPM

### Prerequisites

* Node.js

* A Vue project

### Installation

* npm i @abi-software/tara-scaffoldvuer

### Usage

## How to integrate With Your Vue App
Install the package in your vue app project with the following command "npm i @abi-software/tara-scaffoldvuer".
Import the package in your script as followed:
```javascript
<script setup>

</script>

<template>
  <div id="app">
    <TaraScaffoldVuer :url="url"/>
  </div>
</template>

<script>
import { TaraScaffoldVuer } from '@abi-software/tara-scaffoldvuer';
import "@abi-software/tara-scaffoldvuer/dist/style.css";

export default {
  name: "app",
  data: function () {
    return {
      url: "Some URL"
    }
  }
}
</script>
```

#### Props & Events

* ```url``` (String): The URL or path to the model metadata (JSON)
* ```@scaffold-selected```: Event emitted when a part is selected; the callback receives the annotation/object

## Development & Build

### To contribute or modify locally

* git clone https://github.com/abi-software/TARA-ScaffoldVuer.git

* In your terminal:
```
cd TARA-ScaffoldVuer
npm install
```

### Run the app locally
```
npm run serve
```

This will allow you to view and test the component in action and inspect how it handles model loading, events, etc.

### To build for distribution:
```
npm run build-bundle
```


## License

This project is licensed under the MIT License — see the LICENSE file for details.





