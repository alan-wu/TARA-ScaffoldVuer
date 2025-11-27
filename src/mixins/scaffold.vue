<script>
import { THREE } from "zincjs";

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();
const viewportSettings = [
        {
          "nearPlane": 55.774443039904924,
          "farPlane": 2739.5078287421884,
          "eyePosition": [
              -0.0000095367431640625,
              -20.000009536743164,
              892.6888577463396
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
            "nearPlane": 55.774443039904924,
            "farPlane": 2739.5078287421884,
            "eyePosition": [
                -0.0000095367431640625,
                -1249.6590974232422,
                -345.5568026759384
            ],
            "targetPosition": [
                -0.0000095367431640625,
                -20.000009536743164,
                -337.00000178813934
            ],
            "upVector": [
                0,
                -0.00695850891178896,
                0.9999757892838099
            ]
        },
        {
          "nearPlane": 55.774443039904924,
          "farPlane": 2739.5078287421884,
          "eyePosition": [
              -1229.6884956056215,
              -19.041652241257854,
              -336.9933328889
          ],
          "targetPosition": [
              -0.0000095367431640625,
              -20.000009536743164,
              -337.00000178813934
          ],
          "upVector": [
              1.9520111431338925e-18,
              -0.006958508911789514,
              0.9999757892838921
          ]
        }
      ];

export default {
  name: "scaffoldMixin",
  data: function () {
    return {
      tCentre: [0, 0, 0],
      currentViewport: 0,
      viewport: undefined,
    }
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
    screenCapture: function () {
      this.$refs.scaffold.captureScreenshot("capture.png");
    },
    exportLocalAnnotations: function() {
      const annotations = this.$refs.scaffold.getOfflineAnnotations();
      const prefix = this.acupointsViewer ? 'acupointsAnnotations' : 'scaffoldAnnotations';
      let data = annotations;
      if (this.acupointsViewer) {
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
  },

};
</script>


