<template>
  <div class="dorm-container">
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
            <el-icon class="title-icon"><House /></el-icon>
            宿舍管理
          </h1>
          <p class="page-subtitle">管理所有宿舍信息，查看电费余额，远程控制通电断电</p>
        </div>
      </div>

      <!-- 筛选工具栏 -->
      <el-card shadow="hover" class="filter-card glass-card" style="margin-bottom: 24px">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="筛选楼宇">
            <el-select
              v-model="filterForm.buildingId"
              placeholder="选择楼宇"
              clearable
              style="width: 200px"
              class="form-select"
            >
              <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="add-btn glow-btn"
              @click="handleAdd"
              :loading="loading"
            >
              <el-icon><Plus /></el-icon>
              新增宿舍
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 宿舍数据表格 -->
      <el-card shadow="hover" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><List /></el-icon>
            <span>宿舍信息列表</span>
            <span class="record-count">共 {{ filteredDorms.length }} 间宿舍</span>
          </div>
        </template>

        <el-table
          :data="filteredDorms"
          border
          stripe
          class="dorm-table"
          :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
          v-loading="loading"
          element-loading-text="正在加载宿舍数据..."
        >
          <el-table-column prop="roomNo" label="房间号" width="120" align="center" />
          <el-table-column prop="buildingName" label="所属楼宇" align="center" />
          <el-table-column prop="capacity" label="入住人数" width="120" align="center" />
          <el-table-column prop="electricity" label="当前电费余额" width="180" align="center">
            <template #default="scope">
              <el-tag
                :type="scope.row.electricity < 10 ? 'danger' : 'success'"
                effect="dark"
                size="small"
              >
                ￥ {{ scope.row.electricity.toFixed(2) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="powerStatus" label="供电状态" width="120" align="center">
            <template #default="scope">
              <el-tag
                :type="scope.row.powerStatus === 'on' ? 'success' : 'danger'"
                effect="dark"
                size="small"
              >
                {{ scope.row.powerStatus === 'on' ? '已通电' : '已断电' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" align="center">
            <template #default="scope">
              <el-button
                size="small"
                :type="scope.row.powerStatus === 'on' ? 'danger' : 'success'"
                @click="handlePowerToggle(scope.row)"
                :loading="powerLoading === scope.row.id"
                style="margin-right: 8px"
              >
                {{ scope.row.powerStatus === 'on' ? '远程断电' : '远程通电' }}
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
                style="margin-right: 8px"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="warning"
                @click="handleDelete(scope.row)"
                :loading="deleteLoading === scope.row.id"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新增/编辑宿舍弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑宿舍' : '新增宿舍'"
      width="450px"
      class="glass-dialog"
    >
      <el-form :model="form" label-width="100px" class="dorm-form">
        <el-form-item label="所属楼宇" prop="buildingId">
          <el-select
            v-model="form.buildingId"
            placeholder="请选择楼宇"
            style="width: 100%"
            class="form-select"
          >
            <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间号" prop="roomNo">
          <el-input v-model="form.roomNo" placeholder="例如：101" class="form-input" />
        </el-form-item>
        <el-form-item label="满员人数" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" :max="8" class="form-input" />
        </el-form-item>
        <el-form-item label="初始电费余额" prop="electricity">
          <el-input-number
            v-model="form.electricity"
            :min="0"
            step="0.01"
            precision="2"
            class="form-input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button
          type="primary"
          class="confirm-btn glow-btn"
          @click="submitForm"
          :loading="submitLoading"
        >
          确定保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { House, Plus, List } from '@element-plus/icons-vue'
import axios from 'axios'

// 配置axios基础地址
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

interface Dorm {
  id: number
  roomNo: string
  buildingId: number
  buildingName: string
  capacity: number
  electricity: number
  powerStatus: 'on' | 'off'
}

interface Building {
  id: number
  name: string
}

const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const deleteLoading = ref<number | null>(null)
const powerLoading = ref<number | null>(null)

// 从数据库获取的真实数据
const buildings = ref<Building[]>([])
const dorms = ref<Dorm[]>([])

const filterForm = reactive({
  buildingId: null as number | null,
})

const form = reactive({
  id: null as number | null,
  roomNo: '',
  buildingId: null as number | null,
  capacity: 4,
  electricity: 0,
})

// 联动逻辑：根据下拉框选择过滤表格
const filteredDorms = computed(() => {
  if (!filterForm.buildingId) return dorms.value
  return dorms.value.filter((d) => {
    // 根据楼宇名称匹配楼宇ID（因为数据库里存的是名称）
    const building = buildings.value.find((b) => b.id === filterForm.buildingId)
    return building ? d.buildingName === building.name : false
  })
})

// 从数据库加载数据
const loadBuildings = async () => {
  try {
    const res = await api.get('/buildings')
    if (res.data.code === 200) {
      buildings.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('加载楼宇数据失败')
    console.error(error)
  }
}

const loadDorms = async () => {
  loading.value = true
  try {
    const res = await api.get('/dorms')
    if (res.data.code === 200) {
      dorms.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('加载宿舍数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadBuildings()
  loadDorms()
})

// 功能函数
const handleAdd = () => {
  form.id = null
  form.roomNo = ''
  form.buildingId = null
  form.capacity = 4
  form.electricity = 0
  dialogVisible.value = true
}

const handleEdit = (row: Dorm) => {
  // 根据楼宇名称反查楼宇ID
  const building = buildings.value.find((b) => b.name === row.buildingName)
  Object.assign(form, {
    id: row.id,
    roomNo: row.roomNo,
    buildingId: building ? building.id : null,
    capacity: row.capacity,
    electricity: row.electricity,
  })
  dialogVisible.value = true
}

// 核心功能：远程切换通电断电
const handlePowerToggle = async (row: Dorm) => {
  const targetStatus = row.powerStatus === 'on' ? 'off' : 'on'
  const actionText = targetStatus === 'on' ? '通电' : '断电'

  try {
    await ElMessageBox.confirm(
      `确定要对 ${row.buildingName} ${row.roomNo} 宿舍执行${actionText}操作吗？`,
      '操作确认',
      {
        confirmButtonText: `确认${actionText}`,
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    powerLoading.value = row.id
    await api.put(`/dorms/${row.id}/power`, { powerStatus: targetStatus })

    // 更新本地数据
    row.powerStatus = targetStatus
    ElMessage.success(`${row.buildingName} ${row.roomNo} 宿舍${actionText}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${actionText}失败，请重试`)
      console.error(error)
    }
  } finally {
    powerLoading.value = null
  }
}

const handleDelete = async (row: Dorm) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.buildingName} ${row.roomNo} 宿舍吗？删除后该宿舍的所有数据将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    deleteLoading.value = row.id
    await api.delete(`/dorms/${row.id}`)

    // 更新本地数据
    dorms.value = dorms.value.filter((item) => item.id !== row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
      console.error(error)
    }
  } finally {
    deleteLoading.value = null
  }
}

const submitForm = async () => {
  if (!form.buildingId) {
    return ElMessage.warning('请选择所属楼宇')
  }
  if (!form.roomNo) {
    return ElMessage.warning('请输入房间号')
  }

  submitLoading.value = true
  try {
    if (form.id) {
      // 编辑逻辑
      await api.put(`/dorms/${form.id}`, form)
      ElMessage.success('宿舍信息更新成功')
    } else {
      // 新增逻辑
      await api.post('/dorms', form)
      ElMessage.success('新增宿舍成功')
    }

    // 重新加载数据
    await loadDorms()
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败，请重试')
    console.error(error)
  } finally {
    submitLoading.value = false
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

.dorm-container {
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

/* 筛选栏样式 */
.filter-card {
  padding: 20px !important;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

:deep(.filter-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.filter-form .el-select__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.filter-form .el-select__input) {
  color: #fff !important;
}

.add-btn {
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

.dorm-table {
  --el-table-bg-color: transparent;
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-header-text-color: #ffffff;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-stripe-bg-color: rgba(255, 255, 255, 0.02);
}

:deep(.dorm-table .el-table__cell) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.dorm-table .el-table__header th) {
  background: rgba(64, 158, 255, 0.1) !important;
  color: #ffffff !important;
  font-weight: 600;
}

/* 弹窗样式 */
.glass-dialog {
  --el-dialog-bg-color: rgba(204, 14, 23, 0.95);
  --el-dialog-border-color: rgba(255, 255, 255, 0.1);
  --el-dialog-box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

:deep(.glass-dialog .el-dialog) {
  backdrop-filter: blur(20px);
  border-radius: 16px;
}

.dorm-form {
  padding: 16px 0;
}

:deep(.dorm-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.dorm-form .el-input__wrapper),
:deep(.dorm-form .el-select__wrapper),
:deep(.dorm-form .el-input-number__decrease),
:deep(.dorm-form .el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #ffffff !important;
}

:deep(.dorm-form .el-input__inner),
:deep(.dorm-form .el-select__input),
:deep(.dorm-form .el-input-number__input) {
  color: #3b82f6 !important;
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
