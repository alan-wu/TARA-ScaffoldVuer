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
          v-model="path"
          @change="changed"
          placeholder="Please Choose a File or URL."
          :clearable="!required"
        />
      </el-col>
      <el-col :span="3">
        <el-button @click="local">
          Local Drive
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { createNiftiURL, createURLFromFiles } from "@abi-software/scaffoldvuer/src/scripts/LocalFilesHelper";

const getNiftiURL = (files) => {
  if (files && files.length > 0) {
    const file = files[0];
    const zipped = (file.type === "application/x-gzip") ? true : false;
    const url = createNiftiURL(file, zipped);
    return url;
  }
  return undefined;
}

const readFolder = async (type, folder) => {
  return new Promise ((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (type) {
      input.accept = type;
    }
    if (folder) {
      input.webkitdirectory = true;
      input.directory = true;
      input.multiple = true;
    }
    input.addEventListener('change', (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        reject(new Error("No file has been selected"));
      } else {
        resolve(files)
      }
    });
    input.click();
  });
}

const processFolder = (files) => {
  const fileArray = Array.from(files).reduce((acc, item) => {
    const entry = [];
    const relativePath = item.webkitRelativePath;
    entry.push("/" + relativePath);
    entry.push(item);
    acc.push(entry);
    return acc;
  }, []);
  return fileArray;
}

const isURLValid = (string) => {
  try {
    const url = new URL(string);
    console.log(url)
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
    this.path = this.resource;
    this.old_path = this.path;
  },
  data() {
    return {
      old_path: "",
      path: ""
    }
  },
  props: {
    placeholderText: {
      type: String,
      default:"Please choose a file or enter an URL",
    },
    folder: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: "",
    },
    resource: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: "",
    }
  },
  methods: {
    changed: function() {
      if (!this.required && !this.path) {
        this.path = "";
        this.old_path = this.path;
        this.$emit('update:resource', this.path);
      }
      if (isURLValid(this.path)) {
        this.old_path = this.path;
        this.$emit('update:resource', this.path);
      } else {
        this.path = this.old_path;
      }
    },
    local: async function() {
      const files = await readFolder(this.type, this.folder);
      if (this.folder && files) {
        const fileArray = processFolder(files);
        const data = await createURLFromFiles(fileArray);
        if (data) {
          this.path = data.url;
          this.$emit('update:resource', this.path);
        }
      } else if (this.type === ".nii, .nii.gz" && files) {
        const url = getNiftiURL(files);
        this.path = url;
        this.$emit('update:resource', this.path);
      }
    }
  }
};
</script>

<style scoped lang="scss">

.reader-container {
  border-color: black;
}

</style>