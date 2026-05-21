<template>
  <div class="student-container">
    <!-- 统一科技感背景 -->
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
          <el-icon class="title-icon"><User /></el-icon>
          学生管理
        </h1>
        <p class="page-subtitle">学生信息管理、宿舍分配、入住状态监控</p>
      </div>

      <!-- 搜索工具栏 -->
      <el-card shadow="hover" class="tool-card glass-card" style="margin-bottom: 24px">
        <el-row :gutter="20" align="middle">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="输入姓名或学号搜索..."
              clearable
              class="search-input"
            />
          </el-col>
          <el-col :span="16" style="text-align: right">
            <el-button type="primary" class="glow-btn" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              录入新学生
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 学生表格 -->
      <el-card shadow="hover" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><List /></el-icon>
            <span>学生信息列表</span>
            <span class="count">共 {{ filteredStudents.length }} 名学生</span>
          </div>
        </template>

        <el-table
          :data="filteredStudents"
          border
          stripe
          class="student-table"
          :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
        >
          <el-table-column prop="studentId" label="学号" align="center" />
          <el-table-column prop="name" label="姓名" align="center" />
          <el-table-column prop="gender" label="性别" align="center" width="80" />
          <el-table-column prop="buildingName" label="所属楼宇" align="center" />
          <el-table-column prop="roomNo" label="房间号" align="center" />
          <el-table-column label="入住状态" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.roomNo ? 'success' : 'info'" effect="dark" size="small">
                {{ scope.row.roomNo ? '已入住' : '待分配' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleRemove(scope.row)"
                >退宿</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" title="学生信息管理" width="500px" class="glass-dialog">
      <el-form :model="form" label-width="100px" class="student-form">
        <el-form-item label="学号">
          <el-input v-model="form.studentId" :disabled="!!form.id" class="form-input" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" class="form-input" />
        </el-form-item>
        <el-form-item label="选择楼宇">
          <el-select
            v-model="form.buildingId"
            placeholder="选择楼宇"
            @change="onBuildingChange"
            class="form-select"
          >
            <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择房间">
          <el-select
            v-model="form.roomNo"
            placeholder="选择房间"
            :disabled="!form.buildingId"
            class="form-select"
          >
            <el-option v-for="r in availableRooms" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="glow-btn" @click="saveStudent">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, List } from '@element-plus/icons-vue'

interface Student {
  id: number | null
  studentId: string
  name: string
  gender: string
  buildingId: number | null
  buildingName: string
  roomNo: string
}

const searchQuery = ref('')
const dialogVisible = ref(false)

const buildings = ref([
  { id: 1, name: '1号宿舍楼' },
  { id: 2, name: '2号宿舍楼' },
  { id: 3, name: '3号宿舍楼' },
  { id: 4, name: '4号宿舍楼' },
])
const allRooms: Record<number, string[]> = {
  1: ['101', '102', '103', '104'],
  2: ['201', '202', '203'],
  3: ['301', '302'],
  4: ['401', '402'],
}

const students = ref<Student[]>([
  {
    id: 1,
    studentId: '2023001',
    name: '张三',
    gender: '男',
    buildingId: 1,
    buildingName: '1号宿舍楼',
    roomNo: '101',
  },
  {
    id: 2,
    studentId: '2023002',
    name: '李四',
    gender: '男',
    buildingId: 1,
    buildingName: '1号宿舍楼',
    roomNo: '102',
  },
  {
    id: 3,
    studentId: '2023003',
    name: '王五',
    gender: '女',
    buildingId: 2,
    buildingName: '2号宿舍楼',
    roomNo: '201',
  },
])

const form = reactive<Student>({
  id: null,
  studentId: '',
  name: '',
  gender: '男',
  buildingId: null,
  buildingName: '',
  roomNo: '',
})

const availableRooms = ref<string[]>([])

const filteredStudents = computed(() => {
  return students.value.filter(
    (s) => s.name.includes(searchQuery.value) || s.studentId.includes(searchQuery.value),
  )
})

const onBuildingChange = (val: number) => {
  form.roomNo = ''
  availableRooms.value = allRooms[val] || []
}

const handleAdd = () => {
  Object.assign(form, {
    id: null,
    studentId: '',
    name: '',
    gender: '男',
    buildingId: null,
    buildingName: '',
    roomNo: '',
  })
  availableRooms.value = []
  dialogVisible.value = true
}

const handleEdit = (row: Student) => {
  Object.assign(form, { ...row })
  availableRooms.value = row.buildingId ? allRooms[row.buildingId] || [] : []
  dialogVisible.value = true
}

const saveStudent = () => {
  if (!form.studentId || !form.name) {
    return ElMessage.warning('请完善信息')
  }

  if (form.id) {
    const index = students.value.findIndex((s) => s.id === form.id)
    students.value[index] = {
      ...form,
      buildingName: buildings.value.find((b) => b.id === form.buildingId)?.name || '',
    }
  } else {
    students.value.push({
      ...form,
      id: Date.now(),
      buildingName: buildings.value.find((b) => b.id === form.buildingId)?.name || '',
    })
  }
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleRemove = (row: Student) => {
  ElMessageBox.confirm(`确定要为学生 ${row.name} 办理退宿吗？`, '提示').then(() => {
    row.roomNo = ''
    row.buildingId = null
    row.buildingName = ''
    ElMessage.success('退宿办理成功')
  })
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.student-container {
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
  max-width: 1400px;
  margin: 0 auto;
}

/* 标题 */
.page-header {
  margin-bottom: 28px;
}
.page-title {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.title-icon {
  color: #409eff;
  font-size: 30px;
}
.page-subtitle {
  color: #94a3b8;
  font-size: 15px;
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
  transform: translateY(-2px);
  border-color: rgba(64, 158, 255, 0.3);
}

/* 工具栏 */
.tool-card {
  padding: 20px !important;
}
.search-input {
  width: 100%;
}
:deep(.search-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
:deep(.search-input .el-input__inner) {
  color: #fff;
}

.glow-btn {
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.4);
}

/* 表格 */
.table-card {
  padding: 0 !important;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 600;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.header-icon {
  color: #409eff;
}
.count {
  margin-left: auto;
  color: #94a3b8;
  font-weight: normal;
  font-size: 14px;
}

.student-table {
  --el-table-bg-color: transparent;
  --el-table-text-color: #cbd5e1;
  --el-table-header-text-color: #fff;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-stripe-bg-color: rgba(255, 255, 255, 0.03);
}
:deep(.student-table .el-table__cell) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* 表单 */
.student-form {
  padding: 10px 0;
}
:deep(.student-form .el-form-item__label) {
  color: #cbd5e1 !important;
}
:deep(.form-input .el-input__wrapper),
:deep(.form-select .el-select__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
:deep(.form-input .el-input__inner),
:deep(.form-select .el-select__input) {
  color: #074bc9 !important;
}

/* 弹窗 */
.glass-dialog {
  --el-dialog-bg-color: rgba(30, 41, 59, 0.95);
}
</style>
