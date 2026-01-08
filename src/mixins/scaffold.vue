<script>
import { THREE } from "zincjs";
import { watchEffect } from 'vue';
import { acupointEntries } from '../acupoints.js';
import { markRaw } from 'vue';

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();
const viewportSettings = [
        {
          "nearPlane": 0.027395078287421885,
          "farPlane": 2683.7607807805707,
          "eyePosition": [
              -0.0000095367431640625,
              -20.000009536743164,
              484.4976341266126
          ],
          "targetPosition": [
              -0.0000095367431640625,
              -20.000009536743164,
              -222.8000030517578
          ],
          "upVector": [
              0,
              1,
              0
          ]
        },
        {
          "nearPlane": 0.027395078287421885,
          "farPlane": 2683.7607807805707,
          "eyePosition": [
              1.9910875395733882,
              -713.157608674361,
              -349.13651530364507
          ],
          "targetPosition": [
              1.9910875395733882,
              -6.3130423424072495,
              -323.8243323649339
          ],
          "upVector": [
              0,
              -0.03578717304880148,
              0.9993594339601859
          ]
        },
        {
          "nearPlane": 0.027395078287421885,
          "farPlane": 2683.7607807805707,
          "eyePosition": [
              708.4639055284002,
              -20.057694130887516,
              -355.08436352885076
          ],
          "targetPosition": [
              1.9910875395733882,
              -6.3130423424072495,
              -323.8243323649339
          ],
          "upVector": [
              0.04429318816331025,
              0.0045770111274922535,
              0.9990080902833776
          ]
        }
      ];

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

export default {
  name: "scaffoldMixin",
  props: {
    acupointsEndpoint: {
      type: String,
      default: "",
    },
    consoleOn: {
      type: Boolean,
      default: false,
    },
    maskUrl: {
      type: String,
      default: "",
    },
    requireTexture: {
      type: Boolean,
      default: true,
    },
    textureUrl: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/tara/whole_body-30-1-25/human_body_acupoints_metadata.json",
    },
  },
  data: function () {
    return {
      acupoints: {},
      acupointsInfo: false,
      currentViewport: 0,
      glyphs: markRaw([]),
      loadingPredefined: false,
      importing: false,
      isDrawerOpen: false,
      tCentre: [0, 0, 0],
      viewport: undefined,
    }
  },
  computed: {
    readyForDisplay: function() {
      if (this.url) {
        return (!this.requireTexture || (this.url && this.textureUrl));
      }
      return false;
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
  methods: {
    calculateTextureCentre: function(texture) {
      const box = texture.getBoundingBox();
      box.getCenter(v1);
      this.tCentre[0] = v1.x;
      this.tCentre[1] = v1.y;
      this.tCentre[2] = v1.z;
      const control = this.$refs.scaffold.$module.scene.getZincCameraControls();
      this.viewport = control.getCurrentViewport();
    },
    rotate: function() {
      const num = viewportSettings.length;
      let index = this.currentViewport + 1;
      if (index >= num) index = 0;
      this.currentViewport = index;
      const viewport = viewportSettings[index];
      const control = this.$refs.scaffold.$module.scene.getZincCameraControls();
      control.setCurrentCameraSettings(viewport);
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
    addAndCuratedAcupointsLabel: function(label) {
      if (!this.acupoints) this.acupoints = {};
      if (label) {
        if (!(label in this.acupoints)) {
          this.acupoints[label] = {Acupoint: label};
        }
        this.acupoints[label].Curated = true;
      }
    },
    addAcupointsInfo: function(zincObject) {
      this.addAndCuratedAcupointsLabel(label);
      const label = zincObject.groupName;
      if (label) {
        if ((!this.importing && !this.loadingPredefined) && this.intMode === "view") {
          this.$nextTick(() => {
            if (label && this.$refs.sideBar) {
              this.$refs.sideBar.openAcupointsSearch(label);
            }
          });
        }
      }
    },
    readAcupoints: function() {
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
    },
    screenCapture: function () {
      this.$refs.scaffold.captureScreenshot("capture.png");
    },
    exportLocalAnnotations: function() {
      const annotations = this.$refs.scaffold.getOfflineAnnotations();
      const prefix = this.acupointsViewer ? 'acupointsAnnotations' : 'scaffoldAnnotations';
      let data = annotations;
      if (this.acupointsInfo) {
        data = {
          annotations: annotations,
          acupoints: this.acupoints
        }
      }
      const date = JSON.stringify(new Date());
      writeTextFile(`${prefix}${date}.json`, data);
    },
    onReaderLoad: function(event) {
      const data = JSON.parse(event.target.result);
      let annotations = undefined;
      let acupoints = undefined;
      if (Array.isArray(data)) {
        annotations = data;
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
    populateAcupoints: function(data) {
      let filtered = {};
      const keys = Object.keys(data);
      if (this.glyphs && this.glyphs.length) {
        this.glyphs.forEach((glyph) => {
          if (glyph.groupName) {
            const converted = convertFromPrimitivesName(glyph.groupName);
            for (let i = 0; i < keys.length; i++) {
              if (converted.toLowerCase() === keys[i].toLowerCase()) {
                this.addAndCuratedAcupointsLabel(keys[i]);
                filtered[keys[i]] = data[keys[i]];
                break;
              }
            }
          }
        });
      } else {
        filtered = data;
      }
      this.acupoints = data;
    },
    importLocalAnnotations: function() {
      const selectedFile = document.getElementById("annotations-upload").files[0];
      const reader = new FileReader();
      reader.onload = this.onReaderLoad;
      reader.readAsText(selectedFile);
    },
    onSidebarMount: function() {
      const sideBar = this.$refs.sideBar;
      if (sideBar) {
        watchEffect(() => {
          this.isDrawerOpen = sideBar.drawerOpen
        })
      }
    },
    addPoint: function (data, coord) {
      const myViewer = this.$refs.scaffold;
      myViewer.createData.shape = "Point";
      if (this.consoleOn) {
        console.log(myViewer.createData);
        console.log("addPoints", data, coord);
      }
      if (coord) {
        this.$nextTick(() => {
          myViewer.drawPoint(coord, data);
        });
      }
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
    userPrimitivesUpdated: function (payload) {
      if (this.consoleOn) console.log("userPrimitivesUpdated", payload);
      const zincObject = payload.zincObject;
      if ((zincObject.isEditable || this.importing) && zincObject.isLines2) {
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


