<template>
  <div class="reader-container">
    <el-row :gutter="20">
      <el-col>
        {{ `${name}:` }}
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="18">
        <el-input
          disabled
          :value="resource"
          placeholder="Please Choose a File or URL."
        />
      </el-col>
      <el-col :span="3">
        <el-button @click="local">
          Local Drive
        </el-button>
      </el-col>
      <el-col :span="3">
        <el-button @click="url">
          URL
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */

const readFolder = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.webkitdirectory = true;
  input.addEventListener('change', (event) => {
    const files = event.target.files;
    console.log(files);
  });
}

import {
  ElButton as Button,
  ElCol as Col,
  ElInput as Input,
  ElRow as Row,
} from "element-plus";

export default {
  name: "UrlFileReader",
  components: [
    Button,
    Col,
    Input,
    Row,
  ],
  created: function() {
    this.mask = this.maskURL;
  },
  data() {
    return {
      path: ""
    }
  },
  props: {
    placeholderText: {
      type: String,
      default:"Please Choose a File",
    },
    name: {
      type: String,
      default: "",
    },
    resource: {
      type: String,
      default: "",
    },
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

.reader-container {
  border-color: black;
}

</style>