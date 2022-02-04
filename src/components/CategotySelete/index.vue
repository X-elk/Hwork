<template>
  <div>
    <el-form v-model="cForm" :inline="true" :disabled="!isshow">
      <el-form-item label="一级分类">
        <!-- v-model保存的时当前选择的value值 -->
        <el-select
          placeholder="请选择"
          v-model="cForm.category1Id"
          @change="categoory2Idlist"
        >
          <el-option
            :label="c1.name"
            :value="c1.id"
            v-for="c1 in category1Idlist"
            :key="c1.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select
          placeholder="请选择"
          v-model="cForm.category2Id"
          @change="categoory3Idlist"
        >
          <el-option
            :label="c2.name"
            :value="c2.id"
            v-for="c2 in category2Idlist"
            :key="c2.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select
          placeholder="请选择"
          v-model="cForm.category3Id"
          @change="handelcategoory"
        >
          <el-option
            :label="c3.name"
            :value="c3.id"
            v-for="c3 in category3Idlist"
            :key="c3.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategoryName",
  props: ["isshow"],
  data() {
    return {
      category1Idlist: [],
      category2Idlist: [],
      category3Idlist: [],
      cForm: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
    };
  },
  mounted() {
    this.categoory1Idlist();
  },
  methods: {
    // 请求一级分类列表
    async categoory1Idlist() {
      try {
        const result = await this.$API.catory.getCategory1Idlist();
        if (result.code === 200 || result.code === 20000) {
          this.category1Idlist = result.data;
        } else {
          this.$message.error("获取一级分类失败");
        }
      } catch (error) {
        this.$message.error("请求获取一级分类失败");
      }
    },
    // 单击一级请求二级分类列表  触发一级id传值
    async categoory2Idlist(category1Id) {
      // 当再次点击时清空2、3级列表
      this.category2Idlist = [];
      this.category3Idlist = [];
      this.cForm.category2Id = "";
      this.cForm.category3Id = "";
      // 当触发时给他的父级传递id
      this.$emit("getCategoryId", { categoryId: category1Id, level: 1 });

      try {
        const result = await this.$API.catory.getCategory2Idlist(category1Id);
        if (result.code === 200 || result.code === 20000) {
          this.category2Idlist = result.data;
        } else {
          this.$message.error("获取二级分类失败");
        }
      } catch (error) {
        this.$message.error("请求获取二级分类失败");
      }
    },
    // 单击二级请求三级分类列表  触发二级id传值
    async categoory3Idlist(category2Id) {
      this.category3Idlist = [];
      this.cForm.category3Id = "";
      // 当触发时给他的父级传递id
      this.$emit("getCategoryId", { categoryId: category2Id, level: 2 });
      try {
        const result = await this.$API.catory.getCategory3Idlist(category2Id);
        if (result.code === 200 || result.code === 20000) {
          this.category3Idlist = result.data;
        } else {
          this.$message.error("获取三级分类失败");
        }
      } catch (error) {
        this.$message.error("请求获取三级分类失败");
      }
    },
    //  单击三级触发二级id传值
    handelcategoory(category3Id) {
      // 当触发时给他的父级传递id
      this.$emit("getCategoryId", { categoryId: category3Id, level: 3 });
    },
  },
};
</script>

<style>
</style>