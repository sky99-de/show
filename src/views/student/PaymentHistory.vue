<template>
  <div class="payment-history">
    <!-- 动态科技背景（和全局统一） -->
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
        <div class="header-left">
          <h1 class="page-title">
            <el-icon class="title-icon"><Wallet /></el-icon>
            我的缴费记录
          </h1>
          <p class="page-subtitle">查看宿舍历史充值记录，确认金额到账情况</p>
        </div>
        <el-button type="primary" class="back-btn glow-btn" @click="goHome">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
      </div>

      <!-- 搜索过滤栏 -->
      <div class="filter-bar glass-card">
        <el-input
          v-model="searchQuery"
          placeholder="搜索宿舍号、充值金额或备注"
          class="search-input"
          clearable
          prefix-icon="Search"
        />
        <el-button class="clear-btn" @click="searchQuery = ''"> 清除筛选 </el-button>
      </div>

      <!-- 缴费记录表格 -->
      <el-card shadow="hover" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><List /></el-icon>
            <span>充值记录明细</span>
            <span class="record-count">共 {{ filteredRecords.length }} 条记录</span>
          </div>
        </template>

        <el-table
          :data="filteredRecords"
          stripe
          border
          class="payment-table"
          :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
        >
          <el-table-column prop="time" label="充值时间" width="180" />
          <el-table-column prop="dormitory" label="宿舍号" width="120" />
          <el-table-column prop="amount" label="充值金额" width="120">
            <template #default="scope">
              <span class="amount-positive">+￥{{ scope.row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="beforeBalance" label="充值前余额" width="140">
            <template #default="scope"> ￥{{ scope.row.beforeBalance.toFixed(2) }} </template>
          </el-table-column>
          <el-table-column prop="afterBalance" label="充值后余额" width="140">
            <template #default="scope"> ￥{{ scope.row.afterBalance.toFixed(2) }} </template>
          </el-table-column>
          <el-table-column prop="method" label="支付方式" width="120">
            <template #default="scope">
              <el-tag :type="getPayMethodType(scope.row.method)" effect="dark" size="small">
                {{ scope.row.method }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="备注" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Wallet, ArrowLeft, Search, List } from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')

interface PaymentRecord {
  id: number
  time: string
  dormitory: string
  amount: number
  beforeBalance: number
  afterBalance: number
  method: string
  note: string
}

// 模拟数据（适配你的实际宿舍信息）
const records = ref<PaymentRecord[]>([
  {
    id: 1,
    time: '2026-05-10 14:30',
    dormitory: '1号楼-101',
    amount: 50,
    beforeBalance: 45.5,
    afterBalance: 95.5,
    method: '微信支付',
    note: '宿舍电费充值',
  },
  {
    id: 2,
    time: '2026-05-04 18:20',
    dormitory: '1号楼-101',
    amount: 100,
    beforeBalance: 23.8,
    afterBalance: 123.8,
    method: '支付宝',
    note: '五一假期充值',
  },
  {
    id: 3,
    time: '2026-04-22 12:40',
    dormitory: '1号楼-101',
    amount: 80,
    beforeBalance: 15.2,
    afterBalance: 95.2,
    method: '微信支付',
    note: '月度电费充值',
  },
  {
    id: 4,
    time: '2026-03-15 09:10',
    dormitory: '1号楼-101',
    amount: 120,
    beforeBalance: 8.5,
    afterBalance: 128.5,
    method: '支付宝',
    note: '开学充值',
  },
  {
    id: 5,
    time: '2026-02-20 16:50',
    dormitory: '1号楼-101',
    amount: 60,
    beforeBalance: 12.3,
    afterBalance: 72.3,
    method: '微信支付',
    note: '返校充值',
  },
])

// 过滤记录
const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value
  const query = searchQuery.value.toLowerCase()
  return records.value.filter(
    (item) =>
      item.dormitory.toLowerCase().includes(query) ||
      item.amount.toString().includes(query) ||
      item.note.toLowerCase().includes(query) ||
      item.method.toLowerCase().includes(query),
  )
})

// 根据支付方式返回标签颜色
const getPayMethodType = (method: string) => {
  if (method.includes('微信')) return 'success'
  if (method.includes('支付宝')) return 'primary'
  return 'warning'
}

// 返回首页
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* 全局样式和系统统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.payment-history {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* 动态背景线条（和全局完全一致） */
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

/* 页面标题（和全局统一） */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left {
  text-align: left;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
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
  margin: 0;
}

.back-btn {
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.glow-btn {
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.6);
  transform: scale(1.05);
}

/* 搜索过滤栏 */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

:deep(.search-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.search-input .el-input__inner) {
  color: #fff !important;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  border-radius: 12px;
  height: 40px;
  padding: 0 20px;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
  color: #409eff;
}

/* 表格卡片 */
.table-card {
  padding: 0 !important;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  padding: 16px 20px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.header-icon {
  color: #409eff;
  font-size: 20px;
}

.record-count {
  margin-left: auto;
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
}

/* 表格样式 */
.payment-table {
  --el-table-bg-color: transparent;
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-header-text-color: #ffffff;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-stripe-bg-color: rgba(255, 255, 255, 0.02);
}

:deep(.payment-table .el-table__cell) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.payment-table .el-table__header th) {
  background: rgba(64, 158, 255, 0.1) !important;
  color: #ffffff !important;
  font-weight: 600;
}

.amount-positive {
  color: #10b981;
  font-weight: 600;
}

/* 玻璃拟态卡片通用样式（和全局统一） */
.glass-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(64, 158, 255, 0.3);
}
</style>
