<template>
  <div class="sidebar">
    <div class="sidebar-brand">
      <span class="brand-mark"><el-icon :size="16"><Checked /></el-icon></span>
      <span class="brand-name">待办清单</span>
    </div>

    <WeatherCard />

    <nav class="nav">
      <div class="nav-section">清单</div>
      <a class="nav-item" :class="{ active: activeView === 'all' }" @click="$emit('navigate', 'all')">
        <el-icon><Tickets /></el-icon><span>全部</span><b class="nav-count">{{ stats.total }}</b>
      </a>
      <a class="nav-item" :class="{ active: activeView === 'today' }" @click="$emit('navigate', 'today')">
        <el-icon><Sunny /></el-icon><span>今天</span>
      </a>
      <a class="nav-item" :class="{ active: activeView === 'active' }" @click="$emit('navigate', 'active')">
        <el-icon><Loading /></el-icon><span>进行中</span><b class="nav-count">{{ stats.active }}</b>
      </a>
      <a class="nav-item" :class="{ active: activeView === 'completed' }" @click="$emit('navigate', 'completed')">
        <el-icon><CircleCheck /></el-icon><span>已完成</span><b class="nav-count">{{ stats.completed }}</b>
      </a>

      <div class="nav-section">筛选</div>
      <a class="nav-item" :class="{ active: activeView === 'high' }" @click="$emit('navigate', 'high')">
        <el-icon><Warning /></el-icon><span>高优先级</span><b class="nav-count high">{{ stats.highPriority }}</b>
      </a>
      <a class="nav-item" @click="$emit('openCalendar')">
        <el-icon><Calendar /></el-icon><span>按日期</span>
      </a>

      <div class="nav-section">更多</div>
      <a class="nav-item" @click="goProfile">
        <el-icon><User /></el-icon><span>个人中心</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <a class="nav-item" @click="themeStore.toggle()">
        <el-icon><Moon v-if="!themeStore.isDark" /><Sunny v-else /></el-icon>
        <span>{{ themeStore.isDark ? '浅色模式' : '深色模式' }}</span>
      </a>
      <div class="user">
        <span class="avatar">{{ avatarText }}</span>
        <span class="user-name">{{ authStore.nickname }}</span>
        <el-button text class="logout" title="退出登录" @click="$emit('logout')">
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Checked,
  Tickets,
  Sunny,
  Loading,
  CircleCheck,
  Warning,
  Calendar,
  User,
  Moon,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import WeatherCard from './WeatherCard.vue'

defineProps({
  stats: { type: Object, required: true },
  activeView: { type: String, default: 'all' }
})

defineEmits(['navigate', 'openCalendar', 'logout'])

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const avatarText = computed(() => (authStore.nickname || '?').charAt(0))

function goProfile() {
  router.push('/profile')
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  background: var(--card);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 16px;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--primary);
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
}

.nav {
  flex: 1;
  overflow-y: auto;
}

.nav-section {
  padding: 12px 10px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--text-3);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-2);
  font-size: 14px;
  user-select: none;
  transition: background 0.12s, color 0.12s;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-1);
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 500;
}

.nav-item .el-icon {
  font-size: 16px;
}

.nav-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
}

.nav-count.high {
  color: var(--danger);
}

.sidebar-footer {
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 0;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout {
  color: var(--text-3);
}
</style>
