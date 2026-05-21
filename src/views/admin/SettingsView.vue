<template>
  <div class="settings-container">
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
            <el-icon class="title-icon"><Setting /></el-icon>
            系统设置
          </h1>
          <p class="page-subtitle">配置系统参数、预警通知和账号安全设置</p>
        </div>
      </div>

      <!-- 设置标签页 -->
      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 1. 电力参数设置 -->
        <el-tab-pane name="price" label="用电参数设置">
          <template #label>
            <span class="tab-label">
              <el-icon><Money /></el-icon>
              <span>用电参数设置</span>
            </span>
          </template>

          <el-card shadow="hover" class="settings-card glass-card">
            <el-alert
              title="说明：此处的电价设置将直接影响全校学生的电费扣减计算。"
              type="info"
              show-icon
              :closable="false"
              style="margin-bottom: 24px"
              class="dark-alert"
            />

            <el-form :model="priceForm" label-width="140px" class="settings-form">
              <el-form-item label="当前电价 (元/度)" prop="unitPrice">
                <el-input-number
                  v-model="priceForm.unitPrice"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  class="form-input"
                />
              </el-form-item>

              <el-form-item label="月度免费补助 (度)" prop="freeQuota">
                <el-input-number v-model="priceForm.freeQuota" :min="0" class="form-input" />
                <div class="form-tip">每月自动赠送给每个宿舍的免费用电额度</div>
              </el-form-item>

              <el-form-item label="欠费停电阈值 (元)" prop="stopThreshold">
                <el-input-number
                  v-model="priceForm.stopThreshold"
                  :precision="2"
                  class="form-input"
                />
                <div class="form-tip">余额低于此数值时，系统将标记为"建议停电"状态</div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" class="save-btn glow-btn" @click="savePriceSettings">
                  <el-icon><Check /></el-icon>
                  保存参数配置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 2. 系统通知设置 -->
        <el-tab-pane name="notify" label="预警与通知">
          <template #label>
            <span class="tab-label">
              <el-icon><Bell /></el-icon>
              <span>预警与通知</span>
            </span>
          </template>

          <el-card shadow="hover" class="settings-card glass-card">
            <el-form :model="notifyForm" label-width="140px" class="settings-form">
              <el-form-item label="余额不足预警" prop="enableWarning">
                <el-switch
                  v-model="notifyForm.enableWarning"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>

              <el-form-item
                label="预警阈值 (元)"
                prop="warningLimit"
                v-if="notifyForm.enableWarning"
              >
                <el-input-number
                  v-model="notifyForm.warningLimit"
                  :precision="2"
                  :min="0"
                  class="form-input"
                />
                <div class="form-tip">低于此金额时，学生端首页会显示红色警告提示</div>
              </el-form-item>

              <el-form-item label="系统公告内容" prop="announcement">
                <el-input
                  v-model="notifyForm.announcement"
                  type="textarea"
                  rows="4"
                  placeholder="输入将显示在学生端首页的公告内容..."
                  class="form-textarea"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" class="save-btn glow-btn" @click="saveNotifySettings">
                  <el-icon><Promotion /></el-icon>
                  发布公告
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 3. 管理员安全设置 -->
        <el-tab-pane name="security" label="账号安全">
          <template #label>
            <span class="tab-label">
              <el-icon><Lock /></el-icon>
              <span>账号安全</span>
            </span>
          </template>

          <el-card shadow="hover" class="settings-card glass-card">
            <el-form
              :model="userForm"
              label-width="100px"
              class="settings-form"
              style="max-width: 450px"
            >
              <el-form-item label="管理员账号" prop="username">
                <el-input v-model="userForm.username" disabled class="form-input" />
              </el-form-item>
              <el-form-item label="原密码" prop="oldPassword">
                <el-input
                  v-model="userForm.oldPassword"
                  type="password"
                  show-password
                  placeholder="请输入原密码"
                  class="form-input"
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="userForm.newPassword"
                  type="password"
                  show-password
                  placeholder="请输入新密码（至少6位）"
                  class="form-input"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="danger" class="save-btn" @click="updatePassword">
                  <el-icon><Key /></el-icon>
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Money, Bell, Lock, Setting, Check, Promotion, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('price')

// 1. 电价表单
const priceForm = reactive({
  unitPrice: 0.55,
  freeQuota: 30,
  stopThreshold: 0.0,
})

// 2. 通知表单
const notifyForm = reactive({
  enableWarning: true,
  warningLimit: 10.0,
  announcement: '各位同学请注意，本周末将进行电力系统维护，请提前做好用电储备。',
})

// 3. 用户表单
const userForm = reactive({
  username: 'admin_sys',
  oldPassword: '',
  newPassword: '',
})

const savePriceSettings = () => {
  ElMessage.success('用电参数更新成功，已同步至全校电表计算逻辑')
}

const saveNotifySettings = () => {
  if (!notifyForm.announcement.trim()) {
    return ElMessage.warning('请输入公告内容')
  }
  ElMessage.success('公告发布成功，所有学生端已同步更新')
}

const updatePassword = () => {
  if (!userForm.oldPassword) {
    return ElMessage.error('请输入原密码')
  }
  if (!userForm.newPassword) {
    return ElMessage.error('请输入新密码')
  }
  if (userForm.newPassword.length < 6) {
    return ElMessage.error('新密码长度不能少于6位')
  }

  ElMessage.success('密码修改成功，请妥善保管新密码')
  userForm.oldPassword = ''
  userForm.newPassword = ''
}
</script>

<style scoped>
/* 全局样式和系统统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.settings-container {
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
  max-width: 1200px;
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

/* 标签页样式 */
.settings-tabs {
  --el-tabs-header-height: 50px;
}

:deep(.settings-tabs .el-tabs__nav-wrap) {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-bottom: none !important;
  padding: 0 20px;
}

:deep(.settings-tabs .el-tabs__item) {
  color: #94a3b8 !important;
  height: 50px;
  line-height: 50px;
  font-size: 15px;
  font-weight: 500;
}

:deep(.settings-tabs .el-tabs__item.is-active) {
  color: #409eff !important;
}

:deep(.settings-tabs .el-tabs__active-bar) {
  background: #409eff !important;
  height: 3px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 设置卡片样式 */
.settings-card {
  border-radius: 0 16px 16px 16px !important;
  padding: 24px !important;
  border-top: none !important;
}

/* 深色提示框 */
.dark-alert {
  --el-alert-info-bg-color: rgba(64, 158, 255, 0.1);
  --el-alert-info-border-color: rgba(64, 158, 255, 0.2);
  --el-alert-info-text-color: #cbd5e1;
}

/* 表单样式 */
.settings-form {
  padding: 0 20px;
}

:deep(.settings-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.settings-form .el-input-number__decrease),
:deep(.settings-form .el-input-number__increase),
:deep(.settings-form .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.settings-form .el-input__inner),
:deep(.settings-form .el-input-number__input) {
  color: #fff !important;
}

:deep(.settings-form .el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
  resize: none;
}

:deep(.settings-form .el-switch.is-checked .el-switch__core) {
  background-color: #409eff !important;
}

.form-tip {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
  line-height: 1.4;
}

.save-btn {
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.glow-btn {
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.6);
  transform: scale(1.05);
}
</style>
