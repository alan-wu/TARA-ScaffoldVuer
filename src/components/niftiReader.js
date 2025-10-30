import * as nifti from 'nifti-reader-js';
import {
  THREE
} from "zincjs";

const hideWhitePixel = false;

const textureData = {
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
    "slides":[
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


const readNIFTI = (data) => {
  // parse nifti
  let fullData = nifti.isCompressed(data) ? nifti.decompress(data): data;
  if (nifti.isNIFTI(fullData)) {
    let niftiHeader = nifti.readHeader(fullData);
    let niftiImage = nifti.readImage(niftiHeader, fullData);
    const sources = createSources(niftiHeader, niftiImage);
    niftiImage = undefined;
    return sources
  }
  fullData = undefined;
  return undefined;
}

const createSources = (niftiHeader, niftiImage) => {
  if (niftiHeader?.dims && niftiHeader.dims[0] === 3) {
    const width = niftiHeader.dims[1];
    const height = niftiHeader.dims[2];
    const depth = niftiHeader.dims[3];
    const {typedData, dataType} = getTypedData(niftiHeader, niftiImage);
    const sliceSize = width * height;
    const length = sliceSize * depth * 4;
    const fullArray = new Uint8Array(length);
    let scale = 1;
    if (dataType === "float") {
      scale = 255;
    }
    for (let slice = 0; slice < depth; slice++) {
      const sliceOffset = sliceSize * slice;
      for (let row = 0; row < height; row++) {
        const rowOffset = row * width;
        for (let col = 0; col < width; col++) {
          const offset = sliceOffset + rowOffset + col;
          const value = typedData[offset] * scale;
          fullArray[offset * 4] = value;
          fullArray[offset* 4 + 1] = value;
          fullArray[offset* 4 + 2] = value;
          if (hideWhitePixel) {
            if (value === 255) {
              fullArray[offset * 4 + 3] = 0;
            } else {
              fullArray[offset * 4 + 3] = 255;
            }
          } else {
            fullArray[offset * 4 + 3] = 255;
          }
        }
      }
    }
    return {
      data: fullArray,
      width,
      height,
      depth,
    };
  }
  return undefined;
}

const getTypedData = (niftiHeader, niftiImage) => {
  if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
    return {typedData: new Uint8Array(niftiImage), dataType: "int"};
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
    return {typedData: new Int16Array(niftiImage), dataType: "int"};
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
    return {typedData: new Int32Array(niftiImage), dataType: "int"};
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
    return {typedData: new Float32Array(niftiImage), dataType: "float"};
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
    return {typedData: new Float64Array(niftiImage), dataType: "float"};
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
    return {typedData: new Int8Array(niftiImage), dataType: "int"};
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
    return {typedData: new Uint16Array(niftiImage), dataType: "int"};
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
    return {typedData: new Uint32Array(niftiImage), dataType: "int"};
  } else {
    return;
  }
}

const createTexturePrimitives = (Zinc, sources) => {
  if (sources?.data) {
    const newTexture = new Zinc.TextureSlides();
    const tArray = new Zinc.TextureArray();
    tArray.impl = new THREE.DataTexture2DArray(
      sources.data, sources.width, sources.height, sources.depth);
    tArray.size = {
      width: sources.width,
      height: sources.height,
      depth: sources.depth,
    };
    tArray.isLoading = false;
    tArray.impl.needsUpdate = true
    newTexture.groupName = "Images";
    newTexture.morph.renderOrder = 1;
    newTexture.texture = tArray;
    newTexture.initialise(textureData, undefined);
    newTexture.showEdges(0x000000);
    return newTexture;
  }
  return undefined;
}

const readNIFTIFromURL = async (Zinc, url) => {
//  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const sources = readNIFTI(buffer);
    return createTexturePrimitives(Zinc, sources);
//  }
  /*catch (err) {
    console.error(err)
    console.log("Not working")
    return undefined;
  } */
}

export { readNIFTIFromURL }