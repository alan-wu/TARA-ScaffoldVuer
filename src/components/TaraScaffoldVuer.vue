<template>
  <div class="scaffold-container" ref="taraContainer">
    <div class="settings-panels">
      <template v-if="acupointsViewer">
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
            <el-row :gutter="20" justify="center" align="middle">
              <el-col :span="auto">
                <el-button
                  class="left-buttons"
                  size="small"
                  @click="displayLabels()">
                  Display labels
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="20" justify="center" align="middle">
              <el-col :span="auto">
                <el-button
                  class="left-buttons"
                  size="small"
                  @click="frontView()">
                  Front view
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="20" justify="center" align="middle">
              <el-col :span="auto">
                <el-button
                  class="left-buttons"
                  size="small"
                  @click="backView()">
                  Back view
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="20" justify="center" align="middle">
              <el-col :span="auto">
              <el-switch
                v-model="alignPoint"
                active-text="Align Point"
              />
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
    <ScaffoldVuer
      v-if="url"
      ref="scaffold"
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
      :show-colour-picker="false"
      :render="true"
      @on-ready="onReady"
      @scaffold-selected="onSelected"
      @user-primitives-updated="userPrimitivesUpdated"
      @zinc-object-added="objectAdded"
    />
    <SideBar
      v-if="acupoints"
      ref="sideBar"
      class="side-bar"
      :visible="true"
      :activeTabId="1"
      :tabs="sidebarTabs"
      :open-at-start="true"
      :acupointsInfoList="acupoints"
      @acupoints-clicked="onAcupointsClicked"
      @acupoints-hovered="onAcupointsHovered"
      @vue:mounted="onSidebarMount"
    />
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { markRaw, shallowRef } from 'vue';
import { ElMessage } from 'element-plus'
import NeedlesTable from "./NeedlesTable.vue";
import { readNIFTIFromSource } from "./niftiReader.js"
import { SideBar } from "@abi-software/map-side-bar";
import "@abi-software/map-side-bar/dist/style.css";
import { ScaffoldVuer } from "@abi-software/scaffoldvuer";
import scaffoldMixin from "../mixins/scaffold.vue";
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
import 'element-plus/es/components/message/style/css'; // this is only needed if the page also used ElMessage

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

const convertFromPrimitivesName = original => {
  let name = original.substring(0, original.indexOf(" "));
  if (name) {
    name = `${name.substring(0, 2)} ${name.substring(2, 4)}`
  } else {
    name = original;
  }
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
    ElIconQuestionFilled,
    NeedlesTable,
    ScaffoldVuer,
    SideBar,
  },
  mixins: [scaffoldMixin],
  data: function () {
    return {
      acupointsLabelOn: false,
      alignPoint: true,
      bodyScaffold: undefined,
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
      sidebarTabs: [
        {title: 'Acupoints', id: 1, type: 'acupoints' },
      ],
      messageSettings: {
        duration: 0,
        message: "Downloading Texture"
      }

    };
  },
  props: {
    pointTolerance: {
      type: Number,
      default: 20,
    },
    acupointsViewer: {
      type: Boolean,
      default: false,
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
    this.acupointsInfo = this.acupointsViewer;
  },
  methods: {
    openHelp: function() {
      window.open("https://github.com/ABI-Software/TARA-ScaffoldVuer/blob/acupoint/README.md#overview", "_blank")
    },
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
        this._pickableObjects.push(zincObject);
        if (zincObject.isGlyphset) {
          zincObject.setScaleAll(2);
          this.glyphs.push(zincObject);
        } else if (zincObject.isPointset) {
          zincObject.setSize(15);
          zincObject.setColourHex(0xff5724);
          this.addAcupointsInfo(zincObject, false);
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
    onReady: async function () {
      const viewer = this.$refs.scaffold;
      viewer.offlineAnnotationEnabled = true;
      const bounds = viewer.$module.scene.getBoundingBox();
      const d = bounds.max.distanceTo( bounds.min );
      this._createLinesLength = d / 6.0;
      if (this.consoleOn) console.log("Lines length", this._createLinesLength);
      this.readAcupoints();
      const Zinc = this.$refs.scaffold.$module.Zinc;
      if (this.textureUrl) {
        const ele = this.$refs.taraContainer;
        const original = ElMessage({
          message: 'Downloading texture',
          showClose: true,
          duration: 0,
          appendTo: ele,
        });
        const newTexture = await readNIFTIFromSource(Zinc, this.textureUrl, false);
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
        if (this.acupointsViewer) {
          if (data && data.length > 0) {
            const zincObject = data[0].data?.zincObject;
            if (zincObject.isGlyphset || zincObject.isPointset) {
              let label = zincObject.groupName;
              if (data[0].data.group) {
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
        } else if (this.quickEditOn && data[0].extraData.worldCoords) {
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
        }
      }
    },
  },
};
</script>


<style scoped lang="scss">

@import "../assets/styles.scss";

</style>
