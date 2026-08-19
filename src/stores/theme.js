import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'light'
  }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    toggle() {
      this.theme = this.isDark ? 'light' : 'dark'
      localStorage.setItem('theme', this.theme)
      document.documentElement.classList.toggle('dark', this.isDark)
    }
  }
})
