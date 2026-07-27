<template>
  <div class="input-parent">
    <div class="input-container">
      <UrlFileReader
        name="Scaffold"
        folder
        v-model:resource="scaffold"
      />
      <UrlFileReader
        name="Texture"
        type=".nii, .nii.gz"
        v-model:resource="texture"
        :required="requireTexture"
      />
      <UrlFileReader
        name="Texture Mask"
        type=".nii, .nii.gz"
        v-model:resource="mask"
        :required="false"
      />
      <el-row :gutter="20">
        <el-button
          size="default"
          :disabled="!readyToConfirm"
          @click="confirm()">
          Confirm
        </el-button>
      </el-row>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import UrlFileReader from './UrlFileReader.vue';
import {
  ElButton as Button,
  ElCol as Col,
  ElRow as Row,
} from "element-plus";

export default {
  name: "FileInput",
  components: {
    Button,
    Col,
    Row,
    UrlFileReader,
  },
  data() {
    return {
      mask: "",
      scaffold: "",
      texture: "",
    }
  },
  props: {
    requireTexture: {
      type: Boolean,
      default: false,
    },
    maskURL: {
      type: String,
      default: "",
    },
    scaffoldURL: {
      type: String,
      default: "",
    },
    textureURL: {
      type: String,
      default: "",
    },
  },
  computed: {
    readyToConfirm: function() {
      return this.scaffold && (!this.requireTexture || this.texture);
    },
  },
  created: function() {
    this.mask = this.maskURL;
    this.scaffold = this.scaffoldURL;
    this.texture = this.textureURL;
  },
  methods: {
    confirm: function() {
      this.$emit('updateURLs', {
        scaffold: this.scaffold,
        texture: this.texture,
        mask: this.mask
      });
    },
  }
};
</script>

<style scoped lang="scss">

.input-parent {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center; /* Centers horizontally */
  align-items: center;     /* Centers vertically */
}

.input-container {
  width: 800px;
}

</style>