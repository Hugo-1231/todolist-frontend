<template>
  <div class="layout">
    <!-- ===== 左侧边栏（桌面） ===== -->
    <div class="sidebar-container">
      <Sidebar
        :stats="stats"
        :active-view="activeView"
        @navigate="onNavigate"
        @open-calendar="calendarVisible = true"
        @logout="logout"
      />
    </div>

    <!-- ===== 右侧内容 ===== -->
    <div class="content">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="title">{{ viewTitle }}</h1>
          <span class="date">{{ todayStr }}</span>
        </div>
        <div class="topbar-right">
          <el-button text class="menu-btn" @click="drawerVisible = true">
            <el-icon><Menu /></el-icon>
          </el-button>
          <el-button text class="theme-mobile" @click="themeStore.toggle()">
            <el-icon><Moon v-if="!themeStore.isDark" /><Sunny v-else /></el-icon>
          </el-button>
        </div>
      </header>

      <main class="main">
        <!-- 快速添加 -->
        <div class="quick-add">
          <el-input
            v-model="quickTitle"
            class="quick-input"
            placeholder="添加待办，按回车确认…"
            size="large"
            @keyup.enter="quickAdd"
          >
            <template #prefix><el-icon><Plus /></el-icon></template>
          </el-input>
          <el-button class="detail-btn" @click="openCreate">
            <el-icon><EditPen /></el-icon>详细
          </el-button>
        </div>

        <!-- 统计 -->
        <div class="summary">
          <div class="summary-progress">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: completionPercent + '%' }"></div>
            </div>
            <span class="progress-text">{{ completionPercent }}%</span>
          </div>
          <div class="summary-nums">
            <span>全部 <b>{{ stats.total }}</b></span>
            <span>进行中 <b>{{ stats.active }}</b></span>
            <span>已完成 <b>{{ stats.completed }}</b></span>
            <span class="high">高优先级 <b>{{ stats.highPriority }}</b></span>
          </div>
        </div>

        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="group-tabs">
            <button
              v-for="opt in groupOptions"
              :key="opt.value"
              type="button"
              class="group-tab"
              :class="{ active: groupMode === opt.value }"
              @click="groupMode = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <div class="toolbar-spacer" />

          <el-button
            class="cal-btn"
            :class="{ active: filters.dueDate }"
            @click="calendarVisible = true"
          >
            <el-icon><Calendar /></el-icon>{{ filters.dueDate || '日期' }}
          </el-button>

          <el-select
            v-model="filters.priority"
            placeholder="优先级"
            clearable
            class="tool-select"
            @change="onFilterChange"
          >
            <el-option
              v-for="opt in PRIORITY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <el-input
            v-model="filters.keyword"
            placeholder="搜索"
            clearable
            class="tool-search"
            :prefix-icon="Search"
            @input="onKeywordInput"
          />
        </div>

        <!-- 分组列表 -->
        <div v-loading="loading" class="todo-list">
          <Transition name="group-fade" mode="out-in">
            <div v-if="groupedTodos.length" :key="groupMode" class="todo-groups">
              <div v-for="group in groupedTodos" :key="group.key" class="todo-group">
                <div v-if="group.title" class="group-header">
                  <span class="group-dot" :style="{ background: group.color }"></span>
                  <span class="group-title">{{ group.title }}</span>
                  <span class="group-count">{{ group.items.length }}</span>
                </div>
                <TodoItem
                  v-for="todo in group.items"
                  :key="todo.id"
                  :todo="todo"
                  @toggle="handleToggle"
                  @edit="openEdit"
                  @delete="handleDelete"
                />
              </div>
            </div>
            <el-empty v-else-if="!loading" key="empty" :description="emptyText" />
          </Transition>
        </div>
      </main>
    </div>

    <!-- 日历弹窗 -->
    <el-dialog
      v-model="calendarVisible"
      title="按日期筛选"
      width="420px"
      class="calendar-dialog"
    >
      <el-calendar v-model="calendarDate" class="calendar">
        <template #date-cell="{ data }">
          <div
            class="date-cell"
            :class="{
              'has-todo': dateCounts[data.day],
              'is-selected': isSelected(data.day),
              'is-today': isToday(data.day),
              'is-other-month': data.type !== 'current-month'
            }"
            @click.stop="pickDate(data.day)"
          >
            <span class="day-num">{{ dayNum(data.day) }}</span>
            <span v-if="dateCounts[data.day]" class="day-badge">
              {{ dateCounts[data.day] }}
            </span>
          </div>
        </template>
      </el-calendar>
      <div v-if="filters.dueDate" class="calendar-clear">
        <el-button text size="small" @click="clearDate">清除日期筛选</el-button>
      </div>
    </el-dialog>

    <TodoForm
      v-model:visible="dialogVisible"
      :todo="editingTodo"
      @success="refresh"
    />

    <!-- 移动端抽屉侧边栏 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="280px"
      :with-header="false"
      class="mobile-drawer"
    >
      <Sidebar
        :stats="stats"
        :active-view="activeView"
        @navigate="onNavigate"
        @open-calendar="calendarVisible = true"
        @logout="logout"
      />
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Plus,
  Sunny,
  Moon,
  Calendar,
  EditPen,
  Menu
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import {
  getTodos,
  getStats,
  getTodoDates,
  createTodo,
  toggleTodo,
  deleteTodo
} from '../api/todo'
import { PRIORITY_OPTIONS } from '../utils/priority'
import TodoItem from '../components/TodoItem.vue'
import TodoForm from '../components/TodoForm.vue'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const todos = ref([])
const stats = ref({ total: 0, active: 0, completed: 0, highPriority: 0 })
const loading = ref(false)
const dateCounts = ref({})
const calendarDate = ref(new Date())
const calendarVisible = ref(false)
const drawerVisible = ref(false)
const quickTitle = ref('')
const groupMode = ref('none')

