<template>
  <el-dialog
    class="todo-dialog"
    :model-value="visible"
    width="520px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="dlg-header">
        <span class="dlg-icon">
          <el-icon :size="18"><Edit v-if="todo" /><Plus v-else /></el-icon>
        </span>
        <div>
          <div class="dlg-title">{{ todo ? '编辑待办' : '新建待办' }}</div>
          <div class="dlg-sub">{{ todo ? '修改这条待办的内容' : '记下你接下来要做的事' }}</div>
        </div>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="要做什么？"
          maxlength="200"
          show-word-limit
          @keyup.enter="submit"
        />
      </el-form-item>
      <el-form-item label="描述（可选）">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="2000"
          placeholder="补充说明"
        />
      </el-form-item>

      <el-form-item label="优先级">
        <div class="prio-select">
          <div
            v-for="opt in PRIORITY_OPTIONS"
            :key="opt.value"
            class="prio-option"
            :class="{ active: form.priority === opt.value }"
            @click="form.priority = opt.value"
          >
            <span class="prio-dot" :style="{ background: opt.color }"></span>
            <span class="prio-text">{{ opt.label }}优先级</span>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="截止日期（可选）">
        <el-date-picker
          v-model="form.dueDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button round @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" round :loading="submitting" @click="submit">
        {{ todo ? '保存修改' : '添加待办' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Plus } from '@element-plus/icons-vue'
import { createTodo, updateTodo } from '../api/todo'
import { PRIORITY_OPTIONS } from '../utils/priority'

const props = defineProps({
  visible: { type: Boolean, default: false },
  todo: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref()
const submitting = ref(false)
const form = reactive({
  title: '',
  description: '',
  priority: 1,
  dueDate: null
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

// 打开弹窗时初始化表单
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.todo) {
        form.title = props.todo.title
        form.description = props.todo.description || ''
        form.priority = props.todo.priority ?? 1
        form.dueDate = props.todo.dueDate || null
      } else {
        form.title = ''
        form.description = ''
        form.priority = 1
        form.dueDate = null
      }
      formRef.value?.clearValidate()
    }
  }
)

async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      dueDate: form.dueDate || null
    }
    if (props.todo) {
      await updateTodo(props.todo.id, payload)
      ElMessage.success('已更新')
    } else {
      await createTodo(payload)
      ElMessage.success('已添加')
    }
    emit('update:visible', false)
    emit('success')
  } catch (e) {
    // 错误已由拦截器提示
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.todo-dialog :deep(.el-dialog) {
  border-radius: 12px;
  padding: 22px 26px 16px;
  box-shadow: var(--shadow-lg);
}

.dlg-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dlg-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--primary);
  flex-shrink: 0;
}

.dlg-title {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
}

.dlg-sub {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.todo-dialog :deep(.el-form-item__label) {
  color: var(--text-1);
  font-weight: 500;
}

.todo-dialog :deep(.el-input__wrapper),
.todo-dialog :deep(.el-textarea__inner) {
  border-radius: 10px;
}

.todo-dialog :deep(.el-date-editor) {
  border-radius: 10px;
}

/* 优先级卡片选择 */
.prio-select {
  display: flex;
  gap: 10px;
  width: 100%;
}

.prio-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 12px;
  border-radius: 11px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 13px;
  color: var(--text-2);
  user-select: none;
}

.prio-option:hover {
  border-color: var(--primary);
}

.prio-option.active {
  border-color: var(--primary);
  background: var(--el-color-primary-light-9);
  color: var(--primary);
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.15);
}

.prio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.todo-dialog :deep(.el-button.is-round) {
  padding-left: 22px;
  padding-right: 22px;
}
</style>
