# TARA Acupoint viewer

Specific tool for viewing, creating and editing acupuncture points.

## How to use

### Navigating and interacting with the scaffold

1. Click on any acupoint or search on the sidebar will highlight and display associated information of an acupoint on the sidebar.
<img width="925" height="559" alt="image" src="https://github.com/user-attachments/assets/146b944f-714a-4f72-9d04-bb8e347625f1" />

2. Visibility can be adjusted using the region tree viwer
<img width="349" height="233" alt="image" src="https://github.com/user-attachments/assets/78451ac0-f65f-4be5-8381-52f8b0d8a83f" />

3. After clicking on the Images entry on the region tree viewer an image slice control will appear on the right which can be used to add slices or change the position and image of existing slices
<img width="324" height="318" alt="image" src="https://github.com/user-attachments/assets/ba86dc62-f569-427f-8802-08ad83deb76e" />


### Creating Points

1. Turn on Quick Edit at the top left corner
<img width="297" height="153" alt="image" src="https://github.com/user-attachments/assets/9aec3942-5fe3-4b0a-a0c9-cf1111f3c07a" />

2. Click on a desired location on the image

3. A dialog will appear, enter the region and group name (name for the acupoints) then press confirm to create a point.
<img width="339" height="222" alt="image" src="https://github.com/user-attachments/assets/15b85f72-4c60-437b-b6eb-cd86cb766579" />

4. After creating a point, a new entry will be added to the sidebar
<img width="545" height="331" alt="image" src="https://github.com/user-attachments/assets/3efd7df0-0b17-4958-9bb4-d6cfd696a912" />

### Editing acupoint information

1. Search or navigate to the acupoint you want to edit on the sidebar

2. Click on any of the fields you wish to edit and a text editing area will appear, you may now add/edit the information
<img width="516" height="306" alt="image" src="https://github.com/user-attachments/assets/32ff98cb-9e81-4da5-86ba-e992b1de2e88" />


### Import And Export Points and Needles

1. Points and acupoint information can be imported and exported using the Import / Export button on the top left. 
<img width="161" height="69" alt="image" src="https://github.com/user-attachments/assets/0cb65b86-4c34-4f0f-a5a7-170dbb738f8f" />

2. All acupoint information and created points will be imported or exported

## To run the viewer in local development mode
```bash
npm run serve
```

## TARA ScaffoldVuer on NPM

Scaffoldvuer is available on npm and can be installed into your project with the following command:
```bash
npm i @abi-software/tara-scaffoldvuer
```

## How to use
Install the package in your vue app project with the following command "npm i @abi-software/tara-scaffoldvuer".
Import the package in your script as followed:
```javascript
<script setup>
import { TaraScaffoldVuer } from '@abi-software/tara-scaffoldvuer';
import "@abi-software/tara-scaffoldvuer/dist/style.css";
</script>

<template>
  <div id="app">
    <TaraScaffoldVuer :url="url"/>
  </div>
</template>

<script>
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
