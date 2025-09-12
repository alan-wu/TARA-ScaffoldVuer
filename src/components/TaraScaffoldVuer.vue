<template>
  <div class="scaffold-container" ref="taraContainer">
    <div class="settings-panels">
      <template v-if="acupointsViewer">
        <el-row :gutter="20" justify="center" align="middle">
          <el-col :span="auto">
            <el-button
              size="small"
              @click="displayLabels()">
              Display labels
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" align="middle">
          <el-col :span="auto">
            <el-button
              size="small"
              @click="frontView()">
              Front view
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" align="middle">
          <el-col :span="auto">
            <el-button
              size="small"
              @click="backView()">
              Back view
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" align="middle">
          <el-switch
            v-model="alignPoint"
            active-text="Align Point"
          />
        </el-row>
      </template>
      <template v-else>
        <el-row :gutter="20" justify="center" align="middle">
          <el-col :span="auto">
            <el-button
              size="small"
              :icon="ElIconFolderOpened"
              @click="exportLocalAnnotations()">
              Export Annotations
            </el-button>
          </el-col>
          <el-col :span="auto">
            <el-button size="small" :icon="ElIconFolderOpened">
              <label for="annotations-upload">Import Annotations</label>
              <input
                id="annotations-upload"
                type="file"
                accept="application/json"
                @change="importLocalAnnotations" 
              />
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" align="middle">
          <el-col :span="12">
            Quick Edit
          </el-col>
          <el-col :span="6">
            <el-switch
              v-model="quickEditOn"
              :active-action-icon="ElIconEditPen"
              :inactive-action-icon="ElIconEditPen"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" align="middle">
          <el-popover placement="bottom" trigger="manual" :visible="infoVisible" width="550" popper-class="table-popover" :teleported="false">
            <template #default>
              <NeedlesTable :needlesInfo="needlesInfo" />
            </template>
            <template #reference>
              <el-button
                size="small"
                class="needles-button"
                @click="infoVisible = !infoVisible"
                :icon="ElIconDataAnalysis"
              >
                {{ infoVisible ? "Hide Needles Info" : "Display Needles Info"}}
              </el-button>
            </template>
          </el-popover>
        </el-row>
      </template>
    </div>
    <SideBar
      v-if="acupoints"
      ref="sideBar"
      class="side-bar"
      :envVars="envVars"
      :visible="true"
      :activeTabId="1"
      :tabs="sidebarTabs"
      :open-at-start="true"
      :acupointsInfoList="acupoints"
      @acupoints-clicked="onAcupointsClicked"
      @acupoints-hovered="onAcupointsHovered"
    />
    <ScaffoldVuer
      v-if="url"
      ref="scaffold"
      class="vuer"
      :display-u-i="displayUI"
      :url="url"
      :display-latest-changes="false"
      :display-minimap="false"
      :display-markers="false"
      :enableOpenMapUI="false"
      :enableLocalAnnotations="true"
      :marker-cluster="false"
      :positionalRotation="positionalRotation"
      :show-colour-picker="false"
      :render="true"
      @on-ready="onReady"
      @scaffold-selected="onSelected"
      @user-primitives-updated="userPrimitivesUpdated"
      @zinc-object-added="objectAdded"
    />
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { markRaw, shallowRef } from 'vue';
import { ElMessage } from 'element-plus'
import NeedlesTable from "./NeedlesTable.vue";
import { readNIFTIFromURL } from "./niftiReader.js"
import { SideBar } from "@abi-software/map-side-bar";
import "@abi-software/map-side-bar/dist/style.css";
//import { acupointEntries } from './acupoints.js'
import { ScaffoldVuer } from "@abi-software/scaffoldvuer";
import "@abi-software/scaffoldvuer/dist/style.css";
import {
  EditPen as ElIconEditPen,
  FolderOpened as ElIconFolderOpened,
  DataAnalysis as ElIconDataAnalysis,
} from '@element-plus/icons-vue';
import {
  ElButton as Button,
  ElCol as Col,
  ElIcon as Icon,
  ElInput as Input,
  ElInputNumber as InputNumber,
  ElPopover as Popover,
  ElRow as Row,
  ElSwitch as Switch,
} from "element-plus";
import {
  THREE
} from "zincjs";
import 'element-plus/es/components/message/style/css'; // this is only needed if the page also used ElMessage

