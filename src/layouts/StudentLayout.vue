<template>
  <el-container class="layout-container">
    <!-- 侧边栏：采用深色科技风格 -->
    <el-aside width="240px" class="tech-aside">
      <div class="logo-container">
        <div class="logo-icon">
          <el-icon color="#fff" :size="24"><Lightning /></el-icon>
        </div>
        <div class="logo-text">
          <span class="main-title">智慧能源</span>
          <span class="sub-title">STUDENT TERMINAL</span>
        </div>
      </div>

      <el-menu
        :default-active="$route.path"
        router
        class="side-menu"
        background-color="transparent"
        text-color="#a3b1bf"
        active-text-color="#fff"
      >
        <el-menu-item index="/student/home">
          <el-icon><House /></el-icon>
          <span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/student/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>用电报表</span>
        </el-menu-item>
        <el-menu-item index="/student/payment-history">
          <el-icon><List /></el-icon>
          <span>缴费流水</span>
        </el-menu-item>
        <el-menu-item index="/student/repair">
          <el-icon><Tools /></el-icon>
          <span>在线报修</span>
        </el-menu-item>
        <el-menu-item index="/student/profile">
          <el-icon><User /></el-icon>
          <span>个人账户</span>
        </el-menu-item>
      </el-menu>

      <div class="aside-footer">
        <p>© 2026 智慧校园管理中心</p>
      </div>
    </el-aside>

    <el-container class="main-wrapper">
      <!-- 页眉：毛玻璃效果 -->
      <el-header class="tech-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>后台首页</el-breadcrumb-item>
            <el-breadcrumb-item>学生宿舍</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-badge is-dot class="notice-badge">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
          <div class="divider"></div>
          <el-avatar
            :size="32"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span class="username">威威五 (1-101)</span>
          <el-button link class="logout-btn" @click="$router.push('/login')">退出</el-button>
        </div>
      </el-header>

      <el-main class="content-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { House, DataAnalysis, List, Tools, User, Lightning, Bell } from '@element-plus/icons-vue'
</script>

<style scoped>
/* 容器 */
.layout-container {
  height: 100vh;
  background-color: #f0f2f5;
}

/* 科技侧边栏 */
.tech-aside {
  background: linear-gradient(180deg, #001529 0%, #003366 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.logo-container {
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  background: linear-gradient(135deg, #409eff, #00d2ff);
  padding: 8px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.logo-text {
  display: flex;
  flex-direction: column;
}
.main-title {
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 1px;
}
.sub-title {
  color: #5a7b9a;
  font-size: 10px;
}

.side-menu {
  border: none;
  flex: 1;
}
.side-menu :deep(.el-menu-item):hover {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
}
.side-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2) 0%, transparent 100%) !important;
  border-left: 4px solid #409eff;
}

.aside-footer {
  padding: 20px;
  color: #5a7b9a;
  font-size: 12px;
  text-align: center;
}

/* 头部 */
.tech-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  z-index: 100;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.divider {
  width: 1px;
  height: 20px;
  background: #e0e0e0;
}
.username {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
}
.logout-btn {
  color: #f56c6c;
  font-size: 13px;
}

.content-main {
  background: #f6f8fb;
  padding: 25px;
}
</style>
