<template>
  <div>
    <el-card>
      <el-table :data="skuList" border v-loading="loading">
        <el-table-column label="序号" type="index" width="80" align="center">
        </el-table-column>
        <el-table-column prop="skuName" label="名称" width="width">
        </el-table-column>
        <el-table-column prop="skuDesc" label="描述" width="width">
        </el-table-column>
        <el-table-column label="默认图片" width="160" align="center">
          <template slot-scope="{ row }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width: 80px; height: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(KG)" width="width">
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格(元)"
          width="80"
          align="center"
        >
        </el-table-column>
        <el-table-column label="操作" width="260" align="center">
          <template slot-scope="{ row }">
            <HintButton
              type="info"
              icon="el-icon-top"
              size="mini"
              title="上架"
              v-if="row.isOn"
              @click="onShelf(row)"
            ></HintButton>
            <HintButton
              type="success"
              icon="el-icon-bottom"
              size="mini"
              title="下架"
              v-else
              @click="downShelf(row)"
            ></HintButton>
            <HintButton
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改"
              @click="skuUpdate(row)"
            ></HintButton>
            <HintButton
              type="info"
              icon="el-icon-info"
              size="mini"
              title="查看详情"
              @click="details(row)"
            ></HintButton>
            <HintButton
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
            ></HintButton>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleCurrentChange"
        @current-change="getSkuList"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50]"
        :page-size="limit"
        layout="prev, pager, next, jumper,->,sizes,total"
        :total="total"
        style="text-align: center"
      >
      </el-pagination>

      <el-drawer
        :visible.sync="drawer"
        :before-close="handleClose"
        :withHeader="false"
        size="50%"
      >
        <el-row>
          <el-col :span="5">
            <div class="grid-content bg-purple-dark">名称</div>
          </el-col>
          <el-col :span="16">
            <div class="grid-content bg-purple-dark">
              {{ skuDetails.skuName }}
            </div>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">
            <div class="grid-content bg-purple-dark">描述</div>
          </el-col>
          <el-col :span="16">
            <div class="grid-content bg-purple-dark">
              {{ skuDetails.skuDesc }}
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <div class="grid-content bg-purple-dark">价格</div>
          </el-col>
          <el-col :span="16">
            <div class="grid-content bg-purple-dark">
              {{ skuDetails.price }}
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <div class="grid-content bg-purple-dark">平台属性</div>
          </el-col>
          <el-col :span="16">
            <el-tag
              type="success"
              v-for="attrValue in skuDetails.skuAttrValueList"
              :key="attrValue.id"
              style="margin-right: 10px"
            >
              {{ attrValue.attrId + "-" + attrValue.valueId }}</el-tag
            >
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">
            <div class="grid-content bg-purple-dark">商品图片</div>
          </el-col>
          <el-col :span="16">
            <el-carousel trigger="click" height="400px">
              <el-carousel-item
                v-for="skuImg in skuDetails.skuImageList"
                :key="skuImg.id"
              >
                <img
                  :src="skuImg.imgUrl"
                  alt=""
                  style="width: 400px; height: 400px"
                />
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Sku",
  data() {
    return {
      skuList: [],
      page: 0,
      limit: 10,
      pageNum: 7,
      total: 0,

      drawer: false,
      loading: false,
      skuDetails: {},
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    async getSkuList(pager = 1) {
      this.page = pager;
      let { page, limit } = this;
      this.loading = true;
      try {
        const result = await this.$API.sku.getList(page, limit);
        if (result.code === 200 || result.code === 20000) {
          let arr = result.data.records;
          arr.forEach((item) => (item.isOn = true));
          this.skuList = arr;
          this.total = result.data.total;
        } else {
          this.$message.error("获取SKU列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取SKU列表失败");
      }
      this.loading = false;
    },
    // 修改一页显示几个
    handleCurrentChange(size) {
      this.limit = size;
    },
    // 点击上架
    async onShelf(row) {
      try {
        const result = await this.$API.sku.onSale(row.id);
        if (result.code === 200 || result.code === 20000) {
          row.isOn = false;
          this.$message.success("商品上架成功");
        } else {
          this.$message.error("商品上架失败");
        }
      } catch (error) {
        this.$message.error("请求商品上架失败");
      }
    },
    // 点击下架
    async downShelf(row) {
      try {
        const result = await this.$API.sku.cancelSale(row.id);
        if (result.code === 200 || result.code === 20000) {
          row.isOn = true;
          this.$message.success("商品下架成功");
        } else {
          this.$message.error("商品下架失败");
        }
      } catch (error) {
        this.$message.error("请求商品下架失败");
      }
    },
    // 点击修改按钮
    skuUpdate(row) {
      this.$message.info("功能正在开发中...");
    },
    // 点击查看详情按钮
    async details(row) {
      try {
        const result = await this.$API.sku.get(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.drawer = true;
          this.skuDetails = result.data;

          console.log(result.data);
        } else {
          this.$message.error("获取详情页数据失败");
        }
      } catch (error) {
        this.$message.error("请求获取详情页数据失败");
      }
    },
    // 关闭详情页面
    handleClose() {},
  },
};
</script>

<style lang='scss' scoped>
.el-drawer__wrapper {
  .el-row {
    line-height: 40px;
    .el-col-5 {
      font-size: 18px;
      font-weight: bold;
      text-align: right;
      margin-right: 20px;
    }
    .el-col-16 {
      width: 400px;
    }
  }
}
::v-deep .el-drawer__wrapper {
  .el-carousel__indicator {
    button {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: rgba(179, 243, 238, 0.739);
    }
  }
  .is-active button {
    display: inline-block;
    width: 20px;
    height: 20px;
    // border-radius: 50%;
    background-color: rgba(220, 136, 241, 0.739);
  }
}
</style>