const writeTextFile = (filename, data) => {
  let dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(data));
  let hrefElement = document.createElement("a");
  document.body.append(hrefElement);
  hrefElement.download = filename;
  hrefElement.href = dataStr;
  hrefElement.click();
  hrefElement.remove();
}

const getIntersectedObjects = (intersects) => {
  const primitiveInfos = [];
  intersects.forEach((intersect) => {
    const zincObject = intersect.object.userData;
    if (zincObject) {
      const groupName = zincObject?.groupName;
      const distance = intersect.distance.toFixed(2);
      const x = intersect.point.x.toFixed(2);
      const y = intersect.point.y.toFixed(2);
      const z = intersect.point.z.toFixed(2);
      primitiveInfos.push({groupName, distance, x, y, z});
    }
  });
  return primitiveInfos;
}

const findNearbyPoints = (data, tolerance) => {
  if (data[0].data.zincObject?.isPointset) {
    return data[0].data.zincObject;
  } else {
    let distance = data[0].extraData.intersected.distance + tolerance;
    const intersects = data[0].extraData.intersects;
    for (let i = 0; i < intersects.length; i++) {
      if (distance > intersects[i].distance) {
       if (intersects[i].object.userData?.isPointset) {
        return intersects[i].object.userData;
       }
      } else {
        return;
      }
    }
  }
}

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();

const convertToPrimitivesName = original => {
  const name = original.replace(" ", "");
  return [`${name} left`, `${name} right`];
}

const convertFromPrimitivesName = original => {
  let name = original.substring(0, original.indexOf(" "));
  name = `${name.substring(0, 2)} ${name.substring(2, 4)}`
  return name;
}

const backViewport = {
    "nearPlane": 1.5013817389693542,
    "farPlane": 15013.81125645484,
    "eyePosition": [
        -79.66697327672085,
        4502.629849904295,
        753.9406181930069
    ],
    "targetPosition": [
        -1.0555419921875,
        -102.07274055480957,
        782.4486846923828
    ],
    "upVector": [
        0.00913897460936149,
        0.006346713837116281,
        0.9999380972673397
    ]
};

