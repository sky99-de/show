<template>
  <div class="home-container">
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
      <!-- 页面标题（校园感） -->
      <div class="page-header">
        <h1 class="page-title">
          <el-icon class="title-icon"><House /></el-icon>
          学生宿舍用电管理中心
        </h1>
        <p class="page-subtitle">欢迎回来，{{ userStore.userInfo.name }}同学</p>
      </div>

      <el-row :gutter="24">
        <!-- 左侧主内容区 -->
        <el-col :span="16">
          <!-- 余额大卡片（核心科技感） -->
          <el-card shadow="hover" class="balance-card glass-card">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="info-section">
                <div class="dorm-info">
                  <el-icon class="dorm-icon"><Building /></el-icon>
                  <span class="dorm-name"
                    >{{ userStore.userInfo.building_name }} -
                    {{ userStore.userInfo.room_number }} 宿舍</span
                  >
                </div>

                <div class="balance-display">
                  <span class="balance-unit">￥</span>
                  <span class="balance-amount" :key="balanceKey">{{
                    currentBalance.toFixed(2)
                  }}</span>
                </div>

                <div class="status-row">
                  <div class="status-item">
                    <el-icon class="status-icon success"><Lightning /></el-icon>
                    <span>供电状态：<el-tag type="success" effect="dark">正常供电</el-tag></span>
                  </div>
                  <div class="status-item">
                    <el-icon class="status-icon info"><Clock /></el-icon>
                    <span>更新时间：{{ updateTime }}</span>
                  </div>
                </div>
              </div>

              <div class="action-section">
                <el-button
                  type="warning"
                  size="large"
                  class="recharge-btn glow-btn"
                  @click="openRechargeDialog"
                >
                  <el-icon><Wallet /></el-icon>
                  立即充值
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 系统公告 -->
          <el-card shadow="hover" class="notice-card glass-card" style="margin-top: 24px">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><Bell /></el-icon>
                <span>系统公告</span>
              </div>
            </template>

            <div class="notice-list">
              <div class="notice-item">
                <el-icon class="notice-icon info"><InfoFilled /></el-icon>
                <span
                  >本周末（5月17日-5月18日）将对1号楼变压器进行例行维护，届时可能出现瞬时停电，请提前做好准备。</span
                >
              </div>
              <div class="notice-item">
                <el-icon class="notice-icon warning"><WarningFilled /></el-icon>
                <span>夏季用电高峰即将到来，请同学们节约用电，离开宿舍时及时关闭电器。</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧数据统计区 -->
        <el-col :span="8">
          <el-card shadow="hover" class="stats-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><DataLine /></el-icon>
                <span>用电统计</span>
              </div>
            </template>

            <div class="stats-list">
              <div class="stat-item">
                <div class="stat-icon yellow">
                  <el-icon><Lightning /></el-icon>
                </div>
                <div class="stat-content">
                  <p class="stat-label">昨日用电</p>
                  <p class="stat-value">{{ yesterdayUsage }} <span class="stat-unit">度</span></p>
                </div>
              </div>

              <el-divider class="stat-divider" />

              <div class="stat-item">
                <div class="stat-icon green">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="stat-content">
                  <p class="stat-label">当前电价</p>
                  <p class="stat-value">{{ pricePerKwh }} <span class="stat-unit">元/度</span></p>
                </div>
              </div>

              <el-divider class="stat-divider" />

              <div class="stat-item">
                <div class="stat-icon blue">
                  <el-icon><Battery /></el-icon>
                </div>
                <div class="stat-content">
                  <p class="stat-label">剩余电量</p>
                  <p class="stat-value">
                    {{ remainingPower.toFixed(1) }} <span class="stat-unit">度</span>
                  </p>
                </div>
              </div>

              <el-divider class="stat-divider" />

              <div class="stat-item">
                <div class="stat-icon purple">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="stat-content">
                  <p class="stat-label">预计可用</p>
                  <p class="stat-value">{{ availableDays }} <span class="stat-unit">天</span></p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 充值弹窗（玻璃拟态） -->
    <el-dialog
      v-model="rechargeDialog"
      title="宿舍电费充值"
      width="450px"
      @close="resetForm"
      class="glass-dialog"
    >
      <el-form label-position="top" class="recharge-form">
        <el-form-item label="充值金额">
          <el-radio-group v-model="rechargeAmount" class="amount-group">
            <el-radio-button label="10" class="amount-btn">10元</el-radio-button>
            <el-radio-button label="50" class="amount-btn">50元</el-radio-button>
            <el-radio-button label="100" class="amount-btn">100元</el-radio-button>
            <el-radio-button label="200" class="amount-btn">200元</el-radio-button>
          </el-radio-group>

          <div class="custom-amount">
            <span>或输入自定义金额：</span>
            <el-input
              v-model.number="customAmount"
              type="number"
              placeholder="请输入金额"
              :min="0.01"
              step="0.01"
              precision="2"
              class="amount-input"
            />
            <span class="unit">元</span>
          </div>
        </el-form-item>

        <el-form-item label="支付方式">
          <el-radio-group v-model="payMethod" class="pay-group">
            <el-radio label="wechat" class="pay-radio">
              <el-icon class="pay-icon wechat"><ChatDotRound /></el-icon>
              微信支付
            </el-radio>
            <el-radio label="alipay" class="pay-radio">
              <el-icon class="pay-icon alipay"><CreditCard /></el-icon>
              支付宝
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rechargeDialog = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" class="confirm-btn glow-btn" @click="handleRecharge">
          确认支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  House,
  Lightning,
  Clock,
  Wallet,
  Bell,
  InfoFilled,
  WarningFilled,
  DataLine,
  Money,
  Calendar,
  ChatDotRound,
  CreditCard,
} from '@element-plus/icons-vue'

