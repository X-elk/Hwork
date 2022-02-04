<template>
  <div>
    <el-card style="margin: 10px 0">
      <CategotySelete
        @getCategoryId="getCategoryId"
        :isshow="isshow"
      ></CategotySelete>
    </el-card>
    <el-card style="margin: 20px 0">
      <!-- 列表界面 -->
      <div v-show="isshow">
        <el-button
          :disabled="!category3Id"
          type="primary"
          icon="el-icon-plus"
          @click="showAdd"
          >添加属性</el-button
        >
        <el-table style="width: 100%" border :data="categoryList">
          <el-table-column type="index" label="序号" align="center" width="80">
          </el-table-column>
          <el-table-column label="属性名称" prop="attrName" width="150">
          </el-table-column>
          <el-table-column label="属性值列表" width="width">
            <template slot-scope="{ row }">
              <el-tag
                type="success"
                v-for="attr in row.attrValueList"
                :key="attr.id"
              >
                {{ attr.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row }">
              <HintButton
                title="修改"
                type="warning"
                size="mini"
                icon="el-icon-edit"
                @click="updateAttr(row)"
              ></HintButton>

              <el-popconfirm
                :title="`确定要删除${row.valueName}}吗？`"
                @onConfirm="deleteCategory(row)"
              >
                <HintButton
                  slot="reference"
                  style="margin-left: 10px"
                  title="删除"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加修改界面 -->
      <div v-show="!isshow">
        <el-form :inline="true" ref="form">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrForm.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          :disabled="!attrForm.attrName"
          type="primary"
          icon="el-icon-plus"
          @click="addAttr"
          >添加属性值</el-button
        >
        <el-button @click="isshow = true">取消</el-button>
        <el-table
          :data="attrForm.attrValueList"
          style="width: 100%; margin: 20px 0"
          border=""
        >
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <span
                v-if="!row.isedit"
                :ref="$index"
                @click="toedit(row, $index)"
                style="display: block; width: 100%"
                >{{ row.valueName }}</span
              >
              <el-input
                v-else
                size="mini"
                :ref="$index"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`确定要删除${row.valueName}}吗？`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  size="mini"
                  title="删除"
                  icon="el-icon-delete"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          @click="save"
          :disabled="!attrForm.attrValueList.length"
          >保存</el-button
        >
        <el-button @click="isshow = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { cloneDeep } from "lodash";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      categoryList: [],
      isshow: true,
      attrForm: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3,
      },
    };
  },
  methods: {
    // 获取到三级列表传递过来的id
    async getCategoryId({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getAttrList();
      }
    },
    async getAttrList() {
      try {
        let { category1Id, category2Id, category3Id } = this;
        const result = await this.$API.attr.getCategoryList(
          category1Id,
          category2Id,
          category3Id
        );
        if (result.code === 200 || result.code === 20000) {
          // console.log(result.data);
          // console.log("aa", result.data);

          this.categoryList = result.data;
        } else {
          this.$message.error("获取列表数据失败");
        }
      } catch (error) {
        this.$message.error("请求获取列表数据失败");
      }
    },
    showAdd() {
      this.attrForm = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
      // console.log(categoryId);
      this.isshow = false;
    },
    // 获取用户输入的值，考虑让用户在哪输入，点击添加，数据中添加一条，有一个输入框让用户输入
    // 添加新的属性值
    addAttr() {
      this.attrForm.attrValueList.push({
        // 添加时没有id，当修改时就有id
        attrId: this.attrForm.id,
        // 这个值是收集用户输入的信息的
        valueName: "",
        isedit: true,
      });
      // 发现不能实现，是由于当代码运行的时候，真实dom还没有渲染,使用$nextTick
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    // 点击修改属性
    updateAttr(row) {
      this.isshow = false;
      // 由于数据中拥有一个数组，想要更改的话，需要深度拷贝
      // 使用lodash中的cloneDeep方法
      this.attrForm = cloneDeep(row);
      // console.log(this.attrForm === row);
    },
    // 点击span标签时显示input标签
    toedit(row, index) {
      // 遍历每一个值，让每一个值都添加isedit属性，值为false，这里是使用$set添加的，要让他才成为响应式数据
      this.attrForm.attrValueList.forEach((item) => {
        this.$set(item, "isedit", false);
        // 点击的那一个变为input
        if (item === row) {
          item.isedit = true;
        }
        // 发现不能实现，是由于当代码运行的时候，真实dom还没有渲染,使用$nextTick
        this.$nextTick(() => {
          this.$refs[index].focus();
        });
      });
    },
    // 当input失去焦点或者按回车键时，显示span标签
    toLook(row) {
      if (row.valueName.trim() === "") {
        row.valueName = "";
        this.$message.error("输入的内容不能为空白");
        return;
      }
      // 判断，除自己以外，输入的数据是不是和其他的属性值名称一样
      let isRepeact = this.attrForm.attrValueList.some((item) => {
        //如果当前的item是row，则跳过
        if (item !== row) {
          // 如果不是则遍历判断，当有时就返回true，表示有重复的名称
          return item.valueName === row.valueName;
        }
      });
      if (isRepeact) {
        this.$message.error("不能输入已存在的名称");
        return;
      }
      // 如果以上条件都满足的话则进行input转span
      row.isedit = false;
    },
    // 点击保存，发送请求
    async save() {
      // 添加前先对数据进行整理
      // valueName为空，且清除不需要的isedit属性
      let attrs = this.attrForm;
      attrs.attrValueList = attrs.attrValueList.filter((item) => {
        if (item.valueName.trim() !== "") {
          delete item.isedit;
          return true;
        }
      });
      // 当没有一条数据时不保存
      if (!attrs.attrValueList.length) {
        this.$message.error("内容为空不能保存，请添加内容");
        return;
      }

      // 全部满足则发送请求

      // console.log("attrs", attrs);
      try {
        const result = await this.$API.attr.saveAttr(this.attrForm);
        // console.log("result", result);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("添加属性成功");
          this.getAttrList();
          this.isshow = true;
        } else {
          this.$message.error("添加属性失败");
        }
      } catch (error) {
        this.$message.error("请求添加属性失败");
      }
    },
    // 删除属性列表项
    async deleteCategory(row) {
      try {
        const result = await this.$API.attr.removeAttr(row.id);

        if (result.code === 200 || result.code === 20000) {
          this.$message.success("删除属性成功");
          // 删除完成后，重新获取列表，渲染
          this.getAttrList();
        } else {
          this.$message.error("删除属性失败");
        }
      } catch (error) {
        this.$message.error("请求删除属性失败");
      }
    },
  },
};
</script>

<style>
</style>