<template>
  <el-container class="layout-container">
    <!-- 1. 左侧侧边栏 -->
    <el-aside width="240px">
      <div class="logo-wrapper">
        <el-icon :size="24"><Odometer /></el-icon>
        <span>用电管理后台</span>
      </div>

      <el-menu
        default-active="dashboard"
        class="el-menu-vertical"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>后台首页 / 仪表盘</span>
        </el-menu-item>

        <el-menu-item index="/admin/buildings">
          <el-icon><OfficeBuilding /></el-icon>
          <span>楼宇管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/dormitories">
          <el-icon><House /></el-icon>
          <span>宿舍管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/students">
          <el-icon><User /></el-icon>
          <span>学生用户管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/recharge">
          <el-icon><Wallet /></el-icon>
          <span>电费充值管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/paymentLog">
          <el-icon><Document /></el-icon>
          <span>缴费记录查询</span>
        </el-menu-item>
        <!-- AdminLayout.vue 的侧边栏部分 -->
        <el-menu-item index="/admin/electricitylog">
          <el-icon><Odometer /></el-icon>
          <span>用电抄表/记录</span>
        </el-menu-item>
        <el-menu-item index="/admin/settings">
          <!-- 使用 Setting 图标 -->
          <el-icon><Setting /></el-icon>
          <span>系统设置/电价设置</span>
        </el-menu-item>
        <el-menu-item index="/admin/faults">
          <!-- 使用 Setting 图标 -->
          <el-icon><Setting /></el-icon>
          <span>故障报修</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 2. 顶部导航 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>后台管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              管理员 (Admin) <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 3. 右侧内容区 -->
      <el-main class="layout-main">
        <!-- 路由出口：点击菜单后，对应的 DashboardView 等页面会显示在这里 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Odometer,
  DataLine,
  OfficeBuilding,
  House,
  User,
  Wallet,
  Document,
  ArrowDown,
  Setting,
} from '@element-plus/icons-vue'

const router = useRouter()

const logout = () => {
  // 清除本地 Token 等逻辑
  router.push('/')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #001529;
  transition: all 0.3s;
}

.logo-wrapper {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  gap: 10px;
  background: #002140;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.layout-main {
  background-color: #f0f2f5;
}

.el-menu {
  border-right: none;
}
</style>
