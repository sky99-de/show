<template>
  <div class="login-wrapper">
    <div class="bg-gradient"></div>
    <div class="light-line"></div>
    <div class="light-line2"></div>

    <div class="login-card">
      <div class="logo-section">
        <h1 class="title">宿舍用电管理系统</h1>
        <p class="subtitle">{{ isRegister ? '学生账号注册' : '安全登录' }}</p>
      </div>

      <el-form v-model="form" label-width="80px" class="login-form">
        <!-- 姓名：注册显示 -->
        <el-form-item label="姓名" v-if="isRegister">
          <el-input v-model="form.name" placeholder="请输入真实姓名" class="input-style" />
        </el-form-item>

        <!-- 账号/学号 -->
        <el-form-item label="账号">
          <el-input
            v-model="form.username"
            :placeholder="isRegister ? '请输入学号' : '学生请输入学号，管理员请输入账号'"
            class="input-style"
          />
        </el-form-item>

        <!-- 手机号：注册显示 -->
        <el-form-item label="手机号" v-if="isRegister">
          <el-input v-model="form.phone" placeholder="请输入手机号（选填）" class="input-style" />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="input-style"
          />
        </el-form-item>

        <!-- 确认密码：注册显示 -->
        <el-form-item label="确认密码" v-if="isRegister">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            class="input-style"
          />
        </el-form-item>

        <!-- 楼栋号：注册显示 -->
        <el-form-item label="楼栋号" v-if="isRegister">
          <el-input v-model="form.building_name" placeholder="例：1号楼" class="input-style" />
        </el-form-item>

        <!-- 房间号：注册显示 -->
        <el-form-item label="房间号" v-if="isRegister">
          <el-input v-model="form.room_number" placeholder="例：101" class="input-style" />
        </el-form-item>

        <!-- 角色选择（登录时显示） -->
        <el-form-item label="身份" v-if="!isRegister">
          <el-radio-group v-model="form.role" class="role-group">
            <el-radio value="student">学生</el-radio>
            <el-radio value="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="submit">
            {{ isRegister ? '立即注册' : '安全登录' }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <span @click="toggleMode" class="toggle-btn">
            {{ isRegister ? '已有账号？立即登录' : '没有账号？立即注册' }}
          </span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router' // 1. 必须先导入
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter() // 2. 在这里声明一次，不要在函数里声明！

// 状态
const isRegister = ref(false)
const loading = ref(false)

// 表单
const form = reactive({
  name: '',
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  building_name: '',
  room_number: '',
  role: 'student',
})

// 切换登录/注册
const toggleMode = () => {
  isRegister.value = !isRegister.value
  // 清空表单
  Object.keys(form).forEach((key) => {
    form[key] = key === 'role' ? 'student' : ''
  })
}

// 提交
const submit = async () => {
  loading.value = true

  try {
    if (isRegister.value) {
      // 注册逻辑
      if (
        !form.name ||
        !form.username ||
        !form.password ||
        !form.confirmPassword ||
        !form.building_name ||
        !form.room_number
      ) {
        ElMessage.error('请填写完整的注册信息')
        return
      }
      if (form.password !== form.confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return
      }

      // 调用注册接口
      const ok = await userStore.register({
        name: form.name,
        student_id: form.username,
        phone: form.phone,
        password: form.password,
        building_name: form.building_name,
        room_number: form.room_number,
      })

      if (ok) {
        ElMessage.success('注册成功！请前往登录')
        toggleMode() // 注册成功切到登录
      }
    } else {
      // 登录逻辑
      if (!form.username || !form.password) {
        ElMessage.error('请填写账号和密码')
        return
      }

      // 调用登录接口
      const ok = await userStore.login({
        username: form.username,
        password: form.password,
        role: form.role,
      })

      if (ok) {
        ElMessage.success('登录成功，正在跳转...')

        // 先保存到localStorage
        localStorage.setItem('token', userStore.token)
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))

        // 跳转到正确的路径！
        if (ok) {
          ElMessage.success('登录成功，正在跳转...')

          setTimeout(() => {
            if (form.role === 'admin') {
              window.location.href = '/admin/dashboard'
            } else {
              window.location.href = '/student/home'
            }
          }, 300)
        }
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败：' + (error?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  background: #0a1028;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle at center, #1a234a 0%, #0a1028 70%);
  animation: rotate 25s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.light-line {
  position: absolute;
  width: 200%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #409eff, transparent);
  top: 30%;
  animation: flow 8s infinite;
}
.light-line2 {
  position: absolute;
  width: 200%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #36cffc, transparent);
  top: 70%;
  animation: flow 11s infinite reverse;
}
@keyframes flow {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(50%);
  }
}

.login-card {
  width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 40px 45px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 119, 255, 0.2);
  z-index: 10;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  font-size: 26px;
  color: #ffffff;
  margin: 0;
  font-weight: 600;
}
.subtitle {
  font-size: 14px;
  color: #a0cfff;
  margin-top: 8px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  color: #fff !important;
}
:deep(.el-input__inner) {
  color: #fff !important;
}

:deep(.el-form-item__label) {
  color: #c0dfff !important;
  font-weight: 500;
}

.role-group {
  display: flex;
  gap: 30px;
}
:deep(.el-radio) {
  color: #c0dfff !important;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  background: linear-gradient(90deg, #409eff, #36cffc);
  border: none;
}

.toggle-btn {
  display: block;
  text-align: center;
  color: #8cc6ff;
  font-size: 13px;
  cursor: pointer;
  transition: 0.3s;
}
.toggle-btn:hover {
  color: #409eff;
}
</style>
