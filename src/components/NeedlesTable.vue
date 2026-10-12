<template>
  <div class="info-container">
    <el-select
      :teleported="false"
      v-model="activeName"
      placeholder="Select"
      style="width: 240px"
      class="option-container"
    >
      <el-option v-for="(value, key) in needlesInfo" :key="key" :label="key" :value="key" />
    </el-select>
    <el-table :data="needlesInfo[activeName]" height="400" style="width: 100%">
      <el-table-column prop="groupName" label="Name" width="100" border stripe />
      <el-table-column prop="distance" label="Distance" width="100" />
      <el-table-column prop="x" label="X" width="100" />
      <el-table-column prop="y" label="Y" width="100" />
      <el-table-column prop="z" label="Z" width="100" />
    </el-table>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */

import {
  ElButton as Button,
  ElSelect as Select,
  ElOption as Option,
  ElInput as Input,
  ElTable as Table,
  ElTableColumn as TableColumn,
} from 'element-plus';

export default {
  name: 'NeedlesTable',
  components: [Button, Input, Table, TableColumn, Select, Option],
  props: {
    needlesInfo: {
      type: Object,
      default: {},
    },
  },
  watch: {
    needlesInfo: {
      handler: function () {
        if (this.activeName === '') {
          const keys = Object.keys(this.needlesInfo);
          if (keys.length > 0) {
            this.activeName = keys[0];
          }
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      activeName: '',
      keys: ['1', '2'],
    };
  },
};
</script>

<style scoped lang="scss">
:deep(.el-table__body-wrapper) {
  text-align: justify;
}

.info-container {
  width: 500px;
}

.option-container {
  z-index: 10005;
}
</style>
