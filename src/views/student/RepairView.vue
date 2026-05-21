<template>
  <div class="repair-container">
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
        <h1 class="page-title">
          <el-icon class="title-icon"><Tools /></el-icon>
          宿舍故障报修
        </h1>
        <p class="page-subtitle">快速提交报修申请，实时查看维修进度</p>
      </div>

      <el-row :gutter="24">
        <!-- 左侧：提交报修申请 -->
        <el-col :span="12">
          <el-card shadow="hover" class="form-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><Edit /></el-icon>
                <span>提交报修申请</span>
              </div>
            </template>

            <el-form :model="repairForm" label-width="100px" class="repair-form">
              <el-form-item label="故障类型" prop="type">
                <el-select
                  v-model="repairForm.type"
                  placeholder="请选择故障类型"
                  style="width: 100%"
                  class="form-select"
                >
                  <el-option label="电表损坏" value="meter" />
                  <el-option label="线路故障/停电" value="circuit" />
                  <el-option label="插座损坏" value="socket" />
                  <el-option label="开关损坏" value="switch" />
                  <el-option label="空调故障" value="aircon" />
                  <el-option label="其他问题" value="other" />
                </el-select>
              </el-form-item>

              <el-form-item label="故障描述" prop="desc">
                <el-input
                  v-model="repairForm.desc"
                  type="textarea"
                  rows="5"
                  placeholder="请详细描述故障现象，例如：3号插座没电，开灯时会闪烁等..."
                  class="form-textarea"
                />
              </el-form-item>

              <el-form-item label="联系电话" prop="phone">
                <el-input
                  v-model="repairForm.phone"
                  placeholder="请输入您的联系电话"
                  class="form-input"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  class="submit-btn glow-btn"
                  @click="submitRepair"
                  :loading="loading"
                >
                  <el-icon><Check /></el-icon>
                  提交报修申请
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 右侧：报修进度查询 -->
        <el-col :span="12">
          <el-card shadow="hover" class="timeline-card glass-card">
            <template #header>
              <div class="card-header">
                <el-icon class="header-icon"><Clock /></el-icon>
                <span>我的报修进度</span>
              </div>
            </template>

            <el-timeline class="repair-timeline">
              <el-timeline-item
                timestamp="2026-05-11 10:30"
                placement="top"
                color="#409EFF"
                :dot-class="'timeline-dot active'"
              >
                <div class="timeline-content">
                  <h4 class="timeline-title">申请已提交</h4>
                  <p class="timeline-desc">系统已收到您的报修申请，等待管理员审核派单</p>
                </div>
              </el-timeline-item>

              <el-timeline-item
                timestamp="2026-05-04 14:20"
                placement="top"
                color="#10b981"
                :dot-class="'timeline-dot completed'"
              >
                <div class="timeline-content">
                  <h4 class="timeline-title">维修已完成</h4>
                  <p class="timeline-desc">1号楼电工王师傅已处理，故障原因：空气开关跳闸</p>
                </div>
              </el-timeline-item>

              <el-timeline-item
                timestamp="2026-05-04 09:15"
                placement="top"
                color="#10b981"
                :dot-class="'timeline-dot completed'"
              >
                <div class="timeline-content">
                  <h4 class="timeline-title">维修中</h4>
                  <p class="timeline-desc">维修师傅已到达现场，正在处理故障</p>
                </div>
              </el-timeline-item>

              <el-timeline-item
                timestamp="2026-05-04 08:30"
                placement="top"
                color="#10b981"
                :dot-class="'timeline-dot completed'"
              >
                <div class="timeline-content">
                  <h4 class="timeline-title">已派单</h4>
                  <p class="timeline-desc">管理员已审核，已派单给1号楼电工王师傅</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Tools, Edit, Check, Clock } from '@element-plus/icons-vue'

const loading = ref(false)

const repairForm = reactive({
  type: '',
  desc: '',
  phone: '15023800665', // 自动填充当前用户手机号
})

const submitRepair = () => {
  if (!repairForm.type) {
    ElMessage.warning('请选择故障类型')
    return
  }
  if (!repairForm.desc.trim()) {
    ElMessage.warning('请详细描述故障现象')
    return
  }
  if (!repairForm.phone.trim()) {
    ElMessage.warning('请输入您的联系电话')
    return
  }

  loading.value = true
  // 模拟提交请求
  setTimeout(() => {
    ElMessage.success('报修申请已提交成功！请保持电话畅通，维修师傅会尽快联系您')
    repairForm.type = ''
    repairForm.desc = ''
    loading.value = false
  }, 1000)
}
</script>

<style scoped>
/* 全局样式和系统统一 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.repair-container {
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

/* 报修表单样式 */
.repair-form {
  padding: 20px;
}

:deep(.repair-form .el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
}

:deep(.repair-form .el-input__wrapper),
:deep(.repair-form .el-select__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
}

:deep(.repair-form .el-input__inner),
:deep(.repair-form .el-select__input) {
  color: #fff !important;
}

:deep(.repair-form .el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  color: #fff !important;
  resize: none;
}

.submit-btn {
  height: 44px;
  padding: 0 32px;
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

/* 时间线样式 */
.repair-timeline {
  padding: 20px;
}

:deep(.repair-timeline .el-timeline-item__tail) {
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

:deep(.repair-timeline .el-timeline-item__node) {
  width: 16px;
  height: 16px;
  border: none;
}

.timeline-dot.active {
  background: #409eff !important;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.8);
}

.timeline-dot.completed {
  background: #10b981 !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
}

.timeline-content {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.timeline-title {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.timeline-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

:deep(.repair-timeline .el-timeline-item__timestamp) {
  color: #64748b !important;
  font-size: 12px;
}
</style>
