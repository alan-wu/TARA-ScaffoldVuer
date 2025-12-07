import * as nifti from 'nifti-reader-js';
import {
  THREE
} from "zincjs";

const hideWhitePixel = false;
const hideBlackPixel = true;

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

const readNIFTI = (data) => {
  // parse nifti
  let fullData = nifti.isCompressed(data) ? nifti.decompress(data) : data;
  if (nifti.isNIFTI(fullData)) {
    let niftiHeader = nifti.readHeader(fullData);
    let niftiImage = nifti.readImage(niftiHeader, fullData);
    return {niftiHeader, niftiImage};
  }
  fullData = undefined;
  return {niftiHeader: undefined, niftiImage: undefined};
}

const createSources = (niftiHeader, niftiImage, maskHeader, maskImage) => {
  if (niftiHeader?.dims && niftiHeader.dims[0] === 3) {
    const width = niftiHeader.dims[1];
    const height = niftiHeader.dims[2];
    const depth = niftiHeader.dims[3];
    const { typedData, dataType } = getTypedData(niftiHeader, niftiImage);
    const sliceSize = width * height;
    const length = sliceSize * depth * 4;
    const fullArray = new Uint8Array(length);
    let maskData = undefined;
    if (maskHeader && maskImage) {
      const maskWidth = maskHeader.dims[1];
      const maskHeight = maskHeader.dims[2];
      const maskDepth = maskHeader.dims[3];
      if (maskWidth === width && maskHeight === height && maskDepth === depth) {
        const maskedTypedData = getTypedData(maskHeader, maskImage);
        maskData = maskedTypedData.typedData;
      }
    }
    let scale = 1;
    if (dataType === "float") {
      scale = 255;
    } else if (dataType === "uint") {
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
          fullArray[offset * 4 + 1] = value;
          fullArray[offset * 4 + 2] = value;
          fullArray[offset * 4 + 3] = 255;
          if (maskData) {
            const maskedValue = maskData[offset];
            if (hideBlackPixel) {
              if (maskedValue === 0 && 20 > value) {
                fullArray[offset * 4 + 3] = 0;
              }
            }
          } else {
            if (hideWhitePixel && value === 255) {
              fullArray[offset * 4 + 3] = 0;
            }
            if (hideBlackPixel && 2 >= value) {
              fullArray[offset * 4] = 240;
              fullArray[offset * 4 + 1] = 240;
              fullArray[offset * 4 + 2] = 240;
              fullArray[offset * 4 + 3] = 1.0;
            }
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
    return { typedData: new Uint8Array(niftiImage), dataType: "uint" };
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
    return { typedData: new Int16Array(niftiImage), dataType: "int16" };
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
    return { typedData: new Int32Array(niftiImage), dataType: "int32" };
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
    return { typedData: new Float32Array(niftiImage), dataType: "float" };
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
    return { typedData: new Float64Array(niftiImage), dataType: "float" };
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
    return { typedData: new Int8Array(niftiImage), dataType: "int" };
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
    return { typedData: new Uint16Array(niftiImage), dataType: "int" };
  } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
    return { typedData: new Uint32Array(niftiImage), dataType: "int" };
  } else {
    return;
  }
}

const getSFormTransformation = (header) => {
  if (header?.affine && header.dims) {
    const affine = header.affine;
    const position = [0, 0, 0];
    const scale = [0, 0, 0];
    position[0] = affine[0][3];
    position[1] = affine[1][3];
    position[2] = affine[2][3];
    scale[0] = affine[0][0] * header.dims[1];
    scale[1] = affine[1][1] * header.dims[2];
    scale[2] = affine[2][2] * header.dims[3];
    return {position, scale}
  }
  return {position: undefined, scale: undefined}
}

const getTransformationFromHeader = (header) => {
  if (header) {
    if (header.sform_code) {
      return getSFormTransformation(header)
    }
  }

  return {position: undefined, scale: undefined}
}

const createTexturePrimitives = (Zinc, niftiHeader, sources, useHeaderInfo) => {
  if (sources?.data) {
    const newTexture = new Zinc.TextureSlides();
    const tArray = new Zinc.TextureArray();
    tArray.impl = new THREE.DataTexture2DArray(
      sources.data, sources.width, sources.height, sources.depth);
    tArray.impl.anisotropy = 4;
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
    const settings = textureSettings['v1'];
    //The following will allow the dimension and upset to be
    //set using the information from the header
    if (useHeaderInfo && niftiHeader) {
      const {position, scale} = getTransformationFromHeader(niftiHeader);
      if (position && scale) {
        settings.locations[0].scale = scale
        settings.locations[0].position = position;
      }
/*
      if (niftiHeader.qoffset_x) {
        settings.locations[0].position[0] = niftiHeader.qoffset_x;
      }
      if (niftiHeader.qoffset_y) {
        settings.locations[0].position[1] = niftiHeader.qoffset_y;
      }
      if (niftiHeader.qoffset_y) {
        settings.locations[0].position[2] = niftiHeader.qoffset_z;
      }
      if (niftiHeader.dims) {
        settings.locations[0].scale[0] = niftiHeader.dims[1];
        settings.locations[0].scale[1] = niftiHeader.dims[2];
        settings.locations[0].scale[2] = niftiHeader.dims[3];
      }
      */
    }
    newTexture.initialise(settings, undefined);
    newTexture.showEdges(0x999999);
    return newTexture;
  }
  return undefined;
}

const readNIFTIFromURL = async (Zinc, url, useHeaderInfo, maskURL) => {
  //  try {
  let maskHeader = undefined, maskImage = undefined;
  if (maskURL) {
    const mask = await fetch(maskURL);
    const maskBuffer = await mask.arrayBuffer();
    const maskedNIFTI = readNIFTI(maskBuffer);
    maskHeader = maskedNIFTI.niftiHeader;
    maskImage = maskedNIFTI.niftiImage;
  }
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const {niftiHeader, niftiImage} = readNIFTI(buffer);
  const sources = createSources(niftiHeader, niftiImage, maskHeader, maskImage);
  return createTexturePrimitives(Zinc, niftiHeader, sources, useHeaderInfo);
}

export { readNIFTIFromURL }