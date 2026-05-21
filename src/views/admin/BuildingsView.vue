<template>
  <div class="building-container">
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
            <el-icon class="title-icon"><Building /></el-icon>
            楼宇管理
          </h1>
          <p class="page-subtitle">管理宿舍楼宇信息，维护宿舍基础数据</p>
        </div>
      </div>

      <!-- 操作工具栏 -->
      <el-card shadow="hover" class="toolbar-card glass-card" style="margin-bottom: 24px">
        <el-row :gutter="20" align="middle">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索楼宇名称、管理员或联系电话"
              clearable
              prefix-icon="Search"
              class="search-input"
            />
          </el-col>
          <el-col :span="16" style="text-align: right">
            <el-button
              type="primary"
              :icon="Plus"
              class="add-btn glow-btn"
              @click="handleAdd"
              :loading="loading"
            >
              新增楼宇
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 楼宇数据表格 -->
      <el-card shadow="hover" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><List /></el-icon>
            <span>楼宇信息列表</span>
            <span class="record-count">共 {{ filteredData.length }} 栋楼宇</span>
          </div>
        </template>

        <el-table
          :data="filteredData"
          border
          stripe
          class="building-table"
          :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
          v-loading="loading"
          element-loading-text="正在加载数据..."
        >
          <el-table-column prop="id" label="楼宇ID" width="100" align="center" />
          <el-table-column prop="name" label="楼宇名称" align="center" />
          <el-table-column prop="floors" label="楼层数" width="120" align="center" />
          <el-table-column prop="manager" label="管理员" width="150" align="center" />
          <el-table-column prop="phone" label="联系电话" width="180" align="center" />
          <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === '正常' ? 'success' : 'warning'"
                effect="dark"
                size="small"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="center">
            <template #default="scope">
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
                type="danger"
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

    <!-- 弹窗表单 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑楼宇信息' : '新增楼宇'"
      width="500px"
      class="glass-dialog"
    >
      <el-form :model="form" label-width="100px" class="building-form">
        <el-form-item label="楼宇名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：1号学生公寓" class="form-input" />
        </el-form-item>
        <el-form-item label="楼层数" prop="floors">
          <el-input-number v-model="form.floors" :min="1" :max="20" class="form-input" />
        </el-form-item>
        <el-form-item label="管理员姓名" prop="manager">
          <el-input v-model="form.manager" placeholder="请输入管理员姓名" class="form-input" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入管理员联系电话" class="form-input" />
        </el-form-item>
        <el-form-item label="楼宇状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择楼宇状态"
            style="width: 100%"
            class="form-select"
          >
            <el-option label="正常运行" value="正常" />
            <el-option label="维护中" value="维护中" />
          </el-select>
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
import { Plus, Search, List } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 配置axios基础地址
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// 1. 定义接口，严格匹配数据库表结构
interface Building {
  id: number | null
  name: string
  floors: number
  manager: string
  phone: string
  status: string
}

// 2. 响应式数据
const searchQuery = ref('')
const dialogVisible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const deleteLoading = ref<number | null>(null)

// 从数据库获取的数据
const tableData = ref<Building[]>([])

const form = reactive<Building>({
  id: null,
  name: '',
  floors: 6,
  manager: '',
  phone: '',
  status: '正常',
})

// 3. 搜索过滤逻辑（支持多字段搜索）
const filteredData = computed(() => {
  if (!searchQuery.value) return tableData.value
  const query = searchQuery.value.toLowerCase()
  return tableData.value.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.manager.toLowerCase().includes(query) ||
      item.phone.includes(query),
  )
})

// 4. 从数据库加载数据
const loadBuildings = async () => {
  loading.value = true
  try {
    const res = await api.get('/buildings')
    if (res.data.code === 200) {
      tableData.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('加载楼宇数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadBuildings()
})

// 5. 功能函数
const handleAdd = () => {
  form.id = null
  form.name = ''
  form.floors = 6
  form.manager = ''
  form.phone = ''
  form.status = '正常'
  dialogVisible.value = true
}

const handleEdit = (row: Building) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.name) {
    return ElMessage.warning('请输入楼宇名称')
  }
  if (!form.manager) {
    return ElMessage.warning('请输入管理员姓名')
  }
  if (!form.phone) {
    return ElMessage.warning('请输入联系电话')
  }

  submitLoading.value = true
  try {
    if (form.id) {
      // 编辑逻辑：调用PUT接口
      await api.put(`/buildings/${form.id}`, form)
      ElMessage.success('楼宇信息更新成功')
    } else {
      // 新增逻辑：调用POST接口
      await api.post('/buildings', form)
      ElMessage.success('新增楼宇成功')
    }

    // 重新加载数据
    await loadBuildings()
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败，请重试')
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row: Building) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.name} 吗？删除后该楼宇下的所有宿舍数据将无法访问。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    deleteLoading.value = row.id!
    // 调用DELETE接口
    await api.delete(`/buildings/${row.id}`)
    ElMessage.success('删除成功')

    // 重新加载数据
    await loadBuildings()
  } catch (error) {
    // 用户点击取消时不做处理
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
      console.error(error)
    }
  } finally {
    deleteLoading.value = null
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

.building-container {
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

/* 工具栏样式 */
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

.building-table {
  --el-table-bg-color: transparent;
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-header-text-color: #ffffff;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-stripe-bg-color: rgba(255, 255, 255, 0.02);
}

:deep(.building-table .el-table__cell) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.building-table .el-table__header th) {
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

.building-form {
  padding: 16px 0;
}

:deep(.building-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.building-form .el-input__wrapper),
:deep(.building-form .el-select__wrapper),
:deep(.building-form .el-input-number__decrease),
:deep(.building-form .el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.building-form .el-input__inner),
:deep(.building-form .el-select__input),
:deep(.building-form .el-input-number__input) {
  color: #1795c7 !important;
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
