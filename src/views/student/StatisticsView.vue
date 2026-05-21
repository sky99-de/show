<template>
  <div class="statistics-container">
    <!-- 动态科技背景（和首页统一） -->
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
          <el-icon class="title-icon"><DataLine /></el-icon>
          宿舍用电统计分析
        </h1>
        <p class="page-subtitle">实时掌握用电情况，养成节约用电好习惯</p>
      </div>

      <el-row :gutter="24">
        <!-- 统计数据概览 -->
        <el-col :span="24">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card glass-card">
                <div class="stat-content">
                  <div class="stat-icon blue">
                    <el-icon><Lightning /></el-icon>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">本月累计用电</p>
                    <p class="stat-value">{{ monthlyTotal }} <span class="stat-unit">度</span></p>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card shadow="hover" class="stat-card glass-card">
                <div class="stat-content">
                  <div class="stat-icon green">
                    <el-icon><Clock /></el-icon>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">日均用电</p>
                    <p class="stat-value">{{ dailyAvg }} <span class="stat-unit">度</span></p>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card shadow="hover" class="stat-card glass-card">
                <div class="stat-content">
                  <div class="stat-icon yellow">
                    <el-icon><Money /></el-icon>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">预计本月电费</p>
                    <p class="stat-value">￥{{ expectedCost }}</p>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-col>

        <!-- 趋势图表 -->
        <el-col :span="24" style="margin-top: 24px">
          <el-card shadow="hover" class="chart-card glass-card">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon class="header-icon"><TrendCharts /></el-icon>
                  <span>用电趋势分析</span>
                </div>
                <el-radio-group
                  v-model="timeRange"
                  size="small"
                  @change="updateChart"
                  class="range-group"
                >
                  <el-radio-button label="7days">近 7 天</el-radio-button>
                  <el-radio-button label="6months">近 6 个月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <!-- 图表渲染容器 -->
            <div ref="chartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 用电小贴士 -->
        <el-col :span="24" style="margin-top: 24px">
          <el-card shadow="hover" class="tip-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><Tips /></el-icon>
                <span>节约用电小贴士</span>
              </div>
            </template>
            <div class="tip-list">
              <div class="tip-item">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
                <span>离开宿舍时请及时关闭空调、电脑等大功率电器，避免待机耗电</span>
              </div>
              <div class="tip-item">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
                <span>夏季空调温度建议设置在26℃以上，既舒适又节能</span>
              </div>
              <div class="tip-item">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
                <span>定期检查宿舍电器，避免因设备老化导致的异常耗电</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { DataLine, Lightning, Clock, Money, TrendCharts, InfoFilled } from '@element-plus/icons-vue'

const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null
const timeRange = ref('7days')

// 模拟数据
const monthlyTotal = ref(125.8)
const dailyAvg = ref(4.2)
const expectedCost = ref(69.19)

const mockData = {
  '7days': {
    xAxis: ['05-06', '05-07', '05-08', '05-09', '05-10', '05-11', '05-12'],
    values: [4.2, 3.8, 5.1, 4.5, 3.9, 4.8, 4.2],
  },
  '6months': {
    xAxis: ['12月', '1月', '2月', '3月', '4月', '5月'],
    values: [120, 150, 110, 130, 145, 125],
  },
}

// 初始化图表（修复：用nextTick确保DOM已渲染）
const initChart = async () => {
  await nextTick() // 关键：等待DOM完全渲染
  if (chartRef.value && !myChart) {
    // 先去掉dark主题，用默认主题测试
    myChart = echarts.init(chartRef.value)
    updateChart()
  }
}

// 更新图表
const updateChart = () => {
  if (!myChart) return

  const data = timeRange.value === '7days' ? mockData['7days'] : mockData['6months']

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      borderColor: 'rgba(64, 158, 255, 0.3)',
      textStyle: { color: '#ffffff' },
      formatter: '{b}: {c} 度',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '单位: 度',
      nameTextStyle: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
    },
    series: [
      {
        name: '用电量',
        type: 'line',
        smooth: true,
        data: data.values,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0)' },
          ]),
        },
        itemStyle: {
          color: '#409EFF',
          shadowColor: 'rgba(64, 158, 255, 0.5)',
          shadowBlur: 10,
        },
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#8b5cf6' },
          ]),
        },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          symbolSize: 12,
          itemStyle: {
            shadowColor: 'rgba(64, 158, 255, 0.8)',
            shadowBlur: 15,
          },
        },
      },
    ],
    animationDuration: 1000,
  }

  myChart.setOption(option, true) // 关键：第二个参数true，强制重新渲染
}

// 响应式处理
const handleResize = () => {
  myChart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.dispose()
  myChart = null // 关键：销毁后清空实例
})
</script>

<style scoped>
/* 全局样式和首页统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.statistics-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* 动态背景线条（和首页完全一致） */
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
  background: linear-gradient(to bottom, transparent, rgba(64, 158, 255, 0.3), transparent);
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

/* 内容容器 */
.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面标题（和首页统一） */
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
}

.title-icon {
  font-size: 36px;
  color: #409eff;
}

.page-subtitle {
  font-size: 16px;
  color: #94a3b8;
}

/* 玻璃拟态卡片通用样式（和首页统一） */
.glass-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(64, 158, 255, 0.3);
}

/* 统计卡片 */
.stat-card {
  padding: 24px !important;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.stat-icon.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
.stat-icon.green {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}
.stat-icon.yellow {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.stat-unit {
  font-size: 16px;
  color: #94a3b8;
  margin-left: 4px;
}

/* 图表卡片 */
.chart-card {
  padding: 0 !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.header-icon {
  color: #409eff;
  font-size: 20px;
}

.range-group {
  --el-radio-button-bg-color: rgba(255, 255, 255, 0.05);
  --el-radio-button-text-color: #94a3b8;
  --el-radio-button-border-color: rgba(255, 255, 255, 0.1);
  --el-radio-button-active-bg-color: #409eff;
  --el-radio-button-active-text-color: #ffffff;
  --el-radio-button-active-border-color: #409eff;
}

.chart-container {
  width: 100%;
  min-height: 400px !important;
  height: 400px !important;
  padding: 20px;
  display: block;
}

/* 小贴士卡片 */
.tip-card {
  padding: 0 !important;
}

.tip-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
  line-height: 1.6;
}

.tip-icon {
  font-size: 20px;
  color: #3b82f6;
  margin-top: 2px;
}
</style>
