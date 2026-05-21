<template>
  <div class="recharge-container">
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
            电费充值管理
          </h1>
          <p class="page-subtitle">为宿舍快速充值电费，查看充值记录流水</p>
        </div>
      </div>

      <el-row :gutter="24">
        <!-- 左侧：充值表单 -->
        <el-col :span="8">
          <el-card shadow="hover" class="form-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><CreditCard /></el-icon>
                <span>电费快速充值</span>
              </div>
            </template>

            <el-form :model="rechargeForm" label-position="top" class="recharge-form">
              <el-form-item label="所属楼宇" prop="buildingId">
                <el-select
                  v-model="rechargeForm.buildingId"
                  placeholder="请选择楼宇"
                  @change="onBuildingChange"
                  style="width: 100%"
                  class="form-select"
                >
                  <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
                </el-select>
              </el-form-item>

              <el-form-item label="房间号" prop="dormId">
                <el-select
                  v-model="rechargeForm.dormId"
                  placeholder="请选择房间"
                  style="width: 100%"
                  class="form-select"
                >
                  <el-option
                    v-for="d in filteredDorms"
                    :key="d.id"
                    :label="d.roomNo"
                    :value="d.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="充值金额 (元)" prop="amount">
                <el-input-number
                  v-model="rechargeForm.amount"
                  :min="1"
                  :precision="2"
                  :step="10"
                  style="width: 100%"
                  class="form-input"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  style="width: 100%; margin-top: 10px"
                  class="recharge-btn glow-btn"
                  @click="handleRecharge"
                  :loading="loading"
                >
                  <el-icon><Money /></el-icon>
                  立即充值
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 右侧：充值记录流水 -->
        <el-col :span="16">
          <el-card shadow="hover" class="table-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><List /></el-icon>
                <span>最近充值流水</span>
                <span class="record-count">共 {{ rechargeLogs.length }} 条记录</span>
              </div>
            </template>

            <el-table
              :data="rechargeLogs"
              stripe
              border
              class="recharge-table"
              :header-cell-style="{ background: 'rgba(64, 158, 255, 0.1)' }"
            >
              <el-table-column prop="orderNo" label="订单号" width="200" />
              <el-table-column prop="dormInfo" label="宿舍" width="140" align="center" />
              <el-table-column prop="amount" label="充值金额" width="140" align="center">
                <template #default="scope">
                  <span class="amount-positive">+￥{{ scope.row.amount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="充值时间" />
              <el-table-column prop="status" label="状态" width="120" align="center">
                <template>
                  <el-tag size="small" type="success" effect="dark">支付成功</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Wallet, CreditCard, Money, List } from '@element-plus/icons-vue'

const route = useRoute()
const loading = ref(false)

// 模拟基础数据（和宿舍管理页面保持一致）
const buildings = ref([
  { id: 1, name: '1号宿舍楼' },
  { id: 2, name: '2号宿舍楼' },
  { id: 3, name: '3号宿舍楼' },
  { id: 4, name: '4号宿舍楼' },
  { id: 5, name: '5号宿舍楼' },
])

const dorms = ref([
  { id: 101, roomNo: '101', buildingId: 1 },
  { id: 102, roomNo: '102', buildingId: 1 },
  { id: 103, roomNo: '103', buildingId: 1 },
  { id: 104, roomNo: '104', buildingId: 1 },
  { id: 201, roomNo: '201', buildingId: 2 },
  { id: 202, roomNo: '202', buildingId: 2 },
  { id: 301, roomNo: '301', buildingId: 3 },
  { id: 401, roomNo: '401', buildingId: 4 },
])

const rechargeForm = reactive({
  buildingId: null as number | null,
  dormId: null as number | null,
  amount: 50,
})

// 模拟充值记录数据
const rechargeLogs = ref([
  {
    orderNo: 'REC202605110005',
    dormInfo: '1号楼-101',
    amount: 50.0,
    time: '2026-05-11 14:30',
    status: '支付成功',
  },
  {
    orderNo: 'REC202605110004',
    dormInfo: '2号楼-201',
    amount: 100.0,
    time: '2026-05-11 11:20',
    status: '支付成功',
  },
  {
    orderNo: 'REC202605100003',
    dormInfo: '3号楼-301',
    amount: 80.0,
    time: '2026-05-10 16:45',
    status: '支付成功',
  },
  {
    orderNo: 'REC202605090002',
    dormInfo: '4号楼-401',
    amount: 120.0,
    time: '2026-05-09 09:15',
    status: '支付成功',
  },
  {
    orderNo: 'REC202605080001',
    dormInfo: '1号楼-102',
    amount: 50.0,
    time: '2026-05-08 20:30',
    status: '支付成功',
  },
])

// 联动逻辑：根据选择的楼宇过滤房间
const filteredDorms = computed(() => {
  if (!rechargeForm.buildingId) return []
  return dorms.value.filter((d) => d.buildingId === rechargeForm.buildingId)
})

const onBuildingChange = () => {
  rechargeForm.dormId = null
}

const handleRecharge = () => {
  if (!rechargeForm.buildingId) {
    return ElMessage.warning('请选择所属楼宇')
  }
  if (!rechargeForm.dormId) {
    return ElMessage.warning('请选择要充值的房间')
  }
  if (rechargeForm.amount <= 0) {
    return ElMessage.warning('充值金额必须大于0')
  }

  // 获取楼宇和房间信息
  const building = buildings.value.find((b) => b.id === rechargeForm.buildingId)
  const dorm = dorms.value.find((d) => d.id === rechargeForm.dormId)
  const dormInfo = building && dorm ? `${building.name}-${dorm.roomNo}` : ''

  ElMessageBox.confirm(
    `确定为 ${dormInfo} 宿舍充值 ￥${rechargeForm.amount.toFixed(2)} 吗？`,
    '充值确认',
    {
      confirmButtonText: '确认充值',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    loading.value = true

    // 模拟充值请求
    setTimeout(() => {
      // 添加新的充值记录
      const newLog = {
        orderNo: 'REC' + Date.now(),
        dormInfo: dormInfo,
        amount: rechargeForm.amount,
        time: new Date().toLocaleString(),
        status: '支付成功',
      }
      rechargeLogs.value.unshift(newLog)

      ElMessage.success(`电费充值成功！${dormInfo} 已到账 ￥${rechargeForm.amount.toFixed(2)}`)
      loading.value = false

      // 重置表单
      rechargeForm.amount = 50
    }, 1000)
  })
}

// 处理从"宿舍管理"页面跳转过来的参数
onMounted(() => {
  if (route.query.dormId && route.query.buildingName && route.query.roomNo) {
    // 自动填充从宿舍管理页面跳转过来的信息
    const dormId = Number(route.query.dormId)
    const dorm = dorms.value.find((d) => d.id === dormId)

    if (dorm) {
      rechargeForm.buildingId = dorm.buildingId
      rechargeForm.dormId = dorm.id
    }
  }
})
</script>

<style scoped>
/* 全局样式和系统统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.recharge-container {
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

.record-count {
  margin-left: auto;
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
}

/* 充值表单样式 */
.form-card {
  padding: 0 !important;
}

.recharge-form {
  padding: 20px;
}

:deep(.recharge-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.recharge-form .el-select__wrapper),
:deep(.recharge-form .el-input-number__decrease),
:deep(.recharge-form .el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.recharge-form .el-select__input),
:deep(.recharge-form .el-input-number__input) {
  color: #fff !important;
}

.recharge-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.glow-btn {
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.6);
  transform: scale(1.02);
}

/* 充值记录表格样式 */
.table-card {
  padding: 0 !important;
}

.recharge-table {
  --el-table-bg-color: transparent;
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-header-text-color: #ffffff;
  --el-table-text-color: #cbd5e1;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-stripe-bg-color: rgba(255, 255, 255, 0.02);
}

:deep(.recharge-table .el-table__cell) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.recharge-table .el-table__header th) {
  background: rgba(64, 158, 255, 0.1) !important;
  color: #ffffff !important;
  font-weight: 600;
}

.amount-positive {
  color: #10b981;
  font-weight: 600;
}
</style>
