<template>
  <div class="log-container">
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
            <el-icon class="title-icon"><Connection /></el-icon>
            用电记录与手工抄表
          </h1>
          <p class="page-subtitle">管理宿舍用电记录，手工录入电表读数，监控异常用电情况</p>
        </div>
      </div>

      <!-- 顶层数据统计 -->
      <el-row :gutter="24" style="margin-bottom: 24px">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon blue">
                <el-icon><Lightning /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">本月总用电量</p>
                <p class="stat-value">2,850 <span class="stat-unit">度</span></p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon red">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">异常用电宿舍</p>
                <p class="stat-value">3 <span class="stat-unit">间</span></p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card glass-card">
            <div class="stat-content">
              <div class="stat-icon green">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-label">本月抄表记录</p>
                <p class="stat-value">126 <span class="stat-unit">条</span></p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 抄表记录表格 -->
      <el-card shadow="hover" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><List /></el-icon>
            <span>抄表记录列表</span>
            <el-button type="primary" class="add-btn glow-btn" @click="openAddDialog">
              <el-icon><Plus /></el-icon>
              录入新读数
            </el-button>
          </div>
        </template>

        <el-table
          :data="logData"
          border
          stripe
          class="log-table"
          :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
        >
          <el-table-column prop="date" label="抄表日期" width="150" align="center" />
          <el-table-column prop="dormInfo" label="宿舍房号" width="120" align="center" />
          <el-table-column prop="prevReading" label="上次读数 (kWh)" align="center" />
          <el-table-column prop="currReading" label="本次读数 (kWh)" align="center" />
          <el-table-column label="本期用电量" align="center">
            <template #default="scope">
              <el-tag
                :type="getUsageType(scope.row.currReading - scope.row.prevReading)"
                effect="dark"
                size="small"
              >
                {{ (scope.row.currReading - scope.row.prevReading).toFixed(2) }} 度
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="抄表人员" width="120" align="center" />
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
                style="margin-right: 8px"
              >
                修改
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 录入读数弹窗 -->
    <el-dialog v-model="dialogVisible" title="手工抄表录入" width="450px" class="glass-dialog">
      <el-form :model="form" label-width="100px" class="log-form">
        <el-form-item label="选择宿舍" prop="dormId">
          <el-select
            v-model="form.dormId"
            placeholder="请选择宿舍"
            style="width: 100%"
            class="form-select"
          >
            <el-option label="1号楼-101" value="101" />
            <el-option label="1号楼-102" value="102" />
            <el-option label="1号楼-103" value="103" />
            <el-option label="1号楼-104" value="104" />
            <el-option label="2号楼-201" value="201" />
            <el-option label="2号楼-202" value="202" />
            <el-option label="3号楼-301" value="301" />
            <el-option label="4号楼-401" value="401" />
          </el-select>
        </el-form-item>
        <el-form-item label="本次读数 (kWh)" prop="reading">
          <el-input-number
            v-model="form.reading"
            :precision="2"
            :step="0.1"
            :min="0"
            style="width: 100%"
            class="form-input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" class="confirm-btn glow-btn" @click="submitLog">
          提交记录
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Connection, Lightning, Warning, Document, List } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据（更丰富的校园场景数据）
const logData = ref([
  {
    id: 1,
    date: '2026-05-11',
    dormInfo: '1号楼-101',
    prevReading: 450.2,
    currReading: 485.5,
    operator: '管理员A',
  },
  {
    id: 2,
    date: '2026-05-11',
    dormInfo: '1号楼-102',
    prevReading: 120.0,
    currReading: 145.2,
    operator: '管理员A',
  },
  {
    id: 3,
    date: '2026-05-11',
    dormInfo: '1号楼-103',
    prevReading: 320.5,
    currReading: 380.8,
    operator: '管理员A',
  },
  {
    id: 4,
    date: '2026-05-11',
    dormInfo: '2号楼-201',
    prevReading: 210.3,
    currReading: 245.7,
    operator: '管理员B',
  },
  {
    id: 5,
    date: '2026-04-01',
    dormInfo: '1号楼-101',
    prevReading: 410.5,
    currReading: 450.2,
    operator: '管理员B',
  },
  {
    id: 6,
    date: '2026-04-01',
    dormInfo: '1号楼-102',
    prevReading: 95.8,
    currReading: 120.0,
    operator: '管理员B',
  },
])

const dialogVisible = ref(false)
const form = reactive({
  dormId: '',
  reading: 0,
})

const openAddDialog = () => {
  form.dormId = ''
  form.reading = 0
  dialogVisible.value = true
}

const submitLog = () => {
  if (!form.dormId) {
    return ElMessage.warning('请选择宿舍')
  }
  if (form.reading <= 0) {
    return ElMessage.warning('请输入有效的电表读数')
  }

  ElMessage.success('用电记录已保存，系统已自动扣减宿舍余额')
  dialogVisible.value = false
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑功能开发中')
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除 ${row.dormInfo} 在 ${row.date} 的抄表记录吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      logData.value = logData.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 根据用电量返回标签颜色（异常用电高亮）
const getUsageType = (usage: number) => {
  if (usage > 50) return 'danger' // 超过50度标记为异常
  if (usage > 30) return 'warning' // 超过30度标记为警告
  return 'success' // 正常用电
}
</script>

<style scoped>
/* 全局样式和系统统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.log-container {
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

.add-btn {
  margin-left: auto;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.glow-btn {
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.6);
  transform: scale(1.05);
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

.stat-icon.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
.stat-icon.red {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}
.stat-icon.green {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
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

/* 表格样式 */
.table-card {
  padding: 0 !important;
}

.log-table {
  --el-table-bg-color: transparent;
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-header-text-color: #ffffff;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-stripe-bg-color: rgba(255, 255, 255, 0.02);
}

:deep(.log-table .el-table__cell) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.log-table .el-table__header th) {
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

.log-form {
  padding: 16px 0;
}

:deep(.log-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.log-form .el-select__wrapper),
:deep(.log-form .el-input-number__decrease),
:deep(.log-form .el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.log-form .el-select__input),
:deep(.log-form .el-input-number__input) {
  color: #fff !important;
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
</style>
