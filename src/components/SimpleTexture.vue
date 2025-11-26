<template>
  <div class="scaffold-container" ref="taraContainer">
    <div class="settings-panels">
      <el-row>
        <el-col :span="12">
          <el-row :gutter="20" justify="center" align="middle">
            <el-col :span="auto">
              <el-button
                class="left-buttons"
                size="small"
                :icon="ElIconQuestionFilled"
                @click="openHelp()">
                Help
              </el-button>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <el-row :gutter="20" justify="center" align="left">
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
            <el-col :span="auto">
              <el-switch
                v-model="quickEditOn"
                :active-action-icon="ElIconEditPen"
                :inactive-action-icon="ElIconEditPen"
                active-text="Add acupoints"
              />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
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
      :show-colour-picker="true"
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
import { readNIFTIFromURL } from "./niftiReader.js"
import { SideBar } from "@abi-software/map-side-bar";
import "@abi-software/map-side-bar/dist/style.css";
//import { acupointEntries } from './acupoints.js'
import { ScaffoldVuer } from "@abi-software/scaffoldvuer";
import "@abi-software/scaffoldvuer/dist/style.css";
import {
  DataAnalysis as ElIconDataAnalysis,
  EditPen as ElIconEditPen,
  FolderOpened as ElIconFolderOpened,
  QuestionFilled as ElIconQuestionFilled,
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

const convertToPrimitivesName = original => {
  const name = original.replace(" ", "");
  return [`${name} left`, `${name} right`];
}

const convertFromPrimitivesName = original => {
  let name = original.substring(0, original.indexOf(" "));
  if (name) {
    name = `${name.substring(0, 2)} ${name.substring(2, 4)}`
  } else {
    name = original;
  }
  return name;
}

export default {
  name: "SimpleTexture",
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
    ElIconQuestionFilled,
    ScaffoldVuer,
    SideBar,
  },
  data: function () {
    return {
      acupoints: undefined,
      acupointsLabelOn: false,
      alignPoint: true,
      bodyScaffold: undefined,
      displayAxis: false,
      glyphs: markRaw([]),
      quickEditOn: false,
      displayUI: true,
      ElIconDataAnalysis: shallowRef(ElIconDataAnalysis),
      ElIconEditPen: shallowRef(ElIconEditPen),
      ElIconFolderOpened: shallowRef(ElIconFolderOpened),
      ElIconQuestionFilled: shallowRef(ElIconQuestionFilled),
      coordinatesClicked: [],
      positionalRotation: true,
      needlesInfo: {},
      infoVisible: false,
      importing: false,
      url: "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/tara/10-Nov-25/smaller_metadata.json",
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
    pointTolerance: {
      type: Number,
      default: 20,
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
    addPremadePoints: function() {
      const viewer = this.$refs.scaffold;
      const scene = viewer.$module.scene;
      const points = [
        [211.58, 22.313, -407.20],
        [61.66, 99.09, -353.20],
        [91.28, 105.74, -332.80],
        [44.73, 99.09, -301.60],
        [82.21, 97.88, -264.40],
        [217.63, 21.10, -254.80],
        [-65.90, 48.31, -257.20],
        [189.22, 63.42, -246.40],
      ];
      const pointName = "point_";
      let order = 1;
      points.forEach((point) => {
        scene.createPoints(
          "_annotations/premade",
          `${pointName}${order}`,
          [point],
          `point_${order}`,
          0x0022ee,
        );
        order++;
      });

    },
    onReady: async function () {
      this.addPremadePoints();
      await this.readTexture();
      if (this.displayAxis) {
        this.$refs.scaffold.createAxisDisplay(false);
        this.$refs.scaffold.enableAxisDisplay(true, false);
      }
    },
    openHelp: function() {
      window.open("https://github.com/ABI-Software/TARA-ScaffoldVuer/blob/acupoint/README.md#overview", "_blank")
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
      const prefix = 'acupointsAnnotations';
      const data = {
        annotations: annotations,
        acupoints: this.acupoints
      }
      const date = JSON.stringify(new Date());
      writeTextFile(`${prefix}${date}.json`, data);
    },
    onReaderLoad: function(event) {
      const data = JSON.parse(event.target.result);
      let annotations = undefined;
      let acupoints = undefined;
      if (Array.isArray(data)) {
        annotation = data;
      } else {
        if ('annotations' in data) {
          annotations = data['annotations'];
        }
        if ('acupoints' in data) {
          acupoints = data['acupoints'];
        }
      }
      this.importing = true;
      if (annotations) {
        this.$refs.scaffold.importOfflineAnnotations(annotations);
      }
      if (acupoints) {
        if (!this.acupoints) {
          this.acupoints = {};
        }
        Object.assign(this.acupoints, acupoints);
      }
      this.importing = false;
    },
    importLocalAnnotations: function() {
      const selectedFile = document.getElementById("annotations-upload").files[0];
      const reader = new FileReader();
      reader.onload = this.onReaderLoad;
      reader.readAsText(selectedFile);
    },
    addAcupointInfo: function(zincObject) {
      if (!this.acupoints) this.acupoints = {};
      const label = zincObject.groupName;
      if (label) {
        if (!(label in this.acupoints)) {
          this.acupoints[label] = {Acupoint: label};
        }
        this.$nextTick(() => {
          if (label && this.$refs.sideBar) {
            this.$refs.sideBar.openAcupointsSearch(label);
          }
        });
      }
    },
    setBodyScaffoldPickable: function(flag) {
      if (this.bodyScaffold) {
        this.bodyScaffold.setIsPickable(flag);
      }
    },
    objectAdded: function (zincObject) {
      if (!zincObject.isLines2) {
        const regionName = zincObject.region?.getName()
        if (regionName && regionName === "skin") {
          zincObject.setIsPickable(false);
          this.bodyScaffold = markRaw(zincObject);
        }
        if (zincObject.groupName === "iso_block") {
          this.bodyScaffold = markRaw(zincObject);
          this.bodyScaffold.setPosition(-240, -259, -445.6);
          const group = this.bodyScaffold.getGroup();
          group.scale.set(1.2, 1.2, 1.2);
          group.updateMatrix();
          this.bodyScaffold.boundingBoxUpdateRequired = true;
        }
        this._pickableObjects.push(zincObject);
        if (zincObject.isGlyphset) {
          zincObject.setScaleAll(2);
          this.glyphs.push(zincObject);
        } else if (zincObject.isPointset) {
          zincObject.setSize(15);
          zincObject.setColourHex(0xff5724);
          this.addAcupointInfo(zincObject);
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
    readTexture: async function () {
      const viewer = this.$refs.scaffold;
      viewer.offlineAnnotationEnabled = true;
      if (this.consoleOn) console.log("Lines length", this._createLinesLength);
      const Zinc = this.$refs.scaffold.$module.Zinc;
      if (this.textureUrl) {
        const ele = this.$refs.taraContainer;
        const original = ElMessage({
          message: 'Downloading texture',
          showClose: true,
          duration: 0,
          appendTo: ele,
        });
        const newTexture = await readNIFTIFromURL(Zinc, this.textureUrl, true);
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
          console.log(newTexture.getBoundingBox())
          viewer.$module.scene.viewAll();
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
    onSelected: function (data) {
      if (data && data.length > 0 && data[0].data.group) {
        if (this.consoleOn) {
          console.log(data[0].extraData.intersects);
          console.log(data[0], data[0].extraData.intersected);
        }
        if (data && data.length > 0) {
          const zincObject = data[0].data?.zincObject;
          if (zincObject.isGlyphset || zincObject.isPointset) {
            let label = zincObject.groupName;
            if (data[0].data.group && zincObject.isGlyphset) {
              label = convertFromPrimitivesName(data[0].data.group);
            }
            if (label && label.trim() && this.$refs.sideBar) {
              this.$refs.sideBar.openAcupointsSearch(label);
            }
            if (this.alignPoint && data.length === 1 && zincObject.isGlyphset) {
              const {point, normal} = this.findNearestPointAndNormalFromObject(
                zincObject);
              this.setViewWithPointAndNormalV3(point, normal);
            }
          } else if (this.quickEditOn && data[0].extraData.worldCoords &&
              data[0].extraData.intersected?.face) {
            this.addPoint(data, data[0].extraData.worldCoords);
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

:deep(.left-buttons) {
  width: 97px;
}

.settings-panels {
  z-index:10000;
  left:0px;
  position:absolute;
  text-align: left;
  background-color: rgba(255, 255, 255, 0.5);
  width:400px;

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