const groupOptions = [
  { label: '不分组', value: 'none' },
  { label: '按优先级', value: 'priority' },
  { label: '按截止日期', value: 'dueDate' }
]

const filters = reactive({
  status: 'all',
  priority: '',
  keyword: '',
  dueDate: ''
})

const dialogVisible = ref(false)
const editingTodo = ref(null)

let keywordTimer = null

const todayYMD = (() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})()

const completionPercent = computed(() => {
  if (!stats.value.total) return 0
  return Math.round((stats.value.completed / stats.value.total) * 100)
})

const todayStr = new Date().toLocaleDateString('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

const activeView = computed(() => {
  if (filters.dueDate === todayYMD) return 'today'
  if (filters.priority === 2) return 'high'
  if (filters.status === 'active') return 'active'
  if (filters.status === 'completed') return 'completed'
  return 'all'
})

const viewTitle = computed(() => {
  const map = { all: '全部待办', today: '今天', active: '进行中', completed: '已完成', high: '高优先级' }
  return map[activeView.value] || '全部待办'
})

const emptyText = computed(() => {
  if (filters.dueDate) return '该日期暂无待办'
  if (filters.status === 'completed') return '还没有已完成的待办'
  if (filters.status === 'active') return '没有进行中的待办'
  return '暂无待办，在上方输入框快速添加一条'
})

// 距截止日期的天数
function dueDiffOf(dueDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dueDate)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
}

