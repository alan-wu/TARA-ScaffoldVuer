<template>
  <div class="block">
    <span class="display">Acupoints Filter:</span>
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
  ElCheckboxButton as CheckboxButton,
  ElCheckboxGroup as CheckboxGroup,
  ElContainer as Container,
} from "element-plus";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "GraphicsFilter",
  components: {
    CheckboxButton,
    CheckboxGroup,
    Container,
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
      filters: [],
      oldValue: undefined,
    }
  },
  methods: {
    changedEvent: function(meridian, flag) {
      this.$emit("toggleMeridian", {meridian, flag});
    }
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
          newValue.forEach(newKey => {
            this.filters.push(newKey);
          });
        }
        this.oldValue = [...newValue];
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

</style>
