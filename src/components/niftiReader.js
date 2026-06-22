//import * as nifti from 'nifti-reader-js';
import { createPrimitivesFromNIFTI } from "zincjs/src/loaders/niftiReader.js";

const options = {
  hideBlackPixel: true,
  keepScalePosition: true,
  filterByValue: true,

}

const textureSettings = {
  v1: {
    "id": "mesh-location-orientation",
    "locations": [
      {
        "identifier": 1,
        "label": "original",
        "orientation": [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
        "position": [-283, -363, 1090],
        "scale": [540, 540, 276],
        "flipY": false,
        "reference_point": "corner"
      }
    ],
    "settings": {
      "slides": [
        {
          "direction": "x",
          "value": 0.5
        },
        {
          "direction": "y",
          "value": 0.5
        },
        {
          "direction": "z",
          "value": 0.45
        }
      ]
    },
    "type": "slides"
  },
  v2: {
    "id": "mesh-location-orientation",
    "locations": [
      {
        "identifier": 1,
        "label": "original",
        "orientation": [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
        "position": [-183, -343, 1034],
        "scale": [520, 520, 235],
        "flipY": false,
        "reference_point": "corner"
      }
    ],
    "settings": {
      "slides": [
        {
          "direction": "x",
          "value": 0.5
        },
        {
          "direction": "y",
          "value": 0.5
        },
        {
          "direction": "z",
          "value": 0.45
        }
      ]
    },
    "type": "slides"
  }
}

const readNIFTIFromSource = async (url, useHeaderInfo, maskURL) => {
  const images = await createPrimitivesFromNIFTI(url, useHeaderInfo, maskURL, textureSettings['v1'], options);
  return images;
}

export { readNIFTIFromSource }
