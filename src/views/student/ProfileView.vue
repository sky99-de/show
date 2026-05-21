<template>
  <div class="student-profile">
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
            <el-icon class="title-icon"><User /></el-icon>
            个人中心
          </h1>
          <p class="page-subtitle">查看个人信息，修改登录密码，查看绑定宿舍号</p>
        </div>
        <el-button type="primary" class="back-btn glow-btn" @click="goHome">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
      </div>

      <div class="profile-grid">
        <!-- 个人信息卡片 -->
        <el-card shadow="hover" class="profile-card glass-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><InfoFilled /></el-icon>
              <span>个人基本信息</span>
            </div>
          </template>

          <div class="info-list">
            <div class="info-item">
              <div class="info-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="info-content">
                <p class="info-label">姓名</p>
                <p class="info-value">{{ profile.name }}</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="info-content">
                <p class="info-label">学号</p>
                <p class="info-value">{{ profile.studentNo }}</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="info-content">
                <p class="info-label">联系电话</p>
                <p class="info-value">{{ profile.phone }}</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><Building /></el-icon>
              </div>
              <div class="info-content">
                <p class="info-label">绑定宿舍</p>
                <p class="info-value">{{ profile.dormitory }}</p>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 修改密码卡片 -->
        <el-card shadow="hover" class="profile-card glass-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Lock /></el-icon>
              <span>修改登录密码</span>
            </div>
          </template>

          <el-form :model="password" class="password-form">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input
                v-model="password.oldPassword"
                type="password"
                placeholder="请输入当前登录密码"
                class="form-input"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="password.newPassword"
                type="password"
                placeholder="请输入新密码（至少6位）"
                class="form-input"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="password.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                class="form-input"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="submit-btn glow-btn"
                @click="changePassword"
                :loading="loading"
              >
                <el-icon><Check /></el-icon>
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, ArrowLeft, InfoFilled, Document, Phone, Lock, Check } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

// 个人信息（适配你的实际用户数据）
const profile = reactive({
  name: '威威五',
  studentNo: '2024234559',
  phone: '15023800665',
  dormitory: '1号楼-101',
})

const password = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const changePassword = () => {
  if (!password.oldPassword) {
    ElMessage.warning('请输入旧密码')
    return
  }
  if (!password.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (password.newPassword.length < 6) {
    ElMessage.warning('新密码长度不能少于6位')
    return
  }
  if (!password.confirmPassword) {
    ElMessage.warning('请确认新密码')
    return
  }
  if (password.newPassword !== password.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }

  loading.value = true
  // 模拟提交请求
  setTimeout(() => {
    ElMessage.success('密码修改成功！请使用新密码重新登录')
    password.oldPassword = ''
    password.newPassword = ''
    password.confirmPassword = ''
    loading.value = false
  }, 1000)
}

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

.student-profile {
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
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
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

/* 网格布局 */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

/* 个人信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateX(4px);
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #409eff;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

/* 密码表单样式 */
.password-form {
  padding: 20px;
}

:deep(.password-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.password-form .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.password-form .el-input__inner) {
  color: #fff !important;
}

.submit-btn {
  width: 100%;
  height: 44px;
  padding: 0 32px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}
</style>
