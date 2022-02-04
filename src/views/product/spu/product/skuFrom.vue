<template>
  <div>
    <el-form ref="form" label-width="100px" :model="skuInfo">
      <el-form-item label="SPU名称">{{ spu.spuName }}</el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input
          placeholder="价格(元)"
          type="number"
          v-model="skuInfo.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input
          placeholder="重量(千克)"
          type="number"
          v-model="skuInfo.weight"
        ></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          placeholder="规格描述"
          type="textarea"
          rows="4"
          v-model="skuInfo.skuDesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" ref="form" label-width="80px">
          <el-form-item
            :label="attr.attrName"
            v-for="attr in categoryList"
            :key="attr.id"
          >
            <!-- 将需要的数据挂载到本身上，到保存时再进行整理 -->
            <el-select v-model="attr.attrIdvalueId" placeholder="请选择">
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" ref="form" label-width="80px">
          <el-form-item
            :label="saleAttr.saleAttrName"
            v-for="saleAttr in spuSaleAttrList"
            :key="saleAttr.id"
          >
            <el-select
              v-model="saleAttr.saleAttrIdsaleAttrValueId"
              placeholder="请选择"
            >
              <el-option
                :label="saleAttrValue.saleAttrValueName"
                :value="`${saleAttr.id}:${saleAttrValue.id}`"
                v-for="saleAttrValue in saleAttr.spuSaleAttrValueList"
                :key="saleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :data="spuImageList"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column label="图片">
            <template slot-scope="{ row }">
              <img
                :src="row.imgUrl"
                alt=""
                style="width: 100px; height: 100px"
              />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row }">
              <el-button
                type="primary"
                v-if="row.isDefault === '0'"
                @click="isDefault(spuImageList, row)"
                >设置为默认</el-button
              >
              <el-tag type="success" v-else>默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      spu: {},
      categoryList: [],
      spuSaleAttrList: [],
      spuImageList: [],
      skuImageList: [],

      // 提交的数据对象
      skuInfo: {
        // 父组件给的，在spu中
        category3Id: "",
        spuId: "",
        tmId: "",
        // v-model收集的
        price: "",
        skuDesc: "",
        skuName: "",
        weight: "",
        //通过代码收集的
        skuDefaultImg: "",
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   attrName: "string",
          //   id: 0,
          //   skuId: 0,
          //   valueId: 0,
          //   valueName: "string",
          // },
        ],
        skuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0,
          // },
        ],
        skuSaleAttrValueList: [
          // {
          //   id: 0,
          //   saleAttrId: 0,
          //   saleAttrName: "string",
          //   saleAttrValueId: 0,
          //   saleAttrValueName: "string",
          //   skuId: 0,
          //   spuId: 0,
          // },
        ],
      },
    };
  },
  methods: {
    // 请求页面初始化数据
    async getSkuList(row, category2Id, category3Id) {
      this.spu = row;
      //http://localhost:9529/dev-api/admin/product/attrInfoList/2/13/61
      const result1 = await this.$API.attr.getCategoryList(
        row.id,
        category2Id,
        category3Id
      );
      //http://localhost:9529/dev-api/admin/product/spuSaleAttrList/1558
      const result2 = await this.$API.sku.getSpuSaleAttrList(row.id);
      //http://localhost:9529/dev-api/admin/product/spuImageList/1558
      const result3 = await this.$API.sku.getSpuImageList(row.id);

      // promise.all(),并发，判断全部的promise对象，全部为true就返回成功的promise
      // 值就是所有成功promise对象组成的数组
      // 若有一个失败则返回失败的promise对象，值为失败的那个的信息
      // console.log(result1, result2, result3);
      try {
        const result = await Promise.all([result1, result2, result3]);
        this.categoryList = result[0].data;
        this.spuSaleAttrList = result[1].data;
        let spuImageList = result[2].data;
        spuImageList.forEach((item) => (item.isDefault = "0"));
        this.spuImageList = spuImageList;
      } catch (error) {
        this.$message.error("请求sku列表初始化数据失败");
      }
    },
    // 用户选择的图片
    handleSelectionChange(val) {
      this.skuImageList = val;
    },
    // 点击默认图片按钮
    isDefault(spuImageList, row) {
      spuImageList.forEach((item) => {
        item.isDefault = "0";
      });
      row.isDefault = "1";
      console.log(row);
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    // 点击保存按钮
    async save() {
      // 数据收集
      let { spu, categoryList, spuSaleAttrList, skuImageList, skuInfo } = this;
      // 数据整理
      skuInfo.category3Id = spu.category3Id;
      skuInfo.spuId = spu.id;
      skuInfo.tmId = spu.tmId;
      //平台属性值整理添加到skuinfo中
      categoryList.reduce((prev, item) => {
        if (item.attrIdvalueId) {
          let [attrId, valueId] = item.attrIdvalueId.split(":");
          let obj = { attrId, valueId };
          skuInfo.skuAttrValueList.push(obj);
        }
        return prev;
      }, []);
      //销售属性值整理添加到skuinfo中
      spuSaleAttrList.reduce((prev, item) => {
        if (item.saleAttrIdsaleAttrValueId) {
          let [saleAttrId, saleAttrValueId] =
            item.saleAttrIdsaleAttrValueId.split(":");
          let obj = { saleAttrId, saleAttrValueId };
          skuInfo.skuSaleAttrValueList.push(obj);
        }
        return prev;
      }, []);
      //图片整理添加到skuinfo中

      skuInfo.skuImageList = skuImageList.map((item) => ({
        imgName: item.imgName,
        imgUrl: item.imgUrl,
        isDefault: item.isDefault,
        spuImgId: item.id,
      }));
      console.log(skuInfo);
      // 整理完发请求
      try {
        const result = await this.$API.sku.addUpdate(skuInfo);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("sku保存成功");
          //  清空数据
          this.resetData();
          this.$emit("update:visible", false);
        } else {
          this.$message.error("sku保存失败");
        }
      } catch (error) {
        this.$message.error("请求sku保存失败");
      }
    },
    // 点击取消按钮
    back() {
      //  清空数据
      this.resetData();
      this.$emit("update:visible", false);
    },
    // 清空数据
    resetData() {
      Object.assign(this._data, this.$options.data());
    },
  },
};
</script>

<style>
</style>