<template>
  <div class="input-parent">
    <div class="input-container">
      <UrlFileReader
        name="Scaffold"
        v-model:resource="scaffold"
      />
      <UrlFileReader
        name="Texture"
        v-model:resource="texture"
      />
      <UrlFileReader
        name="Texture Mask"
        v-model:resource="mask"
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
  name: "UrlFileReader",
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
      return this.scaffold && this.texture;
    },
  },
  created: function() {
    this.mask = this.maskURL;
    this.scaffold = this.scaffoldURL;
    this.texture = this.textureURL;
  },
  methods: {
    confirm: function() {
      this.$emit('update:scaffoldURL', scaffold);
      this.$emit('update.textureURL', texture);
      this.$emit('update.maskURL', mask);
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