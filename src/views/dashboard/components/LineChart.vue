<template>
  <div :style="{ width, height }"></div>
</template>
<script>
import Echarts from "echarts";
import "echarts/theme/macarons";
export default {
  name: "LineChart",
  props: {
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "350px"
    },
    chartData: {
      type: Object,
      default: {}
    },
    yTittle: {
      type: String,
      default: ""
    }
  },

  mounted() {
    // 初始化一个echarts实例
    this.mychart = Echarts.init(this.$el, "macarons");
    // 第一次设置配置项
    this.setOption(this.chartData)
  },

  methods: {
    setOption({expectedData=[],actualData=[]}) {
      // 设置配置项
      this.mychart.setOption({
        // title: {
        //   text: "ECharts 入门示例"
        // },
        tooltip: {}, //提示

        // 控制图标的大小及在容器的位置
        grid:{
          left:20,
          right:20,
          top:40,
          bottom:20,
          containLabel:true
        },
        // 图例
        legend: {
          data: ["期望", "实际"]
        },
        xAxis: {
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        },
        yAxis: {
          name: this.yTittle
        },

        // 系列
        series: [
          {
            name: "期望",
            type: "line",
            data: expectedData
          },
          {
            name: "实际",
            type: "line",
            data: actualData
          }
        ]
      });
    }
  },

  watch:{
    chartData:{
      handler(newVal,oldVal){
        // 数据过来之后
        // 第二次设置配置项
        this.setOption(newVal)
      }
    }
  },

  data() {
    return {
      mychart: null
    };
  }
};
</script>

<style scoped></style>