export default {
  name: "TaraScaffoldVuer",
  components: {
    Button,
    Col,
    Icon,
    Input,
    InputNumber,
    Popover,
    Row,
    Switch,
    ElIconEditPen,
    ElIconFolderOpened,
    NeedlesTable,
    ScaffoldVuer,
    SideBar,
  },
  data: function () {
    return {
      acupoints: undefined,
      acupointsLabelOn: false,
      alignPoint: true,
      bodyScaffold: undefined,
      glyphs: markRaw([]),
      quickEditOn: false,
      displayUI: true,
      ElIconEditPen: shallowRef(ElIconEditPen),
      ElIconFolderOpened: shallowRef(ElIconFolderOpened),
      ElIconDataAnalysis: shallowRef(ElIconDataAnalysis),
      coordinatesClicked: [],
      positionalRotation: true,
      needlesInfo: {},
      infoVisible: false,
      importing: false,
      sidebarTabs: [
        {title: 'Acupoints', id: 1, type: 'acupoints' },
      ],
      envVars: {
        API_LOCATION: import.meta.env.VITE_APP_API_LOCATION,
        ALGOLIA_KEY: import.meta.env.VITE_APP_ALGOLIA_KEY,
        ALGOLIA_ID: import.meta.env.VITE_APP_ALGOLIA_ID,
        ALGOLIA_INDEX: import.meta.env.VITE_APP_ALGOLIA_INDEX,
        PENNSIEVE_API_LOCATION: import.meta.env.VITE_APP_PENNSIEVE_API_LOCATION,
        BL_SERVER_URL: import.meta.env.VITE_APP_BL_SERVER_URL,
        NL_LINK_PREFIX: import.meta.env.VITE_APP_NL_LINK_PREFIX,
        ROOT_URL: import.meta.env.VITE_APP_ROOT_URL,
        FLATMAPAPI_LOCATION: import.meta.env.VITE_FLATMAPAPI_LOCATION,
      },
      messageSettings: {
        duration: 0,
        message: "Downloading Texture"
      }
      
    };
  },
  props: {
    consoleOn: {
      type: Boolean,
      default: false,
    },    
    url: {
      type: String,
      default: "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/tara/whole_body-30-1-25/human_body_acupoints_metadata.json",
    },
    pointTolerance: {
      type: Number,
      default: 20,
    },
    acupointsEndpoint: {
      type: String,
      default: "",
    },
    acupointsViewer: {
      type: Boolean,
      default: false,
    },
    textureUrl: {
      type: String,
      default: "",
    },
  },
  watch: {
    helpMode: function (newVal) {
      if (!newVal) {
        this.helpModeActiveItem = 0;
      }
    },
    quickEditOn: function(value) {
      if (value) {
        this.$refs.scaffold.$module.ignorePreviousSelected = true;
        this.$refs.scaffold.viewingMode = "Exploration";
      } else {
        this.$refs.scaffold.$module.ignorePreviousSelected = false;
      }
    },
  },
  mounted: function () {
    this._createLinesLength = 100;
    const Zinc = this.$refs.scaffold.$module.Zinc;
    this._pickableObjects = [];
    const scene  = this.$refs.scaffold.$module.scene;
    this._rayCaster = new Zinc.RayCaster(
      scene,
      scene,
      undefined,
      undefined,
    );
  },
  methods: {
    displayLabels: function() {
      if (this.acupointsLabelOn) {
        this.glyphs.forEach(glyph => glyph.hideLabel());
        this.acupointsLabelOn = false;
      } else {
        this.glyphs.forEach(glyph => glyph.showLabel());
        this.acupointsLabelOn = true;
      }
    },
    frontView: function() {
      const control  = this.$refs.scaffold.$module.scene.getZincCameraControls();
      control.resetView();
    },
    backView: function() {
      const control  = this.$refs.scaffold.$module.scene.getZincCameraControls();
      control.setCurrentCameraSettings(backViewport);
    },
    onAcupointsClicked: function (data) {
      let names = undefined;
      if (data?.Acupoint) {
        names = convertToPrimitivesName(data.Acupoint);
      }
      this.$refs.scaffold.changeActiveByName(names, "", false);
    },
    onAcupointsHovered: function (data) {
      let names = undefined;
      if (data?.Acupoint) {
        names = convertToPrimitivesName(data.Acupoint);
      }
      this.$refs.scaffold.changeHighlightedByName(names, "", false);
    },
    exportLocalAnnotations: function() {
      const annotations = this.$refs.scaffold.getOfflineAnnotations();
      const filename = 'scaffoldAnnotations' + JSON.stringify(new Date()) + '.json';
      writeTextFile(filename, annotations);
    },
    onReaderLoad: function(event) {
      const annotationsList = JSON.parse(event.target.result);
      this.importing = true;
      this.$refs.scaffold.importOfflineAnnotations(annotationsList);
      this.importing = false;
    },
    importLocalAnnotations: function() {
      const selectedFile = document.getElementById("annotations-upload").files[0];
      const reader = new FileReader();
      reader.onload = this.onReaderLoad;
      reader.readAsText(selectedFile);
    },
    objectAdded: function (zincObject) {
      if (!zincObject.isLines2) {
        const regionName = zincObject.region?.getName()
        if (regionName && regionName === "skin") {
          zincObject.setIsPickable(false);
          this.bodyScaffold = markRaw(zincObject);
        }
        this._pickableObjects.push(zincObject);
        if (zincObject.isGlyphset) {
          zincObject.setScaleAll(2);
          this.glyphs.push(zincObject);
        } else {
          if (zincObject.groupName === "undefined" &&
            zincObject._lod?._material?.side) {
            zincObject._lod._material.side =  THREE.FrontSide;
          }
        }
      } else {
        this.userPrimitivesUpdated({zincObject});
      }
    },
    screenCapture: function () {
      this.$refs.scaffold.captureScreenshot("capture.png");
    },
    populateAcupoints: function(data) {
      const filtered = {};
      const keys = Object.keys(data);
      this.glyphs.forEach((glyph) => { 
        if (glyph.groupName) {
          const converted = convertFromPrimitivesName(glyph.groupName);
          for (let i = 0; i < keys.length; i++) {
            if (converted.toLowerCase() === keys[i].toLowerCase()) {
              filtered[keys[i]] = data[keys[i]];
              break;
            }
          }
        }
      });
      this.acupoints = filtered;
    },
    onReady: async function () {
      const viewer = this.$refs.scaffold;
      const bounds = viewer.$module.scene.getBoundingBox();
      const d = bounds.max.distanceTo( bounds.min );
      this._createLinesLength = d / 6.0;
      if (this.consoleOn) console.log("Lines length", this._createLinesLength);
      if (this.acupointsEndpoint) {
        fetch(this.acupointsEndpoint)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Cannot download acupoints from server: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            this.populateAcupoints(data);
          })
          .catch((error) => {
            console.log(error)
            if (acupointEntries) {
              this.populateAcupoints(acupointEntries);
            }
          });
      } else if (acupointEntries) {
        this.populateAcupoints(acupointEntries);
      }
      const Zinc = this.$refs.scaffold.$module.Zinc;
      if (this.textureUrl) {
        const ele = this.$refs.taraContainer;
        const original = ElMessage({
          message: 'Downloading texture',
          showClose: true,
          duration: 0,
          appendTo: ele,
        });
        const newTexture = await readNIFTIFromURL(Zinc, this.textureUrl);
        if (newTexture) {
          ElMessage({
            message: 'Texture loaded Successfully',
            showClose: true,
            duration: 6000,
            type: "success",
            appendTo: ele,
          });
          original.close();
          viewer.$module.scene.addZincObject(newTexture);
        } else {
          ElMessage({
            message: 'Unable to load texture',
            showClose: true,
            duration: 6000,
            type: "error",
            appendTo: ele,
          });
          original.close();
        }
      }
    },
    addLinesWithNormal: function (data, coord, normal) {
      const myViewer = this.$refs.scaffold;
      if (this.consoleOn) console.log(myViewer.createData);
      //changing shape like this will create a reactive issue.
      if (coord && normal) {
        myViewer.createData.shape = "LineString";
        this.$nextTick(() => {
          const newCoords = [
            coord[0] + normal.x * this._createLinesLength,
            coord[1] + normal.y * this._createLinesLength,
            coord[2] + normal.z * this._createLinesLength,
          ];
          myViewer.createData.toBeConfirmed = false;
          myViewer.createData.points.length = 0;
          myViewer.createData.points.push(newCoords);
          myViewer.createEditTemporaryLines(coord);
          myViewer.drawLine(coord, data);
        });
      }
    },
    addPoint: function (data, coord) {
      const myViewer = this.$refs.scaffold;
      if (this.consoleOn) {
        console.log(myViewer.createData);
        console.log("addPoints", data, coord);
      }
      if (coord) {
        myViewer.createData.shape = "Point";
        this.$nextTick(() => {
          myViewer.createData.toBeConfirmed = false;
          myViewer.createData.points.length = 0;
          myViewer.drawPoint(coord, data);
        });
      }
    },
    setRotationMode: function(mode) {
      const scene = this.$refs.scaffold.$module.scene;
      const camera = scene.getZincCameraControls();
      camera.setRotationMode(mode);
    },
    setViewWithPointAndNormalV3: function(point, normal) {
      const scaffoldvuer = this.$refs.scaffold;
      scaffoldvuer.fitWindow();
      const control = scaffoldvuer.$module.scene.getZincCameraControls();
      const viewport = control.getCurrentViewport();
      v1.set(...viewport.targetPosition);
      v2.set(...viewport.eyePosition);
      v2.subVectors(v2, v1);
      const mag = v2.length() / 1.5;
      viewport.targetPosition = [...point.toArray()];
      //Target
      v2.copy(point);
      //Eye
      v1.copy(point).addScaledVector(normal, mag);
      viewport.eyePosition = [v1.x, v1.y, v1.z];
      //Calculate new upVector
      //First, the forward vector Fnew = normalize(target - cameraNew)
      v2.sub(v1).normalize();
      //Second, the right vector Rnew = normalize(up x Fnew)
      v1.set(...viewport.upVector);
      v1.cross(v2).normalize();
      //Finally, the new up vector Unew = Fnew x Rnew
      v2.cross(v1);
      viewport.upVector = [v2.x, v2.y, v2.z];
      control.setCurrentCameraSettings(viewport);
    },
    viewZincObjectOfInterest: function (zincObject) {
      if (zincObject?.isGlyphset) {
        const scaffoldvuer = this.$refs.scaffold;
        scaffoldvuer.fitWindow();
        const control = scaffoldvuer.$module.scene.getZincCameraControls();
        const viewport = control.getCurrentViewport();
        v1.set(...viewport.targetPosition);
        v2.set(...viewport.eyePosition);
        v2.subVectors(v2, v1);
        const mag = v2.length() / 1.5;
        const bounds = zincObject.getBoundingBox();
        //Calculate new eyePosition
        bounds.getCenter(v2);
        v1.set(...viewport.targetPosition);
        v2.subVectors(v2, v1);
        v2.normalize();
        v1.addScaledVector(v2, mag);
        viewport.eyePosition = [v1.x, v1.y, v1.z];
        //Calculate new upVector
        //First, the forward vector Fnew = normalize(target - cameraNew)
        v2.set(...viewport.targetPosition);
        v2.sub(v1).normalize();
        //Second, the right vector Rnew = normalize(up x Fnew)
        v1.set(...viewport.upVector);
        v1.cross(v2).normalize();
        //Finally, the new up vector Unew = Fnew x Rnew
        v2.cross(v1);
        viewport.upVector = [v2.x, v2.y, v2.z];
        control.setCurrentCameraSettings(viewport);
      }
    },
    findNearestPointAndNormalFromObject: function(zincObject) {
      if (this.bodyScaffold) {
        const worldPoint = new THREE.Vector3();
        zincObject.getBoundingBox().getCenter(worldPoint);
        const positionAttribute = this.bodyScaffold.geometry.getAttribute('position');
        let minDistanceSq = Infinity;
        const tempPoint = new THREE.Vector3();
        const closestPoint = new THREE.Vector3();
        const closestNormal = new THREE.Vector3();
        const triangle = new THREE.Triangle();

        if (this.bodyScaffold.geometry.index) {
          const indexAttribute = this.bodyScaffold.geometry.index;
          for (let i = 0; i < indexAttribute.count; i += 3) {
            const i1 = indexAttribute.getX(i);
            const i2 = indexAttribute.getX(i + 1);
            const i3 = indexAttribute.getX(i + 2);
            
            v1.fromBufferAttribute(positionAttribute, i1);
            v2.fromBufferAttribute(positionAttribute, i2);
            v3.fromBufferAttribute(positionAttribute, i3);
            triangle.set(v1, v2, v3);
            triangle.closestPointToPoint(worldPoint, tempPoint);
            
            const distanceSq = worldPoint.distanceToSquared(tempPoint);
            if (distanceSq < minDistanceSq) {
              minDistanceSq = distanceSq;
              closestPoint.copy(tempPoint);
              triangle.getNormal(closestNormal);
            }
          }
        }
        return({ point: closestPoint, normal: closestNormal });
      }
      return undefined;
    },
    onSelected: function (data) {
      if (data && data.length > 0 && data[0].data.group) {
        if (this.consoleOn) {
          console.log(data[0].extraData.intersects);
          console.log(data[0], data[0].extraData.intersected);
        }
        if (this.quickEditOn && data[0].extraData.worldCoords) {
          //Try to look for point within tolerance
          const points = findNearbyPoints(data, this.pointTolerance);
             //Look for the surface underneath a point
          if (points && points?.isPointset) {
            const intersects = data[0].extraData.intersects;
            if (intersects) {
              let found = false;
              for (let i = 0; i < intersects.length && !found; i++) {
                if (intersects[i].face) {
                  found = true;
                  const coord = [intersects[i].point.x, intersects[i].point.y ,intersects[i].point.z];
                  this.addLinesWithNormal(data, coord, intersects[i].face.normal);
                }
              }
            }
          } else if (data[0].extraData.intersected?.face) {
            this.addPoint(data, data[0].extraData.worldCoords);
          }
        } else {
          if (data && data.length > 0 && data[0].data.group) {
            const zincObject = data[0].data?.zincObject;
            if (zincObject.isGlyphset) {
              const label = convertFromPrimitivesName(data[0].data.group);
              if (label && label.trim() && this.$refs.sideBar) {
                this.$refs.sideBar.openAcupointsSearch(label);
              }
              if (this.alignPoint && data.length === 1) {
                const {point, normal} = this.findNearestPointAndNormalFromObject(
                  zincObject);
                this.setViewWithPointAndNormalV3(point, normal);
                //this.viewZincObjectOfInterest(zincObject);
              }
            }
          }
        }
      }
    },
    userPrimitivesUpdated: function (payload) {
      if (this.consoleOn) console.log("userPrimitivesUpdated", payload);
      const zincObject = payload.zincObject;
      if ((zincObject.isEditable ||  this.importing) && zincObject.isLines2) {
        //Call the following to set the camera       
        const scene = this.$refs.scaffold.$module.scene;
        const camera = scene.getZincCameraControls();
        if (this._rayCaster) {
          this._rayCaster.getIntersectsObjectWithCamera(camera, 0, 0);
          for (let i = 0; i * 2 < zincObject.drawRange; i++) {
            const v = zincObject.getVerticesByFaceIndex(i);
            let d = [v[1][0] - v[0][0], v[1][1] - v[0][1], v[1][2] - v[0][2]];
            const mag = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
            for (let l = 0; l < 3; l++) {
              v1.setComponent(l, v[0][l]);
              d[l] = d[l] / mag;
              v2.setComponent(l, d[l]);
            }
            this._rayCaster.setPickableObjects(this._pickableObjects);
            const objects = this._rayCaster.getIntersectsObjectWithOrigin(
              camera, v1, v2);
            const intersects = objects.filter((object) => object.distance < mag);
            const primitivesInfo = getIntersectedObjects(intersects);
            let needlesName = `Needle ${i + 1}`;
            if (zincObject.groupName) {
              needlesName = needlesName + ` of ${zincObject.groupName}`;
            }
            this.needlesInfo[needlesName] = primitivesInfo;
          }
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">

:deep(.warning-icon) {
  display:none;
}
.scaffold-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: absolute;
}

input[type="file"] {
  display: none;
}

.settings-panels {
  z-index:10000;
  left:0px;
  position:absolute;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.5);

  .el-row {
    width:200px; 
    .el-col {
      &.is-guttered {
        padding-top: 5px;
        padding-bottom: 5px;
      }

      > p {
        font-size: 12px;
        margin: 0;
      }

      .el-input__inner,
      .el-switch {
        font-size: 12px;
        height: 20px;
      }
    }
  }
}

.needles-button {
  z-index:10000;
  margin-top: 5px;
}

.vuer {
  :deep(svg.map-icon) {
    color: #8300BF;
  }
}
/* Component Styles */
</style>
