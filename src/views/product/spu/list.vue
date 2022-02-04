<template>
  <div>
    <el-card style="margin: 10px 0">
      <CategotySelete
        @getCategoryId="getCategoryId"
        :isshow="isshow"
      ></CategotySelete>
    </el-card>
    <div v-show="!skuFromIsShow && !spuFromIsShow">
      <el-card style="margin: 20px 0">
        <el-button type="primary" icon="el-icon-plus" @click="addSpu"
          >添加SPU</el-button
        >
        <el-table :data="spuList" style="width: 100%" border>
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row }">
              <HintButton
                icon="el-icon-plus"
                type="success"
                size="mini"
                title="添加sku"
                @click="addSku(row)"
              ></HintButton>
              <HintButton
                icon="el-icon-edit"
                type="warning"
                size="mini"
                title="修改spu"
                @click="updateSpu(row)"
              ></HintButton>
              <HintButton
                icon="el-icon-info"
                type="info"
                size="mini"
                title="查看spu的sku列表"
                @click="skuIsShow(row)"
              ></HintButton>
              <HintButton
                icon="el-icon-delete"
                type="danger"
                size="mini"
                title="删除spu"
                @click="deleteSpu(row)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @current-change="getSpuList"
          @size-change="handleSizeChange"
          style="text-align: center; margin-top: 10px"
          :current-page="page"
          :page-sizes="[3, 6, 9]"
          :page-size="limit"
          :page-count="5"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total"
        >
        </el-pagination>
      </el-card>
    </div>
    <!-- spuFrom 界面 -->
    <div v-show="spuFromIsShow">
      <el-card style="margin: 20px 0">
        <SpuFrom
          :visible.sync="spuFromIsShow"
          ref="supFromData"
          @getSpuList="getSpuList"
        ></SpuFrom>
      </el-card>
    </div>
    <!-- skuFrom 界面 -->
    <div v-show="skuFromIsShow">
      <el-card style="margin: 20px 0">
        <SkuFrom ref="skuFromData" :visible.sync="skuFromIsShow"></SkuFrom>
      </el-card>
    </div>

    <!-- 查看spu的sku列表界面 -->
    <el-dialog title="spu名称的sku列表" :visible.sync="dialogTableVisible">
      <el-table :data="skuList" width="1%">
        <el-table-column property="skuName" label="名称"></el-table-column>
        <el-table-column property="price" label="价格"></el-table-column>
        <el-table-column property="weight" label="重量"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{ row }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width: 100px; height: 100px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SkuFrom from "./product/skuFrom.vue";
import SpuFrom from "./product/spuFrom.vue";
export default {
  name: "Spu",
  data() {
    return {
      isshow: true,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 3,
      total: 0,
      spuFromIsShow: false,
      skuFromIsShow: false,

      dialogTableVisible: false,
      skuList: [],
    };
  },
  components: {
    SkuFrom,
    SpuFrom,
  },
  methods: {
    // 获取三级列表传递过来的数据
    getCategoryId({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        // 发送请求获取spu名称列表数据
        this.getSpuList();
      }
    },
    // 获取数据函数
    async getSpuList(pager = 1) {
      this.page = pager;
      try {
        let { page, limit, category3Id } = this;
        const result = await this.$API.spu.getList(page, limit, category3Id);
        if (result.code === 200 || result.code === 20000) {
          this.spuList = result.data.records;
          this.total = result.data.total;
          // 当返回回来时
          this.spuFromIsShow = false;
        } else {
          this.$message.error("获取SPU列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取SPU列表失败");
      }
    },
    handleSizeChange(page) {
      this.page = page;
      this.getSpuList();
    },
    // 点击添加spu按钮
    addSpu() {
      this.spuFromIsShow = true;
      //触发子组件中的函数，使其发送请求获取修改spu界面数据
      this.$refs.supFromData.getAddSpuInfo(this.category3Id);
    },
    // 点击修改spu按钮
    updateSpu(row) {
      this.spuFromIsShow = true;
      //触发子组件中的函数，使其发送请求获取修改spu界面数据
      this.$refs.supFromData.getspuInfo(row, this.category3Id);
    },
    // 点击删除按钮删除spu
    async deleteSpu(row) {
      // console.log(row);
      try {
        const result = await this.$API.spu.remove(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("删除成功");
          // 删除后要再次发送请求，获取列表最新数据
          this.getSpuList();
        } else {
          this.$message.error("删除失败");
        }
      } catch (error) {
        this.$message.error("请求删除失败");
      }
    },
    //点击添加sku按钮
    addSku(row) {
      // 点击时显示添加sku界面
      this.skuFromIsShow = true;
      // 需要传递三个id，1id在row中
      this.$refs.skuFromData.getSkuList(
        row,
        this.category2Id,
        this.category3Id
      );
    },
    //点击查看spu的sku列表按钮
    async skuIsShow(row) {
      // 触发显示并获取sku列表数据
      this.dialogTableVisible = true;
      try {
        const result = await this.$API.sku.getListBySpuId(row.id);
        if (result.code === 200 || result.code === 20000) {
          console.log(result.data);
          this.skuList = result.data;
        } else {
          this.$message.error("获取sku列表数据失败");
        }
      } catch (error) {
        this.$message.error("请求获取sku列表数据失败");
      }
    },
  },
  watch: {
    spuFromIsShow: {
      handler(newVal, oldVal) {
        this.isshow = !newVal;
      },
    },
    skuFromIsShow: {
      handler(newVal, oldVal) {
        this.isshow = !newVal;
      },
    },
  },
};
</script>

<style>
</style>