const userStore = useUserStore()

// 状态
const rechargeDialog = ref(false)
const rechargeAmount = ref('50')
const payMethod = ref('wechat')
const customAmount = ref<number | ''>('')
const balanceKey = ref(0) // 用于触发余额数字更新动画

// 模拟数据（后续可对接后端接口）
const currentBalance = ref(45.5)
const yesterdayUsage = ref(4.2)
const pricePerKwh = ref(0.55)
const updateTime = ref(new Date().toLocaleString())

// 计算属性
const remainingPower = computed(() => currentBalance.value / pricePerKwh.value)
const availableDays = computed(() => Math.floor(remainingPower.value / yesterdayUsage.value))

// 打开充值弹窗
const openRechargeDialog = () => {
  rechargeDialog.value = true
}

// 重置表单
const resetForm = () => {
  rechargeAmount.value = '50'
  customAmount.value = ''
}

// 处理充值
const handleRecharge = () => {
  let finalAmount: number

  if (customAmount.value && customAmount.value > 0) {
    finalAmount = Number(customAmount.value)
  } else {
    finalAmount = Number(rechargeAmount.value)
  }

  if (finalAmount <= 0) {
    ElMessage.warning('请输入有效的充值金额')
    return
  }

  // 模拟充值成功
  currentBalance.value += finalAmount
  balanceKey.value++ // 触发数字更新动画
  ElMessage.success(`充值成功！￥${finalAmount.toFixed(2)} 已到账`)
  rechargeDialog.value = false
  updateTime.value = new Date().toLocaleString()
}

// 页面加载时更新时间
onMounted(() => {
  updateTime.value = new Date().toLocaleString()
})
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主容器 */
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* 动态背景线条 */
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

/* 页面标题 */
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

/* 玻璃拟态卡片通用样式 */
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

/* 余额大卡片 */
.balance-card {
  background: linear-gradient(
    135deg,
    rgba(64, 158, 255, 0.2) 0%,
    rgba(139, 92, 246, 0.2) 100%
  ) !important;
  position: relative;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
  z-index: 0;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
}

.dorm-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.dorm-icon {
  font-size: 28px;
  color: #409eff;
}

.dorm-name {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
}

.balance-display {
  margin-bottom: 24px;
}

.balance-unit {
  font-size: 28px;
  color: #94a3b8;
  margin-right: 8px;
}

.balance-amount {
  font-size: 64px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 0 30px rgba(64, 158, 255, 0.6);
  animation: numberPop 0.5s ease-out;
}

@keyframes numberPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.status-row {
  display: flex;
  gap: 32px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 14px;
}

.status-icon {
  font-size: 18px;
}

.status-icon.success {
  color: #10b981;
}
.status-icon.info {
  color: #3b82f6;
}

/* 充值按钮 */
.recharge-btn {
  height: 56px;
  padding: 0 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.glow-btn {
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
  transform: scale(1.05);
}

/* 公告卡片 */
.notice-card {
  padding: 0 !important;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.header-icon {
  color: #409eff;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
  line-height: 1.6;
}

.notice-icon {
  font-size: 20px;
  margin-top: 2px;
}

.notice-icon.info {
  color: #3b82f6;
}
.notice-icon.warning {
  color: #f59e0b;
}

/* 统计卡片 */
.stats-card {
  height: 100%;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.yellow {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}
.stat-icon.green {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.stat-icon.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}
.stat-icon.purple {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

.stat-unit {
  font-size: 14px;
  color: #94a3b8;
  margin-left: 4px;
}

.stat-divider {
  margin: 0 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* 充值弹窗 */
.glass-dialog {
  --el-dialog-bg-color: rgba(30, 41, 59, 0.95);
  --el-dialog-border-color: rgba(255, 255, 255, 0.1);
  --el-dialog-box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.glass-dialog :deep(.el-dialog) {
  backdrop-filter: blur(20px);
  border-radius: 16px;
}

.recharge-form {
  padding: 16px 0;
}

.amount-group {
  width: 100%;
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.amount-btn {
  flex: 1;
  text-align: center;
}

.custom-amount {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
}

.amount-input {
  flex: 1;
}

.pay-group {
  display: flex;
  gap: 24px;
}

.pay-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
}

.pay-icon {
  font-size: 20px;
}

.pay-icon.wechat {
  color: #07c160;
}
.pay-icon.alipay {
  color: #1677ff;
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
