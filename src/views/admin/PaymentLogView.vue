<template>
  <div class="payment-log-container">
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
            <el-icon class="title-icon"><Receipt /></el-icon>
            全校缴费记录明细
          </h1>
          <p class="page-subtitle">查看全校所有宿舍的电费缴费记录，支持多条件搜索和分页</p>
        </div>
      </div>

      <!-- 搜索工具栏 -->
      <el-card shadow="hover" class="toolbar-card glass-card" style="margin-bottom: 24px">
        <el-row :gutter="20" align="middle">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索宿舍号、缴费人或支付方式"
              clearable
              prefix-icon="Search"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="16" style="text-align: right">
            <el-button type="primary" class="search-btn glow-btn" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 缴费记录表格 -->
      <el-card shadow="hover" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><List /></el-icon>
            <span>缴费记录列表</span>
            <span class="record-count">共 {{ totalRecords }} 条记录</span>
          </div>
        </template>

        <el-table
          :data="displayLogs"
          border
          stripe
          class="payment-table"
          :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
        >
          <el-table-column prop="id" label="流水号" width="120" align="center" />
          <el-table-column prop="dormInfo" label="宿舍" width="150" align="center" />
          <el-table-column prop="studentName" label="缴费人" width="120" align="center" />
          <el-table-column prop="amount" label="金额 (元)" width="140" align="center">
            <template #default="scope">
              <span class="amount-positive">+￥{{ scope.row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="支付方式" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getPayTypeColor(scope.row.type)" effect="dark" size="small">
                {{ scope.row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="缴费时间" sortable />
          <el-table-column label="状态" width="120" align="center">
            <template>
              <el-tag type="success" effect="dark" size="small">交易成功</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalRecords"
            layout="prev, pager, next, jumper, total"
            class="pagination"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, List } from '@element-plus/icons-vue'

interface PaymentLog {
  id: string
  dormInfo: string
  studentName: string
  amount: number
  type: string
  createTime: string
}

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 模拟全校缴费记录数据（更丰富的校园场景数据）
const allPaymentLogs = ref<PaymentLog[]>([
  {
    id: '10001',
    dormInfo: '1号楼-101',
    studentName: '张三',
    amount: 100.0,
    type: '微信支付',
    createTime: '2026-05-11 14:30:25',
  },
  {
    id: '10002',
    dormInfo: '1号楼-102',
    studentName: '李四',
    amount: 50.0,
    type: '支付宝',
    createTime: '2026-05-11 11:20:10',
  },
  {
    id: '10003',
    dormInfo: '2号楼-201',
    studentName: '王五',
    amount: 200.0,
    type: '校园卡',
    createTime: '2026-05-10 16:45:30',
  },
  {
    id: '10004',
    dormInfo: '3号楼-301',
    studentName: '赵六',
    amount: 80.0,
    type: '微信支付',
    createTime: '2026-05-10 09:15:20',
  },
  {
    id: '10005',
    dormInfo: '4号楼-401',
    studentName: '孙七',
    amount: 120.0,
    type: '支付宝',
    createTime: '2026-05-09 20:30:45',
  },
  {
    id: '10006',
    dormInfo: '1号楼-103',
    studentName: '周八',
    amount: 60.0,
    type: '微信支付',
    createTime: '2026-05-09 15:10:30',
  },
  {
    id: '10007',
    dormInfo: '2号楼-202',
    studentName: '吴九',
    amount: 150.0,
    type: '校园卡',
    createTime: '2026-05-08 10:05:15',
  },
  {
    id: '10008',
    dormInfo: '3号楼-302',
    studentName: '郑十',
    amount: 90.0,
    type: '支付宝',
    createTime: '2026-05-08 18:25:40',
  },
  {
    id: '10009',
    dormInfo: '4号楼-402',
    studentName: '钱十一',
    amount: 70.0,
    type: '微信支付',
    createTime: '2026-05-07 12:40:20',
  },
  {
    id: '10010',
    dormInfo: '5号楼-501',
    studentName: '孙十二',
    amount: 110.0,
    type: '校园卡',
    createTime: '2026-05-07 08:50:10',
  },
  {
    id: '10011',
    dormInfo: '1号楼-104',
    studentName: '李十三',
    amount: 130.0,
    type: '支付宝',
    createTime: '2026-05-06 21:15:35',
  },
  {
    id: '10012',
    dormInfo: '2号楼-203',
    studentName: '王十四',
    amount: 40.0,
    type: '微信支付',
    createTime: '2026-05-06 14:30:50',
  },
])

// 搜索过滤逻辑（支持多字段搜索）
const filteredLogs = computed(() => {
  if (!searchQuery.value) return allPaymentLogs.value
  const query = searchQuery.value.toLowerCase()
  return allPaymentLogs.value.filter(
    (item) =>
      item.dormInfo.toLowerCase().includes(query) ||
      item.studentName.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query),
  )
})

// 分页显示数据
const displayLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// 总记录数
const totalRecords = computed(() => filteredLogs.value.length)

// 根据支付方式返回标签颜色
const getPayTypeColor = (type: string) => {
  if (type.includes('微信')) return 'success'
  if (type.includes('支付宝')) return 'primary'
  if (type.includes('校园卡')) return 'warning'
  return 'info'
}

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
  ElMessage.success(`找到 ${totalRecords.value} 条匹配记录`)
}
</script>

<style scoped>
/* 全局样式和系统统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.payment-log-container {
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

/* 搜索工具栏样式 */
.toolbar-card {
  padding: 20px !important;
}

.search-input {
  width: 100%;
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

.search-btn {
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
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

/* 表格样式 */
.table-card {
  padding: 0 !important;
}

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

/* 分页样式 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.pagination .el-pagination__total) {
  color: #94a3b8 !important;
}

:deep(.pagination .el-pagination__jump) {
  color: #94a3b8 !important;
}

:deep(.pagination .el-pager li) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
}

:deep(.pagination .el-pager li.is-active) {
  background: #409eff !important;
  border-color: #409eff !important;
  color: #ffffff !important;
}

:deep(.pagination .btn-prev),
:deep(.pagination .btn-next) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
}
</style>
