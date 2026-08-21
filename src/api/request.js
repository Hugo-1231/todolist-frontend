import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 请求拦截：自动携带 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：统一处理业务码与错误
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      import('@/router').then(({ default: router }) => {
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
      })
      ElMessage.error(message || '登录已过期，请重新登录')
    } else {
      ElMessage.error(message || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
