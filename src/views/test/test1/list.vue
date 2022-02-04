<template>
  <div>
    <h1>test1</h1>
    <el-button type="primary" v-if="$btnP('btn.Test1.add')">添加</el-button>
    <el-button type="warning" v-if="$btnP('btn.Test1.update')">修改</el-button>
    <el-button type="danger" v-if="$btnP('btn.Test1.delete')">删除</el-button>
  </div>
</template>

<script>
export default {
  name: "Test1",
};
</script>

<style>
</style>