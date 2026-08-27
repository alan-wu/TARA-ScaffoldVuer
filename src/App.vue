<script setup>
import TaraScaffoldVuer from './components/TaraScaffoldVuer.vue';
</script>

<template>
  <div id="app">
    <SimpleTexture
      v-if="routerIsReady"
      ref="viewer"
      :url="url"
      :acupoints-endpoint="acupoints"
      :mask-url="maskURL"
      :texture-url="textureURL"
      :console-on="false"
      :confirmRequired="confirmRequired"
      @sidebar-mounted="sidebarMounted"
    />
    <!--
    <TaraScaffoldVuer
      v-else
      :acupointsViewer="mode === 'acupoints'"
      :url="url"
      :acupoints-endpoint="acupoints"
      :texture-url="textureURL"
      :console-on="false"
    />
    -->
  </div>
</template>

<script>
export default {
  name: "app",
  data: function () {
    return {
      /* Settings for standard viewer */
      //acupointsViewer: true,
      //url: "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/texture/arm1/arm_metadata.json",
      /* Settings for acupoint viewer */
      /*
       * modes: simple, acupoints and needles
       */
      mode: "simple",
      acupointsViewer: true,
      confirmRequired: false,
      //url: "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/tara/whole_body-30-1-25/human_body_acupoints_metadata.json",
      //url: "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/tara/10-Nov-25/cut_metadata.json",
      routerIsReady: false,
      url: undefined,
      textureURL: undefined,
      maskURL: undefined,
      acupoints: import.meta.env.VITE_ACUPOINTS_API,
      demo: false,
    }
  },
  created: function() {
    if (document) document.title = "Tara Acupoints Viewer"
  },
  methods: {
    sidebarMounted: function() {
      this.$router.isReady().then(async () => {
        if (Object.keys(this.$route.query).includes("demo")) {
          this.$refs.viewer?.setupDemo();
        }
      });
    },
    waitForRouter: function () {
      this.$router.isReady().then(async () => {
        this.routerIsReady = true;
        const query = this.$route.query;
        if (query.seg) {
          this.url = query.seg;
        } else {
          this.url = import.meta.env.VITE_SCAFFOLD_LOCATION;
        }
        if (query.textureURL) {
          this.textureURL = query.textureURL;
        } else {
          this.textureURL = import.meta.env.VITE_TEXTURE_LOCATION;
        }
        if (query.maskURL) {
          this.maskURL = query.maskURL;
        } else {
          this.maskURL = import.meta.env.VITE_MASK_LOCATION;
        }
        if (Object.keys(query).includes("tbc")) {
          this.confirmRequired = true;
        }
      });
    },
  },
  mounted: function() {
    this.waitForRouter();
  },
}

</script>

<style>
#app {
  font-family: "Asap", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  position: absolute;
  overflow: hidden;
}

body {
  margin: 0px;
  overflow: hidden;
}
/* Component Styles */
</style>
