<template>
  <div class="dashboard-container">
    <!-- 动态科技背景 -->
    <div class="bg-animation">
      <div
        class="bg-line"
        v-for="i in 15"
        :key="i"
        :style="{ left: `${i * 7}%`, animationDelay: `${i * 0.2}s` }"
      ></div>
    </div>

    <div class="content-wrapper">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <el-icon class="title-icon"><Histogram /></el-icon>
          管理控制台
        </h1>
        <p class="page-subtitle">实时监控用电数据、充值统计、宿舍状态与校园概况</p>
      </div>

      <!-- 数据统计卡片 -->
      <el-row :gutter="24" style="margin-bottom: 24px">
        <el-col :span="6" v-for="item in stats" :key="item.title">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon" :style="{ background: item.color + '20' }">
                <el-icon :size="32" :color="item.color"><component :is="item.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="title">{{ item.title }}</div>
                <div class="value">
                  {{ item.value }}
                  <span class="unit">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="24">
        <el-col :span="16">
          <el-card class="chart-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><TrendCharts /></el-icon>
                <span>近7天用电趋势分析</span>
              </div>
            </template>
            <div ref="chartRef" style="height: 380px"></div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="chart-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><PieChart /></el-icon>
                <span>各楼宇用电占比</span>
              </div>
            </template>
            <div ref="pieRef" style="height: 380px"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
  Lightning,
  Warning,
  Money,
  UserFilled,
  Histogram,
  TrendCharts,
  PieChart,
} from '@element-plus/icons-vue'

// 统计数据
const stats = [
  { title: '今日总耗电量', value: '1,284', unit: 'kWh', icon: Lightning, color: '#409EFF' },
  { title: '余额预警宿舍', value: '12', unit: '间', icon: Warning, color: '#F56C6C' },
  { title: '今日充值金额', value: '3,560', unit: '元', icon: Money, color: '#67C23A' },
  { title: '在校学生人数', value: '8,420', unit: '人', icon: UserFilled, color: '#E6A23C' },
]

const chartRef = ref<HTMLElement>()
const pieRef = ref<HTMLElement>()

onMounted(() => {
  // --- 趋势折线图（深色科技主题）---
  if (chartRef.value) {
    const mainChart = echarts.init(chartRef.value)
    mainChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30,41,59,0.9)',
        textStyle: { color: '#fff' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#409EFF', shadowBlur: 10, shadowColor: 'rgba(64,158,255,0.5)' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64,158,255,0.3)' },
              { offset: 1, color: 'rgba(64,158,255,0)' },
            ]),
          },
        },
      ],
    })
  }

  // --- 饼图（深色科技主题）---
  if (pieRef.value) {
    const pieChart = echarts.init(pieRef.value)
    pieChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', textStyle: { color: '#fff' } },
      legend: { bottom: '5%', left: 'center', textStyle: { color: '#94a3b8' } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 2,
          },
          label: { color: '#fff' },
          data: [
            { value: 1048, name: '1号楼' },
            { value: 735, name: '2号楼' },
            { value: 580, name: '3号楼' },
            { value: 484, name: '4号楼' },
          ],
          color: ['#409EFF', '#8b5cf6', '#10b981', '#f59e0b'],
        },
      ],
    })
  }
})
</script>

<style scoped>
/* 全局统一样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* 动态背景 */
.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.bg-line {
  position: absolute;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(64, 158, 255, 0.2), transparent);
  animation: flow 15s linear infinite;
}
@keyframes flow {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1600px;
  margin: 0 auto;
}

/* 标题 */
.page-header {
  margin-bottom: 32px;
  text-align: left;
}
.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
}
.title-icon {
  font-size: 34px;
  color: #409eff;
}
.page-subtitle {
  color: #94a3b8;
  font-size: 16px;
}

/* 玻璃卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  transition: 0.3s;
}
.glass-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(64, 158, 255, 0.3);
}

/* 统计卡片 */
.stat-card {
  border: none;
  height: 100%;
}
.stat-content {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px;
}
.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-info .title {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 6px;
}
.stat-info .value {
  font-size: 26px;
  font-weight: bold;
  color: #ffffff;
}
.stat-info .unit {
  font-size: 13px;
  color: #94a3b8;
  font-weight: normal;
  margin-left: 6px;
}

/* 图表卡片 */
.chart-card {
  padding: 0 !important;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.header-icon {
  color: #409eff;
  font-size: 19px;
}
</style>