// 分组计算
const groupedTodos = computed(() => {
  const list = todos.value
  if (groupMode.value === 'none') {
    return [{ key: 'all', title: '', items: list }]
  }
  if (groupMode.value === 'priority') {
    const groups = [
      { key: 'high', title: '高优先级', color: '#e56565', items: [] },
      { key: 'mid', title: '中优先级', color: '#e0a83c', items: [] },
      { key: 'low', title: '低优先级', color: '#9a9aa0', items: [] }
    ]
    for (const t of list) {
      if (t.priority === 2) groups[0].items.push(t)
      else if (t.priority === 1) groups[1].items.push(t)
      else groups[2].items.push(t)
    }
    return groups.filter((g) => g.items.length)
  }
  // 按截止日期
  const groups = [
    { key: 'overdue', title: '已逾期', color: '#e56565', items: [] },
    { key: 'today', title: '今天', color: '#5e6ad2', items: [] },
    { key: 'tomorrow', title: '明天', color: '#5e6ad2', items: [] },
    { key: 'week', title: '未来 7 天', color: '#9a9aa0', items: [] },
    { key: 'later', title: '更晚', color: '#9a9aa0', items: [] },
    { key: 'none', title: '无日期', color: '#9a9aa0', items: [] }
  ]
  for (const t of list) {
    if (!t.dueDate) {
      groups[5].items.push(t)
      continue
    }
    const diff = dueDiffOf(t.dueDate)
    if (diff < 0) groups[0].items.push(t)
    else if (diff === 0) groups[1].items.push(t)
    else if (diff === 1) groups[2].items.push(t)
    else if (diff <= 7) groups[3].items.push(t)
    else groups[4].items.push(t)
  }
  return groups.filter((g) => g.items.length)
})

async function fetchTodos() {
  loading.value = true
  try {
    const params = { status: filters.status }
    if (filters.priority !== '' && filters.priority !== null && filters.priority !== undefined) {
      params.priority = filters.priority
    }
    if (filters.keyword) {
      params.keyword = filters.keyword
    }
    if (filters.dueDate) {
      params.dueDate = filters.dueDate
    }
    todos.value = await getTodos(params)
  } catch (e) {
    // 错误已由拦截器提示
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    stats.value = await getStats()
  } catch (e) {
    // 忽略统计失败
  }
}

async function fetchDates() {
  try {
    dateCounts.value = await getTodoDates()
  } catch (e) {
    // 忽略日期标记失败
  }
}

async function refresh() {
  await Promise.all([fetchTodos(), fetchStats(), fetchDates()])
}

async function quickAdd() {
  const title = quickTitle.value.trim()
  if (!title) return
  try {
    await createTodo({ title, priority: 1 })
    quickTitle.value = ''
    ElMessage.success('已添加')
    await refresh()
  } catch (e) {
    // 错误已由拦截器提示
  }
}

function setView(view) {
  filters.status = 'all'
  filters.priority = ''
  filters.keyword = ''
  filters.dueDate = ''
  if (view === 'today') filters.dueDate = todayYMD
  else if (view === 'high') filters.priority = 2
  else if (view === 'active') filters.status = 'active'
  else if (view === 'completed') filters.status = 'completed'
  fetchTodos()
}

function onNavigate(view) {
  setView(view)
  drawerVisible.value = false
}

function onFilterChange() {
  fetchTodos()
}

function onKeywordInput() {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(fetchTodos, 300)
}

function dayNum(day) {
  const d = day.split('-')[2]
  return d.startsWith('0') ? d.slice(1) : d
}

function isToday(day) {
  return day === todayYMD
}

function isSelected(day) {
  return filters.dueDate === day
}

function pickDate(day) {
  if (filters.dueDate === day) {
    clearDate()
  } else {
    filters.dueDate = day
    calendarDate.value = new Date(day + 'T00:00:00')
    calendarVisible.value = false
    fetchTodos()
  }
}

function clearDate() {
  filters.dueDate = ''
  calendarDate.value = new Date()
  fetchTodos()
}

function openCreate() {
  editingTodo.value = null
  dialogVisible.value = true
}

function openEdit(todo) {
  editingTodo.value = todo
  dialogVisible.value = true
}

async function handleToggle(todo) {
  await toggleTodo(todo.id)
  await refresh()
}

async function handleDelete(todo) {
  await deleteTodo(todo.id)
  ElMessage.success('已删除')
  await refresh()
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* ===== 侧边栏容器（桌面） ===== */
.sidebar-container {
  width: 232px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--card);
  position: sticky;
  top: 0;
  height: 100vh;
}

