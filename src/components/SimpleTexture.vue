<template>
  <div class="scaffold-container" ref="taraContainer">
    <div v-if="readyForDisplay" class="scaffold-container">
      <div class="settings-panels">
        <el-row>
          <el-col :span="12">
            <el-row :gutter="20" justify="center" align="middle">
              <el-col>
                <el-button
                  class="left-buttons"
                  size="small"
                  :icon="ElIconQuestionFilled"
                  @click="openHelp()">
                  Help
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="20" justify="center" align="middle">
                <el-col>
                  <el-button
                    class="left-buttons"
                    size="small"
                    @click="rotate()">
                    Rotate
                  </el-button>
                </el-col>
              </el-row>
          </el-col>
          <el-col :span="12">
            <el-row :gutter="20" justify="center" align="middle">
              <el-col>
                <el-button
                  size="small"
                  :icon="ElIconFolderOpened"
                  @click="exportLocalAnnotations()">
                  Export AnnotationsintMode
                </el-button>
              </el-col>
              <el-col>
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
              <el-col>
                <el-button
                  size="small"
                  @click="addPremadePoints()">
                  Load predefined points
                </el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          Interactive Mode:
        </el-row>
        <el-row>
          <el-col class="extra-wide">
            <el-radio-group v-model="intMode" size="small">
              <el-radio value="view" border>Viewing</el-radio>
              <el-radio value="create" border>Create</el-radio>
              <el-radio value="edit" border>Edit</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
      </div>
      <ScaffoldVuer
        ref="scaffold"
        class="vuer main-column"
        :class="['vuer', isDrawerOpen ? 'collapsed' : '']"
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
      <SideBar
        v-if="acupoints && (Object.keys(acupoints)).length > 0"
        ref="sideBar"
        class="side-bar main-column"
        :visible="true"
        :activeTabId="1"
        :tabs="sidebarTabs"
        :open-at-start="false"
        :acupointsInfoList="acupoints"
        @acupoints-clicked="onAcupointsClicked"
        @acupoints-hovered="onAcupointsHovered"
        @vue:mounted="onSidebarMount"
      />
    </div>
    <div v-else class="scaffold-container">
      <FileInput
        v-model:maskURL="mURL"
        v-model:scaffoldURL="sURL"
        v-model:textureURL="tURL"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
