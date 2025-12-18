<template>
  <div class="input-container">
    This will be fine
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
  ElTableColumn as TableColumn
} from "element-plus";

export default {
  name: "FileInput",
  components: [
    Button,
    Input,
    Table,
    TableColumn,
    Select,
    Option
  ],
  data() {
    return {
    }
  },
};
</script>

<style scoped lang="scss">
:deep(.el-table__body-wrapper) {
  text-align:justify;
}

.info-container {
  width:500px;
}

.option-container {
  z-index:10005;
}

</style>