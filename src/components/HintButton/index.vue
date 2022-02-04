<template>
  <a href="javascript:;" :title="title">
    <el-button
      v-bind="$attrs"
      v-on="$listeners"
      style="margin-left: 10px"
    ></el-button>
  </a>
</template>

<script>
export default {
  name: "HinButton",
  props: ["title"],
  data() {
    return {};
  },
};
</script>

<style>
</style>