/* ===== 右侧内容 ===== */
.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  border-bottom: 1px solid var(--border);
  background: var(--card);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-left {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.date {
  font-size: 13px;
  color: var(--text-3);
}

.topbar-right {
  display: none;
}

.main {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 24px 64px;
}

/* ===== 快速添加 ===== */
.quick-add {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.quick-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px var(--border) inset;
  padding: 4px 14px;
}

.quick-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--primary) inset;
}

.detail-btn {
  border-radius: 10px;
  flex-shrink: 0;
}

/* ===== 统计 ===== */
.summary {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 16px;
}

.summary-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.progress-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-hover);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.4s ease;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  min-width: 36px;
  text-align: right;
}

.summary-nums {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: var(--text-2);
}

.summary-nums b {
  color: var(--text-1);
  font-weight: 600;
}

.summary-nums .high b {
  color: var(--danger);
}

/* ===== 工具栏 ===== */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.group-tabs {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--bg-hover);
  border-radius: 8px;
}

.group-tab {
  padding: 5px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-2);
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.group-tab:hover {
  color: var(--text-1);
}

.group-tab.active {
  background: var(--card);
  color: var(--text-1);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.toolbar-spacer {
  flex: 1;
}

.cal-btn {
  border-radius: 8px;
}

.cal-btn.active {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--primary-light);
}

.tool-select {
  width: 110px;
}

.tool-search {
  width: 180px;
}

/* ===== 分组列表 ===== */
.todo-list {
  min-height: 160px;
}

/* 分组切换淡入淡出，避免重排抖动 */
.group-fade-enter-active,
.group-fade-leave-active {
  transition: opacity 0.12s ease;
}
.group-fade-enter-from,
.group-fade-leave-to {
  opacity: 0;
}

.todo-group {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px 8px;
}

.group-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.group-count {
  font-size: 12px;
  color: var(--text-3);
  margin-left: 2px;
}

/* ===== 日历弹窗 ===== */
.calendar-dialog :deep(.el-dialog) {
  border-radius: 12px;
}

.calendar :deep(.el-calendar__header) {
  padding: 4px 0 10px;
}

.calendar :deep(.el-calendar__title) {
  font-size: 15px;
  color: var(--text-1);
}

.calendar :deep(.el-calendar-table thead th) {
  padding: 6px 0;
  border: none;
  color: var(--text-3);
  font-size: 12px;
  font-weight: 500;
}

.calendar :deep(.el-calendar-table td) {
  border: none;
}

.calendar :deep(.el-calendar-day) {
  height: 44px;
  padding: 2px;
}

.date-cell {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.date-cell:hover {
  background: var(--bg-hover);
}

.day-num {
  font-size: 14px;
  line-height: 1;
  color: var(--text-1);
}

.day-badge {
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  font-weight: 600;
}

.date-cell.is-other-month .day-num {
  color: var(--text-3);
}

.date-cell.has-todo .day-num {
  font-weight: 600;
  color: var(--primary);
}

.date-cell.is-today:not(.is-selected) .day-num {
  color: var(--primary);
  font-weight: 700;
}

.date-cell.is-today:not(.is-selected)::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
}

.date-cell.is-selected {
  background: var(--primary);
}

.date-cell.is-selected .day-num {
  color: #fff;
  font-weight: 700;
}

.date-cell.is-selected .day-badge {
  background: rgba(255, 255, 255, 0.3);
}

.calendar-clear {
  text-align: center;
  margin-top: 8px;
}

/* ===== 响应式：窄屏隐藏侧边栏 ===== */
@media (max-width: 768px) {
  .sidebar-container {
    display: none;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-right: 16px;
  }
  .theme-mobile,
  .menu-btn {
    color: var(--text-2);
  }
  .toolbar {
    flex-wrap: wrap;
  }
  .tool-search {
    flex: 1;
    width: auto;
  }
  .summary-nums {
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
