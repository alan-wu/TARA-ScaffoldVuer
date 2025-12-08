# TARA Acupoint viewer 

A tool designed to integrate 3D whole body images, models and annotations.

## Table of Contents

* [Overview](#overview)
* [Getting Started](#getting-started)
    * [Import And Export Acupoints Information](#import-and-export-acupoints-information)
    * [Navigating and interacting...](#navigating-and-interacting-with-the-images-acupoints-and-3d-volume)
    * [Adding acupoints](#adding-acupoints)
    * [Editing acupoint information](#editing-acupoint-information)
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

1. Acupoint information can be imported and exported using the Import / Export button on the top left. 
<img width="161" height="69" alt="image" src="https://github.com/user-attachments/assets/0cb65b86-4c34-4f0f-a5a7-170dbb738f8f" />

2. All created acupoints will be imported or exported

3. It is recommended to export often to prevent information lost


### Navigating and interacting with the images, acupoints and 3D volume

1. Find an acupoint: Find an acupoint of interest (if any) by clicking on any acupoint in MRI image or search for it by name on the sidebar search field. Associated information of the selected acupoint will be displayed in the sidebar.
<img width="1717" height="963" alt="image" src="https://github.com/user-attachments/assets/cd565937-11e8-4734-b8bb-ef072aeb60c7" />

2. Adjust region visibility: Use the Regions tree in the sidebar to toggle the visibility (show or hide) of different anatomical regions on the 3D model.
<img width="546" height="324" alt="image" src="https://github.com/user-attachments/assets/466c1835-0448-4034-87fc-9851a953720d" />

3. Manage image slices: Click the "Images" entry in the Regions tree to open the slice control panel. Use these controls to add new image slices or change the position (using the X, Y, Z sliders) of existing ones. Using left and right arrow key after clicking on the slider for finer control on the slide position.
<img width="324" height="318" alt="image" src="https://github.com/user-attachments/assets/ba86dc62-f569-427f-8802-08ad83deb76e" />

4. 3D rendering control: Left mouse click to rotate, middle mouse click and scrolling to zoom in and out, and right mouse click to pan.


### Adding acupoints 

1. Set Interactive Mode to Create at the top left corner
<img width="534" height="132" alt="image" src="https://github.com/user-attachments/assets/80546d0c-b6d8-4275-acb9-1e8887efef8c" />

2. Hover over the volume surface and a turquoise point will appear, indicating the location the point will be created

3. Click on it and a dialog will appear, enter the region and group name (this will be used as the display name for the acupoints) then press confirm to create a point.
<img width="339" height="222" alt="image" src="https://github.com/user-attachments/assets/15b85f72-4c60-437b-b6eb-cd86cb766579" />

5. After creating a new acupoint, a new entry will be added to the sidebar
<img width="545" height="331" alt="image" src="https://github.com/user-attachments/assets/3efd7df0-0b17-4958-9bb4-d6cfd696a912" />

**Hint 1: Choose a group name carefully, this will be used as the label for the point**

**Hint 2: Multiple points can be added to the same group by choosing the same group name at the time of creation**

### Editing acupoint information

1. Acupoint information can be edited in any of the interactive mode

2. Click on a point in the 3D display, or search and navigate to an acupoint information on the sidebar you want to edit on the sidebar

3. Click on any of the fields you wish to edit and a text editing area will appear, you may now add/edit the information
<img width="516" height="306" alt="image" src="https://github.com/user-attachments/assets/32ff98cb-9e81-4da5-86ba-e992b1de2e88" />


### Editing acupoint location

1. Set Interactive Mode to Edit at the top left corner
<img width="508" height="74" alt="image" src="https://github.com/user-attachments/assets/af5d930f-a0c4-420d-b809-2e956897c074" />

2. Hover over the point you wish to edit, make sure the label is displaying the correct information then click on it to begin editing
<img width="1070" height="696" alt="image" src="https://github.com/user-attachments/assets/e7cfcbf0-e76a-4c1b-b173-e41ecbbbc4a5" />

3. Move to a desired location on the surface, a turqoise point similar to the one used in Create mode will appear to show the new position

4. Click on it and a dialog will appear and ask for confirmation, press Edit to confirm:
<img width="729" height="278" alt="image" src="https://github.com/user-attachments/assets/4924228d-a213-4288-8488-923916f43d62" />


## TARA ScaffoldVuer on NPM

### Prerequisites

* Node.js

* A Vue project

### Installation

* npm i @abi-software/tara-scaffoldvuer

### Usage

In your Vue component, import the component and its CSS:
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





