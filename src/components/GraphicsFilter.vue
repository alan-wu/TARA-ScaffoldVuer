<template>
  <div class="block">
    <el-row>
      <el-col :span="12">
        <span class="display">Acupoints Filter:</span>
      </el-col>
      <el-col :span="12">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
          class="checkbox-all"
        >
          Check all
        </el-checkbox>
      </el-col>
    </el-row>
    <el-checkbox-group v-model="filters" size="small" class="checkbox-group">
      <el-checkbox-button
        v-for="filter in filtersList"
        :key="filter"
        :value="filter"
        @change="changedEvent(filter, $event)"
        class="standard"
      >
        {{ filter }}
      </el-checkbox-button>
      <el-checkbox-button
        v-if="includeOthers"
        key="Others"
        value="Others"
        @change="changedEvent('Others', $event)"
      >
         Others
      </el-checkbox-button>
    </el-checkbox-group>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  ElCheckbox as Checkbox,
  ElCheckboxButton as CheckboxButton,
  ElCheckboxGroup as CheckboxGroup,
  ElCol as Col,
  ElContainer as Container,
  ElRow as Row,
} from "element-plus";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "GraphicsFilter",
  components: {
    Checkbox,
    CheckboxButton,
    CheckboxGroup,
    Col,
    Container,
    Row,
  },
  props: {
    filtersList : {
      type: Array,
      default: [],
    },
    includeOthers : {
      type: Boolean,
      default: false,
    },
  },
  data: function() {
    return {
      checkAll: true,
      filters: [],
      isIndeterminate: false,
      oldValue: undefined,
    }
  },
  methods: {
    changedEvent: function(meridian, flag) {
      this.$emit("toggleMeridian", {meridian, flag});
      this.isIndeterminate = true;
      let count = this.filtersList.length;
      if (this.includeOthers) count = count + 1;
      if (this.filters.length === count) {
        this.checkAll = true;
        this.isIndeterminate = false;
      } else if (this.filters.length === 0) {
        this.checkAll = false;
        this.isIndeterminate = false;
      }
    },
    handleCheckAllChange: function(flag) {
      if (flag === true) {
        this.checkAll = true;
        this.isIndeterminate = false;
        this.filters = [...this.filtersList]
        if (this.includeOthers) this.filters.push("Others");
        this.filters.forEach((meridian) => {
          this.$emit("toggleMeridian", {meridian, flag});
        });
      } else {
        this.checkAll = false;
        this.isIndeterminate = false;
        this.filters.forEach((meridian) => {
          this.$emit("toggleMeridian", {meridian, flag});
        });
        this.filters.length = 0;
      }
    },
  },
  watch: {
    filtersList: {
      handler: function (newValue) {
        if (this.oldValue) {
          newValue.forEach(newKey => {
            if (!this.oldValue.includes(newKey)) {
              this.filters.push(newKey);
            }
          });
        } else {
          this.filters.length = 0;
          newValue.forEach(newKey => {
            this.filters.push(newKey);
          });
        }
        this.oldValue = [...newValue];
        //Check if there is any filter that has been removed
        for (let i = this.filters.length - 1; i >= 0; i--) {
          if (this.filters[i] !== "Others") {
            if (!(this.filtersList.includes(this.filters[i]))) {
              this.filters.splice(i, 1);
            }
          }
        }

      },
      deep: true,
      immediate: true,
    },
    includeOthers: {
      handler: function (newValue) {
        if (newValue) {
          this.filters.push("Others")
        } else {
          const index = this.filters.indexOf('Others');
          if (index > -1) {
            this.filters.splice(index, 1);
          }
        }
      },
      immediate: true,
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

:deep(.checkbox-group) {
  margin-top: 8px;
  margin-bottom: 8px;
}

:deep(.standard) {
  .el-checkbox-button__inner {
    width:35px;
  }
}

:deep(.el-checkbox-button) {
  border-left:1px solid rgb(220,223,230);
}

.display {
  font-size: 14px;
  width: 44px;
  padding-bottom:4px;
}

.main {
  font-size: 13px;
  padding: 20px 17px 0 15px;
}

.block {
  left: 40px;
  top: 57px;
  width: 250px;
  margin: 4px;
}

.checkbox-all {
  height: 20px;
}

</style>
