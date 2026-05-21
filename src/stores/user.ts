import { defineStore } from 'pinia'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const BASE_URL = 'http://localhost:3000/api'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求/响应拦截器
request.interceptors.request.use(
  (config) => {
    console.log('【前端请求】', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (err) => {
    console.error('【请求失败】', err)
    return Promise.reject(err)
  },
)

request.interceptors.response.use(
  (res) => {
    console.log('【后端响应】', res.config.url, res.data)
    return res
  },
  (err) => {
    console.error('【响应错误】', err)
    return Promise.reject(err)
  },
)

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    userRole: localStorage.getItem('userRole') || '', // 保存用户角色
  }),

  actions: {
    // 注册
    async register(formData: any) {
      try {
        const res = await request.post('/user/register', formData)
        if (res.data.code === 200) {
          ElMessage.success(res.data.msg)
          return true
        } else {
          ElMessage.error(res.data.msg)
          return false
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.msg || err.message || '注册失败'
        ElMessage.error(errorMsg)
        return false
      }
    },

    // 登录（适配双角色核心）
    async login(formData: { username: string; password: string; role: string }) {
      try {
        const res = await request.post('/user/login', formData)
        if (res.data.code === 200) {
          // 保存登录状态
          this.token = res.data.data.token
          this.userInfo = res.data.data.userInfo
          this.userRole = formData.role

          // 持久化存储
          localStorage.setItem('token', this.token)
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          localStorage.setItem('userRole', this.userRole)

          return true
        } else {
          ElMessage.error(res.data.msg)
          return false
        }
      } catch (err: any) {
        console.error('登录失败：', err)
        ElMessage.error('登录请求失败：' + err.message)
        return false
      }
    },
  },
})
