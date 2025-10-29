# TARA Acupoint viewer 

A tool designed to integrate 3D whole body images, models and annotations.

## Table of Contents

* [Overview](#overview)
* [Getting Started](#getting-started)
    * [Navigating and interacting...](#navigating-and-interacting-with-the-images-acupoints-and-3d-whole-body-scaffold)
    * [Adding acupoints](#adding-acupoints)
    * [Editing acupoint information](#editing-acupoint-information)
    * [Import And Export Acupoints Information](#import-and-export-acupoints-information)
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

### Navigating and interacting with the images, acupoints and 3D whole body scaffold

1. Find an acupoint: Find an acupoint of interest by clicking on any acupoint in MRI image or search for it by name on the sidebar search field. Associated information of the selected acupoint will be displayed in the sidebar.
<img width="925" height="559" alt="image" src="https://github.com/user-attachments/assets/146b944f-714a-4f72-9d04-bb8e347625f1" />

2. Adjust region visibility: Use the Regions tree in the sidebar to toggle the visibility (show or hide) of different anatomical regions on the 3D model.
<img width="349" height="233" alt="image" src="https://github.com/user-attachments/assets/78451ac0-f65f-4be5-8381-52f8b0d8a83f" />

3. Manage image slices: Click the "Images" entry in the Regions tree to open the slice control panel. Use these controls to add new image slices or change the position (using the X, Y, Z sliders) of existing ones.
<img width="324" height="318" alt="image" src="https://github.com/user-attachments/assets/ba86dc62-f569-427f-8802-08ad83deb76e" />


### Adding acupoints 

1. Turn on Quick Edit at the top left corner
<img width="297" height="153" alt="image" src="https://github.com/user-attachments/assets/9aec3942-5fe3-4b0a-a0c9-cf1111f3c07a" />

2. Click on a desired location on the image

3. A dialog will appear, enter the region and group name (this will be used as the display name for the acupoints) then press confirm to create a point.
<img width="339" height="222" alt="image" src="https://github.com/user-attachments/assets/15b85f72-4c60-437b-b6eb-cd86cb766579" />

4. After creating a new acupoint, a new entry will be added to the sidebar
<img width="545" height="331" alt="image" src="https://github.com/user-attachments/assets/3efd7df0-0b17-4958-9bb4-d6cfd696a912" />

### Editing acupoint information

1. Search or navigate to the acupoint you want to edit on the sidebar

2. Click on any of the fields you wish to edit and a text editing area will appear, you may now add/edit the information
<img width="516" height="306" alt="image" src="https://github.com/user-attachments/assets/32ff98cb-9e81-4da5-86ba-e992b1de2e88" />


### Import And Export Acupoints Information

1. Points and acupoint information can be imported and exported using the Import / Export button on the top left. 
<img width="161" height="69" alt="image" src="https://github.com/user-attachments/assets/0cb65b86-4c34-4f0f-a5a7-170dbb738f8f" />

2. All acupoint information and created points will be imported or exported

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





