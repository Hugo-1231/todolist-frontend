import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi } from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    nickname: (state) => state.user?.nickname || state.user?.username || ''
  },
  actions: {
    async login(payload) {
      const data = await loginApi(payload)
      this.setAuth(data)
    },
    async register(payload) {
      const data = await registerApi(payload)
      this.setAuth(data)
    },
    setAuth(data) {
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
