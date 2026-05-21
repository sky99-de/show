<template>
  <div class="faults-management">
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
            <el-icon class="title-icon"><Warning /></el-icon>
            故障记录管理
          </h1>
          <p class="page-subtitle">处理学生报修申请，跟踪故障维修进度</p>
        </div>
        <el-button type="primary" class="add-btn glow-btn" @click="showAddModal = true">
          <el-icon><Plus /></el-icon>
          报告新故障
        </el-button>
      </div>

      <!-- 统计信息（移到顶部更直观） -->
      <el-row :gutter="24" style="margin-bottom: 24px">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon red">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">待处理</p>
                <p class="stat-value">{{ statistics.pending }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon yellow">
                <el-icon><Tools /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">处理中</p>
                <p class="stat-value">{{ statistics.processing }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon green">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">已解决</p>
                <p class="stat-value">{{ statistics.resolved }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon blue">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">总计</p>
                <p class="stat-value">{{ statistics.total }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 筛选和搜索 -->
      <el-card shadow="hover" class="filter-card glass-card" style="margin-bottom: 24px">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="故障类型">
            <el-select
              v-model="filterForm.type"
              placeholder="所有类型"
              clearable
              class="form-select"
            >
              <el-option label="停电" value="power" />
              <el-option label="设备故障" value="equipment" />
              <el-option label="水路故障" value="water" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select
              v-model="filterForm.status"
              placeholder="所有状态"
              clearable
              class="form-select"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已解决" value="resolved" />
            </el-select>
          </el-form-item>

          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="form-date"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="filterForm.search"
              placeholder="搜索宿舍、故障描述..."
              prefix-icon="Search"
              class="search-input"
              clearable
            />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 故障列表 -->
      <el-card shadow="hover" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><List /></el-icon>
            <span>故障记录列表</span>
          </div>
        </template>

        <el-table
          :data="filteredFaults"
          border
          stripe
          class="fault-table"
          :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
        >
          <el-table-column prop="id" label="故障ID" width="140" align="center" />
          <el-table-column prop="dormitory" label="宿舍" width="120" align="center" />
          <el-table-column prop="typeText" label="故障类型" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getTypeColor(scope.row.type)" effect="dark" size="small">
                {{ scope.row.typeText }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="故障描述" show-overflow-tooltip />
          <el-table-column prop="reportTime" label="报告时间" width="180" align="center" />
          <el-table-column prop="statusText" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusColor(scope.row.status)" effect="dark" size="small">
                {{ scope.row.statusText }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="handler" label="处理人" width="100" align="center" />
          <el-table-column prop="resolveTime" label="处理时间" width="180" align="center" />
          <el-table-column label="操作" width="220" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="viewDetail(scope.row)"
                style="margin-right: 8px"
              >
                详情
              </el-button>
              <el-button
                v-if="scope.row.status === 'pending'"
                size="small"
                type="warning"
                @click="updateStatus(scope.row.id, 'processing')"
                style="margin-right: 8px"
              >
                处理
              </el-button>
              <el-button
                v-if="scope.row.status === 'processing'"
                size="small"
                type="success"
                @click="updateStatus(scope.row.id, 'resolved')"
              >
                解决
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 添加故障弹窗 -->
    <el-dialog v-model="showAddModal" title="报告新故障" width="500px" class="glass-dialog">
      <el-form :model="formData" label-width="100px" class="fault-form">
        <el-form-item label="宿舍编号" prop="dormitory">
          <el-select
            v-model="formData.dormitory"
            placeholder="请选择宿舍"
            style="width: 100%"
            class="form-select"
          >
            <el-option label="1号楼-101" value="1号楼-101" />
            <el-option label="1号楼-102" value="1号楼-102" />
            <el-option label="1号楼-103" value="1号楼-103" />
            <el-option label="2号楼-201" value="2号楼-201" />
            <el-option label="2号楼-202" value="2号楼-202" />
            <el-option label="3号楼-301" value="3号楼-301" />
            <el-option label="4号楼-401" value="4号楼-401" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障类型" prop="type">
          <el-select v-model="formData.type" style="width: 100%" class="form-select">
            <el-option label="停电" value="power" />
            <el-option label="设备故障" value="equipment" />
            <el-option label="水路故障" value="water" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            rows="4"
            placeholder="详细描述故障情况..."
            class="form-textarea"
          />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contact">
          <el-input v-model="formData.contact" placeholder="请输入联系电话" class="form-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModal" class="cancel-btn">取消</el-button>
        <el-button type="primary" class="confirm-btn glow-btn" @click="submitFault">提交</el-button>
      </template>
    </el-dialog>

    <!-- 故障详情弹窗 -->
    <el-dialog v-model="showDetailModal" title="故障详情" width="500px" class="glass-dialog">
      <div class="detail-content">
        <div class="detail-row">
          <span class="detail-label">故障ID:</span>
          <span class="detail-value">{{ selectedFault?.id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">宿舍:</span>
          <span class="detail-value">{{ selectedFault?.dormitory }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">故障类型:</span>
          <span class="detail-value">{{ selectedFault?.typeText }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">故障描述:</span>
          <span class="detail-value">{{ selectedFault?.description }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">报告时间:</span>
          <span class="detail-value">{{ selectedFault?.reportTime }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">状态:</span>
          <span class="detail-value">
            <el-tag :type="getStatusColor(selectedFault?.status)" effect="dark" size="small">
              {{ selectedFault?.statusText }}
            </el-tag>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">处理人:</span>
          <span class="detail-value">{{ selectedFault?.handler || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">处理时间:</span>
          <span class="detail-value">{{ selectedFault?.resolveTime || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">备注:</span>
          <span class="detail-value">{{ selectedFault?.remark || '-' }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailModal = false" class="cancel-btn">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning, Plus, Clock, Tools, Check, Document, List, Search } from '@element-plus/icons-vue'

interface Fault {
  id: string
  dormitory: string
  type: 'power' | 'equipment' | 'water' | 'other'
  typeText: string
  description: string
  reportTime: string
  status: 'pending' | 'processing' | 'resolved'
  statusText: string
  handler?: string
  resolveTime?: string
  remark?: string
}

const faults = ref<Fault[]>([
  {
    id: 'F202605001',
    dormitory: '1号楼-101',
    type: 'power',
    typeText: '停电',
    description: '宿舍突然停电，无法正常使用',
    reportTime: '2026-05-05 14:30:00',
    status: 'resolved',
    statusText: '已解决',
    handler: '王师傅',
    resolveTime: '2026-05-05 15:30:00',
    remark: '查出是空气开关故障，已更换',
  },
  {
    id: 'F202605002',
    dormitory: '2号楼-201',
    type: 'equipment',
    typeText: '设备故障',
    description: '卫生间热水器不工作',
    reportTime: '2026-05-05 13:20:00',
    status: 'processing',
    statusText: '处理中',
    handler: '李师傅',
    remark: '已上门检查，需更换零部件',
  },
  {
    id: 'F202605003',
    dormitory: '1号楼-102',
    type: 'water',
    typeText: '水路故障',
    description: '热水管道漏水',
    reportTime: '2026-05-05 12:15:00',
    status: 'pending',
    statusText: '待处理',
    remark: '暂无',
  },
  {
    id: 'F202605004',
    dormitory: '3号楼-301',
    type: 'other',
    typeText: '其他',
    description: '房门门框松动',
    reportTime: '2026-05-04 18:00:00',
    status: 'resolved',
    statusText: '已解决',
    handler: '维修队',
    resolveTime: '2026-05-05 10:00:00',
    remark: '已紧固门框',
  },
])

const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedFault = ref<Fault | null>(null)

const filterForm = reactive({
  type: '',
  status: '',
  dateRange: [] as string[],
  search: '',
})

type FaultType = 'power' | 'equipment' | 'water' | 'other'

const formData = ref<{
  dormitory: string
  type: FaultType
  description: string
  contact: string
}>({
  dormitory: '',
  type: 'power',
  description: '',
  contact: '',
})

const statistics = computed(() => {
  return {
    pending: faults.value.filter((f) => f.status === 'pending').length,
    processing: faults.value.filter((f) => f.status === 'processing').length,
    resolved: faults.value.filter((f) => f.status === 'resolved').length,
    total: faults.value.length,
  }
})

const filteredFaults = computed(() => {
  return faults.value.filter((fault) => {
    const matchType = !filterForm.type || fault.type === filterForm.type
    const matchStatus = !filterForm.status || fault.status === filterForm.status
    const matchSearch =
      !filterForm.search ||
      fault.dormitory.includes(filterForm.search) ||
      fault.description.includes(filterForm.search)
    return matchType && matchStatus && matchSearch
  })
})

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    power: 'danger',
    equipment: 'warning',
    water: 'primary',
    other: 'success',
  }
  return colorMap[type] || 'info'
}

const getStatusColor = (status: string | undefined) => {
  const colorMap: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success',
  }
  return status ? colorMap[status] : 'info'
}

const viewDetail = (fault: Fault) => {
  selectedFault.value = fault
  showDetailModal.value = true
}

const updateStatus = (faultId: string, newStatus: 'processing' | 'resolved') => {
  const fault = faults.value.find((f) => f.id === faultId)
  if (fault) {
    const statusMap: Record<'processing' | 'resolved', string> = {
      processing: '处理中',
      resolved: '已解决',
    }
    fault.status = newStatus
    fault.statusText = statusMap[newStatus]

    if (newStatus === 'resolved') {
      fault.resolveTime = new Date().toLocaleString('zh-CN')
      fault.handler = '管理员'
      ElMessage.success('故障已标记为已解决')
    } else {
      fault.handler = '维修人员'
      ElMessage.success('故障已标记为处理中')
    }
  }
}

const submitFault = () => {
  if (!formData.value.dormitory) {
    return ElMessage.warning('请选择宿舍')
  }
  if (!formData.value.description) {
    return ElMessage.warning('请描述故障情况')
  }

  const typeMap: Record<'power' | 'equipment' | 'water' | 'other', string> = {
    power: '停电',
    equipment: '设备故障',
    water: '水路故障',
    other: '其他',
  }

  const newFault: Fault = {
    id: `F${Date.now()}`,
    dormitory: formData.value.dormitory,
    type: formData.value.type,
    typeText: typeMap[formData.value.type],
    description: formData.value.description,
    reportTime: new Date().toLocaleString('zh-CN'),
    status: 'pending',
    statusText: '待处理',
    remark: `联系电话: ${formData.value.contact}`,
  }

  faults.value.unshift(newFault)
  ElMessage.success('故障报告已提交成功')
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  formData.value = {
    dormitory: '',
    type: 'power',
    description: '',
    contact: '',
  }
}
</script>

<style scoped>
/* 全局样式和系统统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.faults-management {
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
  max-width: 1600px;
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

.add-btn {
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

/* 玻璃拟态卡片通用样式（和全局统一） */
.glass-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease;
  height: 100%;
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

/* 统计卡片样式 */
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

.stat-icon.red {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}
.stat-icon.yellow {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}
.stat-icon.green {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}
.stat-icon.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
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

/* 筛选栏样式 */
.filter-card {
  padding: 20px !important;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

:deep(.filter-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.filter-form .el-select__wrapper),
:deep(.filter-form .el-date-editor) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.filter-form .el-select__input),
:deep(.filter-form .el-input__inner) {
  color: #085fd1 !important;
}

.search-input {
  width: 250px;
}

/* 表格样式 */
.table-card {
  padding: 0 !important;
}

.fault-table {
  --el-table-bg-color: transparent;
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-header-text-color: #ffffff;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-stripe-bg-color: rgba(255, 255, 255, 0.02);
}

:deep(.fault-table .el-table__cell) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.fault-table .el-table__header th) {
  background: rgba(64, 158, 255, 0.1) !important;
  color: #ffffff !important;
  font-weight: 600;
}

/* 弹窗样式 */
.glass-dialog {
  --el-dialog-bg-color: rgba(30, 41, 59, 0.95);
  --el-dialog-border-color: rgba(255, 255, 255, 0.1);
  --el-dialog-box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

:deep(.glass-dialog .el-dialog) {
  backdrop-filter: blur(20px);
  border-radius: 16px;
}

.fault-form {
  padding: 16px 0;
}

:deep(.fault-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.fault-form .el-select__wrapper),
:deep(.fault-form .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.fault-form .el-select__input),
:deep(.fault-form .el-input__inner) {
  color: #0a79e0 !important;
}

:deep(.fault-form .el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #0a79e0 !important;
  resize: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
}

.confirm-btn {
  background: linear-gradient(90deg, #409eff, #8b5cf6);
  border: none;
}

/* 详情样式 */
.detail-content {
  padding: 10px 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-label {
  color: #94a3b8;
  font-weight: 500;
}

.detail-value {
  color: #075cdb;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}
</style>
