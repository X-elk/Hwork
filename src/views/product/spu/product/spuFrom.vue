<template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
          <el-option
            v-for="tradmark in trademarkList"
            :key="tradmark.id"
            :label="tradmark.tmName"
            :value="tradmark.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          v-model="spuInfo.description"
          type="textarea"
          rows="4"
          placeholder="SPU描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-success="onSuccess"
          :on-remove="handleRemove"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <!-- select不只是要收集id还要收集name，拼接 -->
        <el-select
          v-model="unSelectedData"
          :placeholder="`还有${unSelectedList.length}个未选择`"
        >
          <el-option
            v-for="unSelsected in unSelectedList"
            :label="unSelsected.name"
            :value="`${unSelsected.id}:${unSelsected.name}`"
            :key="unSelsected.id"
          >
          </el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSkuData"
          :disabled="!unSelectedData"
          >添加销售属性</el-button
        >
        <el-table :data="spuInfo.spuSaleAttrList" style="width: 100%" border>
          <el-table-column label="序号" width="80" align="center" type="index">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row }">
              <!-- @close="handleClose(tag)" -->
              <el-tag
                v-for="(saleAttrValue, index) in row.spuSaleAttrValueList"
                :key="saleAttrValue.id"
                closable
                @close="row.spuSaleAttrValueList.splice(index, 1)"
                :disable-transitions="false"
              >
                {{ saleAttrValue.saleAttrValueName }}
              </el-tag>

              <!-- 这个model在用户输入的时候才会触发 -->
              <el-input
                v-model="row.saleAttrValueName"
                class="input-new-tag"
                ref="saveTagInput"
                size="small"
                v-if="row.isEdit"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <!--  @click="showInput" -->
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addSaleValue(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ $index }">
              <HintButton
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="spuInfo.spuSaleAttrList.splice($index, 1)"
                title="删除销售属性"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveData">保存</el-button>
        <el-button @click="$emit('update:visible', false)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuFrom",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      unSelectedData: "",
      category3Id: "",
      spuList: [],

      spuInfo: {
        category3Id: "",
        spuName: "",
        description: "",
        tmId: "",
        // 图片列表收集到了外边，最后再添加进去
        spuImageList: [],
        // 属性值列表数据
        spuSaleAttrList: [],
      },
      spuImageList: [],
      trademarkList: [],
      saleAttrList: [],
    };
  },
  methods: {
    handleRemove(file, fileList) {
      //删除图片时保存当前图片列表
      this.spuImageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 获取spu界面数据(添加时)
    async getAddSpuInfo(category3Id) {
      this.category3Id = category3Id;
      const result3 = await this.$API.trademark.getList();
      if (result3.code === 200 || result3.code === 20000) {
        this.trademarkList = result3.data;
        // console.log(this.trademarkList);
      }

      const result4 = await this.$API.spu.getSaleAttrList();
      if (result4.code === 200 || result4.code === 20000) {
        this.saleAttrList = result4.data;
      }
    },
    // 获取spu界面数据（修改时）
    async getspuInfo(row, category3Id) {
      this.category3Id = category3Id;
      const result1 = await this.$API.spu.get(row.id);
      if (result1.code === 200 || result1.code === 20000) {
        // console.log(result1.data);
        this.spuInfo = result1.data;
      }

      const result2 = await this.$API.sku.getSpuImageList(row.id);
      if (result2.code === 200 || result2.code === 20000) {
        // 数据不符合展示的需要，要对数据进行整理
        const spuImageList = result2.data;
        spuImageList.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
          // 这里的数据仍是普通数据，不是响应式的
        });
        //这里使用赋值，数据变成了相应式的
        this.spuImageList = spuImageList;
      }

      const result3 = await this.$API.trademark.getList();
      if (result3.code === 200 || result3.code === 20000) {
        this.trademarkList = result3.data;
      }

      const result4 = await this.$API.spu.getSaleAttrList();
      if (result4.code === 200 || result4.code === 20000) {
        this.saleAttrList = result4.data;
      }
    },
    // 点解添加属性按钮
    addSkuData() {
      // 解构出收集的数据，组成一个对象添加进属性列表里
      let [baseSaleAttrId, saleAttrName] = this.unSelectedData.split(":");
      // 根据接口文档，将数收集成需要的格式
      let obj = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      // 将数据添加进属性列表
      this.spuInfo.spuSaleAttrList.push(obj);
      // 添加后需要清空选中项
      this.unSelectedData = "";
    },
    // 图片上传成功函数
    onSuccess(response, file, fileList) {
      // 在这里收集最新的图片列表
      //fileList传递出来的是最新的图片列表
      // console.log("fileList", fileList);
      //接收传递出来的图片
      this.spuImageList = fileList;
    },
    // 点击添加属性值按钮
    addSaleValue(row) {
      this.$set(row, "isEdit", true);
    },
    // 用户输入内容后失去焦点或者回车后触发
    handleInputConfirm(row) {
      // 对数据进行判断
      // 空白不添加，已存在的不能添加
      //这一次不用排除自身
      let { baseSaleAttrId, saleAttrValueName } = row;
      if (saleAttrValueName.trim() === "") {
        this.$message.error("请不要输入空表内容");
        row.isEdit = false;
        return;
      }
      const isHad = row.spuSaleAttrValueList.some((item) => {
        return item.saleAttrValueName === saleAttrValueName;
      });
      // 只要有一个为true就证明列表中有相同名字的
      if (isHad) {
        //清空
        row.saleAttrValueName = "";
        row.isEdit = false;
        this.$message.error("内容已存在请重新输入");
        return;
      }
      // console.log(isHad);
      // 全部满足就添加到属性值列表中

      let obj = { baseSaleAttrId, saleAttrValueName };
      row.spuSaleAttrValueList.push(obj);
      row.saleAttrValueName = "";
      row.isEdit = false;
    },
    // 点击保存按钮
    async saveData() {
      // 保存发送请求，先考虑数据整理
      let { category3Id, spuInfo, spuImageList } = this;
      //对数据进行处理
      // category3Id
      spuInfo.category3Id = category3Id;
      // 图片整理，不需要的属性删掉
      // 需要的//   imgName: "string"//   imgUrl: "string"
      // 图片的路径，新的图片地址有问题（本地路径），真正的路径在respon.data中
      spuInfo.spuImageList = spuImageList.map((item) => {
        // console.log(item);
        // console.log(item.response);

        return {
          imgName: item.name,
          imgUrl: item.imgUrl || item.response.data,
        };
      });
      // 去除数据中我们自己添加的属性
      spuInfo.spuSaleAttrList.forEach((item) => {
        delete item.isEdit;
        delete item.saleAttrValueName;
      });
      // 数据整理完成后进行发送请求
      // console.log(spuInfo);
      try {
        const result = await this.$API.spu.addUpdate(spuInfo);
        if (result.code === 200 || result.code === 20000) {
          // console.log(spuInfo);
          this.$message.success("保存成功");
          // 还要发送请求，请求列表页面的最新数据,注意分页
          this.$emit("getSpuList", spuInfo.id);
          // 还需要清空当前data中的数据
          this.resetData();
        } else {
          this.$message.error("保存失败");
        }
      } catch (error) {
        this.$message.error("请求保存失败");
      }
    },
    resetData() {
      // 合并两个对象
      // _data表示操作的data对象，里面有我们的数据
      //$options.data()表示调用data那个函数，里面是没有数据的，返回初始化的data对象
      Object.assign(this._data, this.$options.data());
    },
  },
  computed: {
    // 计算出自己的销售列表在所有的销售列表中没有的属性
    unSelectedList() {
      return this.saleAttrList.filter((item) => {
        return this.spuInfo.spuSaleAttrList.every((item1) => {
          return item1.saleAttrName !== item.name;
        });
      });
    },
    // 缩写
    // unSelected() {
    //   return this.saleAttrList.filter((item) =>
    //     this.spuInfo.supSaleAttrList.every(
    //       (item1) => item1.saleAttrName !== item.name
    //     )
    //   );
    // },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>