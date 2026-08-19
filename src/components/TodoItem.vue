<template>
  <div
    class="todo-item"
    :class="{ done: todo.completed }"
    :style="{ '--pc': priorityMeta.color }"
  >
    <span class="priority-bar"></span>

    <el-checkbox
      :model-value="todo.completed"
      class="todo-check"
      @change="$emit('toggle', todo)"
    />

    <div class="todo-main">
      <div class="todo-title">{{ todo.title }}</div>
      <div v-if="todo.description" class="todo-desc">{{ todo.description }}</div>
      <div class="todo-meta">
        <span
          class="prio-tag"
          :style="{ color: priorityMeta.color, background: priorityMeta.bg }"
        >
          {{ priorityMeta.label }}优先级
        </span>
        <span v-if="todo.dueDate" class="due" :class="{ overdue: isOverdue }">
          <el-icon><Clock /></el-icon>{{ dueText }}
        </span>
      </div>
    </div>

    <div class="todo-actions">
      <el-button text class="act-btn" title="编辑" @click="$emit('edit', todo)">
        <el-icon><Edit /></el-icon>
      </el-button>
      <el-popconfirm title="确认删除该待办？" @confirm="$emit('delete', todo)">
        <template #reference>
          <el-button text type="danger" class="act-btn" title="删除">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  todo: { type: Object, required: true }
})

defineEmits(['toggle', 'edit', 'delete'])

const PRIORITY = {
  0: { label: '低', color: '#64748b', bg: '#f1f5f9' },
  1: { label: '中', color: '#d97706', bg: '#fef3c7' },
  2: { label: '高', color: '#dc2626', bg: '#fee2e2' }
}

const priorityMeta = computed(() => PRIORITY[props.todo.priority] ?? PRIORITY[1])

// 距截止日期的天数
const dueDiff = computed(() => {
  if (!props.todo.dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(props.todo.dueDate)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
})

const dueText = computed(() => {
  const diff = dueDiff.value
  if (diff === null) return ''
  if (diff === 0) return '今天到期'
  if (diff === 1) return '明天到期'
  if (diff === -1) return '昨天已到期'
  if (diff < 0) return `已逾期 ${-diff} 天`
  return `剩余 ${diff} 天`
})

const isOverdue = computed(() => {
  return dueDiff.value !== null && dueDiff.value < 0 && !props.todo.completed
})
</script>

<style scoped>
.todo-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 18px 18px 20px;
  background: var(--card);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.todo-item:hover {
  border-color: var(--border-strong);
}

/* 左侧优先级色条 */
.priority-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--pc);
  border-radius: 0 4px 4px 0;
  transition: background 0.2s;
}

.todo-item.done .priority-bar {
  background: #d1d5db;
}

.todo-check {
  margin-top: 2px;
}

.todo-check :deep(.el-checkbox__inner) {
  width: 20px;
  height: 20px;
  border-radius: 6px;
}

.todo-main {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 16px;
  font-weight: 600;
  word-break: break-word;
  transition: color 0.2s;
}

.todo-item.done .todo-title {
  color: var(--text-3);
  text-decoration: line-through;
}

.todo-desc {
  margin-top: 5px;
  font-size: 13px;
  color: var(--text-2);
  white-space: pre-wrap;
  word-break: break-word;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.prio-tag {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

.due {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-2);
}

.due.overdue {
  color: var(--danger);
  font-weight: 600;
}

.todo-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

.act-btn {
  font-size: 17px;
  padding: 6px;
}

@media (max-width: 480px) {
  .todo-actions {
    opacity: 1;
  }
}
</style>