//import { getMergedGeometry, scaffoldSmoothing } from "../scripts/Utilities.js";
import { markRaw, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import { readNIFTIFromURL } from "./niftiReader.js"
import { SideBar } from "@abi-software/map-side-bar";
import "@abi-software/map-side-bar/dist/style.css";
import { ScaffoldVuer } from "@abi-software/scaffoldvuer";
import "@abi-software/scaffoldvuer/dist/style.css";
import {
  DataAnalysis as ElIconDataAnalysis,
  EditPen as ElIconEditPen,
  FolderOpened as ElIconFolderOpened,
  QuestionFilled as ElIconQuestionFilled,
} from '@element-plus/icons-vue';
import scaffoldMixin from "../mixins/scaffold.vue";
import {
  ElButton as Button,
  ElCol as Col,
  ElIcon as Icon,
  ElInput as Input,
  ElInputNumber as InputNumber,
  ElPopover as Popover,
  ElRadio as Radio,
  ElRadioGroup as RadioGroup,
  ElRow as Row,
  ElSwitch as Switch,
} from "element-plus";
import 'element-plus/es/components/message/style/css'; // this is only needed if the page also used ElMessage
import FileInput from './FileInput.vue';

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
    Radio,
    RadioGroup,
    Row,
    Switch,
    ElIconEditPen,
    ElIconFolderOpened,
    ElIconQuestionFilled,
    ScaffoldVuer,
    SideBar,
  },
  mixins: [scaffoldMixin],
  data: function () {
    return {
      acupointsLabelOn: false,
      alignPoint: false,
      bodyScaffold: undefined,
      displayAxis: false,
      glyphs: markRaw([]),
      displayUI: true,
      ElIconDataAnalysis: shallowRef(ElIconDataAnalysis),
      ElIconEditPen: shallowRef(ElIconEditPen),
      ElIconFolderOpened: shallowRef(ElIconFolderOpened),
      ElIconQuestionFilled: shallowRef(ElIconQuestionFilled),
      intMode: "view",
      coordinatesClicked: [],
      positionalRotation: true,
      needlesInfo: {},
      infoVisible: false,
      sidebarTabs: [
        {title: 'Acupoints', id: 1, type: 'acupoints' },
      ],
      messageSettings: {
        duration: 0,
        message: "Downloading Texture"
      },
      mURL: undefined,
      sURL: undefined,
      tURL: undefined,
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
  },
  computed: {
    readyForDisplay: function() {
      //return false;
      if (this.url) {
        return (!this.requireTexture || (this.url && this.textureUrl));
      }
      return false;
    },
  },
  watch: {
    intMode: {
      handler: function (value) {
        if (this.$refs.scaffold) {
          this.$refs.scaffold.cancelCreate();
          if (value === "create") {
            this.$refs.scaffold.createData.shape = "Point";
          } else {
            this.$refs.scaffold.createData.shape = "";
          }
        }
      },
    }
  },
  created: function() {
    this.mURL = this.maskUrl;
    this.sURL = this.url;
    this.tURL = this.textureUrl;
  },
  mounted: function () {
    this._createLinesLength = 100;
    this._pickableObjects = [];
    if (this.$refs.scaffold) {
      const Zinc = this.$refs.scaffold.$module.Zinc;

      const scene  = this.$refs.scaffold.$module.scene;
      this._rayCaster = new Zinc.RayCaster(
        scene,
        scene,
        undefined,
        undefined,
      );
    }
    this.acupointsInfo = true;
  },
  methods: {
    addPremadePoints: function() {
      const viewer = this.$refs.scaffold;
      const scene = viewer.$module.scene;
      //for torso
      //const points = [
      //  [211.58, 22.313, -407.20],
      //  [61.66, 99.09, -353.20],
      //  [91.28, 105.74, -332.80],
      //  [44.73, 99.09, -301.60],
      //  [82.21, 97.88, -264.40],
      //  [217.63, 21.10, -254.80],
      //  [-65.90, 48.31, -257.20],
      //  [189.22, 63.42, -246.40],
      //];
      //for whole body
      const points = [
        [80.066, 226.318, 940.800],
        [541.301, 263.315, 1164],
        [361.863, 267.015, 112.800],
        [360.630, 335.460, 108],
        [363.097, 301.546, 190.800]
      ];
      const pointName = "point_";
      let order = 1;
      this.loadingPredefined = true;
      points.forEach((point) => {
        const object = scene.createPoints(
          "Predefined",
          `${pointName}${order}`,
          [point],
          `point_${order}`,
          0xffff00,
        );
        object.zincObject.isEditable = true;
        order++;
      });
      this.loadingPredefined = false;
    },
    onReady: async function () {
      //this.addPremadePoints();
      this.$refs.scaffold.backgroundChangeCallback('black');
      sessionStorage.setItem('anonymous-annotation', JSON.stringify([]));
      this.readAcupoints();
      await this.readTexture();
      if (this.displayAxis) {
        this.$refs.scaffold.createAxisDisplay(false);
        this.$refs.scaffold.enableAxisDisplay(true, false);
      }
    },
    openHelp: function() {
      window.open("https://github.com/ABI-Software/TARA-ScaffoldVuer/blob/acupoint/README.md#overview", "_blank")
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
        if (zincObject.groupName === "Body") {
          this.bodyScaffold = markRaw(zincObject);
          console.log(this.bodyScaffold.getBoundingBox());
        }
        if (zincObject.groupName === "iso_block") {

          this.bodyScaffold = markRaw(zincObject);
          const mesh = zincObject.getMorph();
          /*
          if (mesh) {
            //scaffoldSmoothing(mesh.geometry, 3, 0.5);
            //console.log("Done")
            const newGeometry = getMergedGeometry(mesh.geometry);
            if (newGeometry) {
              mesh.geometry.dispose();
              mesh.geometry = newGeometry;
            }
          }
          */
          //scaffoldSmoothing(this.bodyScaffold, 3, 0.5);
          this.bodyScaffold.setPosition(-240, -259, -445.6);
          const group = this.bodyScaffold.getGroup();
          group.scale.set(1.2, 1.2, 1.2);
          group.updateMatrix();
          this.bodyScaffold.boundingBoxUpdateRequired = true;
          const morph = zincObject.getGroup();
          if (morph && morph.position) {
            zincObject.userData.originalPos = [
              morph.position.x,
              morph.position.y,
              morph.position.z
            ];
          }
        }
        this._pickableObjects.push(zincObject);
        if (zincObject.isGlyphset) {
          zincObject.setScaleAll(2);
          this.glyphs.push(zincObject);
        } else if (zincObject.isPointset) {
          zincObject.setSize(15);
          if (!this.loadingPredefined) {
            zincObject.setColourHex(0xff5724);
          }
          this.addAcupointsInfo(zincObject);
        } else {
          if (zincObject.groupName === "undefined" &&
            zincObject._lod?._material?.side) {
            zincObject._lod._material.side =  THREE.FrontSide;
          }
        }
      } else {
        this.userPrimitivesUpdated({zincObject});
      }
      this.$refs.scaffold.cancelCreate();
      //this.$refs.scaffold.createData.shape = "";
    },
    screenCapture: function () {
      this.$refs.scaffold.captureScreenshot("capture.png");
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
        const newTexture = await readNIFTIFromURL(Zinc, this.textureUrl, true, this.maskUrl);
        if (newTexture) {
          ElMessage({
            message: 'Texture loaded Successfully',
            showClose: true,
            duration: 6000,
            type: "success",
            appendTo: ele,
          });
          original.close();
          newTexture.setIsPickable(false);
          viewer.$module.scene.addZincObject(newTexture);
          viewer.$module.scene.viewAll();
          this.calculateTextureCentre(newTexture);
          newTexture.setVisibility(false);
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
    onSelected: function (data) {
      if (data && data.length > 0 && data[0].data.group) {
        if (this.consoleOn) {
          console.log(data[0].extraData.intersects);
          console.log(data[0], data[0].extraData.intersected);
        }
        if (!this.loadingPredefined) {
          if (data && data.length > 0) {
            const zincObject = data[0].data?.zincObject;
            if (zincObject.isGlyphset || zincObject.isPointset) {
              let label = zincObject.groupName;
              if (data[0].data.group && zincObject.isGlyphset) {
                label = convertFromPrimitivesName(data[0].data.group);
              }
              if (this.intMode === "view") {
                if (label && label.trim() && this.$refs.sideBar) {
                  this.$refs.sideBar.openAcupointsSearch(label);
                }
              }
              if (this.intMode === "edit" && zincObject.isPointset && zincObject.isEditable) {
                this.$refs.scaffold.activateEditingMode(data);
              }
              if (this.alignPoint && data.length === 1 && zincObject.isGlyphset) {
                const {point, normal} = this.findNearestPointAndNormalFromObject(
                  zincObject);
                this.setViewWithPointAndNormalV3(point, normal);
              }
            } else if (this.intMode === "create" && data[0].extraData.worldCoords &&
                data[0].extraData.intersected?.face) {
              this.addPoint(data, data[0].extraData.worldCoords);
            } else if (this.intMode === "edit") {
              //if (this.$refs.scaffold.createData)
              if (this.$refs.scaffold.createData.editingIndex > -1) {
                this.$refs.scaffold.draw(data);
              }
            }
          }
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">

@import "../assets/styles.scss";

</style>
