<template>
  <div>
    <el-button
      type="primary"
      style="margin-top: 10px"
      icon="el-icon-plus"
      @click="showAdd"
      >添加</el-button
    >
    <el-table style="width: 100%; margin: 20px 0" border :data="trademarkList">
      <el-table-column label="序号" align="center" width="80" type="index">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column label="品牌LOGO" width="width">
        <!-- 这里的row表示的时当前数据的那个对象 -->
        <template slot-scope="{ row }">
          <img :src="row.logoUrl" alt=" " style="width: 80px; heigth: 60px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="width">
        <template slot-scope="{ row }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdate(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
      style="text-align: center"
      :current-page="page"
      :page-count="5"
      :page-sizes="[3, 5, 9]"
      :page-size="limit"
      layout=" prev, pager, next, jumper,-> ,sizes,total"
      :total="total"
    >
    </el-pagination>

    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form style="width: 80%" ref="tmform" :model="tmForm" :rules="rules">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>

        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过2M
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrsaveTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      trademarkList: [],
      total: 0,
      page: 1,
      limit: 3,
      dialogFormVisible: false,
      imageUrl: "",
      tmForm: {
        tmName: "",
        logoUrl: "",
      },
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "change",
          },
        ],
        logoUrl: [{ required: true, message: "请选择上传图片" }],
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    // page时分页器封装传递出来的数据，标识当前页
    async getTrademarkList(page = 1) {
      this.page = page;
      try {
        const result = await this.$API.trademark.getPageList(
          this.page,
          this.limit
        );
        if (result.code === 200 || result.code === 20000) {
          this.trademarkList = result.data.records;
          this.total = result.data.total;
        } else {
          alert("获取列表数据失败");
        }
      } catch (error) {
        alert("请求获取列表数据失败");
      }
    },
    // 修改每页显示的数量
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },

    handleAvatarSuccess(res, file) {
      // console.log(res, file);
      this.tmForm.logoUrl = res.data || file.response.data;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },

    // 点击添加弹出
    showAdd() {
      this.dialogFormVisible = true;
      // 当用户取消添加或修改后，数据还存在，需要清空他们
      this.tmForm = {
        tmName: "",
        logoUrl: "",
      };
    },
    //点击修改弹出
    showUpdate(row) {
      this.dialogFormVisible = true;
      // 把要修改的对象给tmForm
      this.tmForm = { ...row };
    },
    //点击确定 添加品牌或修改品牌
    addOrsaveTrademark() {
      this.$refs.tmform.validate(async (valid) => {
        if (valid) {
          let trademark = this.tmForm;
          try {
            const result = await this.$API.trademark.addOrupdate(trademark);
            if (result.code === 200 || result.code === 20000) {
              // 当添加或修改后要给出提示
              this.$message.success(
                trademark.id ? "修改品牌成功" : "添加品牌成功"
              );
              // 关闭弹框
              this.dialogFormVisible = false;
              // 根据修改还是添加关闭时直接到那个页面
              console.log("trademark", this.page);
              this.getTrademarkList(trademark.id ? this.page : 1);
            } else {
              // 失败时
              alert(trademark.id ? "修改品牌失败" : "添加品牌失败");
            }
          } catch (error) {
            alert(trademark.id ? "请求修改品牌失败" : "请求添加品牌失败");
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 删除品牌
    async deleteTrademark(row) {
      try {
        console.log("aaaaaa");
        const result = await this.$API.trademark.deleteTrademark(row.id);
        console.log("bbbb", result);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("删除品牌成功");
        } else {
          this.$message.error("删除品牌失败");
        }
      } catch (error) {
        alert("请求删除品牌失败");
      }
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>