<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand">
        <div class="brand-logo">
          <el-icon :size="24"><CirclePlus /></el-icon>
        </div>
        <h1 class="brand-title">创建账号</h1>
        <p class="brand-sub">开始管理你的待办清单</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="submit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="3-50 个字符"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item label="昵称（可选）" prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="显示名称，默认为用户名"
            :prefix-icon="Avatar"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="至少 6 位"
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="再次输入密码"
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :loading="loading"
          @click="submit"
        >
          注册
        </el-button>
      </el-form>

      <div class="auth-footer">
        已有账号？
        <el-link type="primary" :underline="false" @click="$router.push('/login')">
          去登录
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Avatar, CirclePlus } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度需在 3-50 之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度需在 6-100 之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await authStore.register({
      username: form.username,
      nickname: form.nickname,
      password: form.password
    })
    ElMessage.success('注册成功，已自动登录')
    router.push('/')
  } catch (e) {
    // 错误已由拦截器提示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg);
}

.auth-card {
  width: 420px;
  max-width: 100%;
  padding: 36px 36px 28px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.brand {
  text-align: center;
  margin-bottom: 24px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--primary);
  border-radius: 12px;
}

.brand-title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
}

.brand-sub {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
  border-radius: 8px;
  font-weight: 500;
}

.auth-footer {
  margin-top: 18px;
  text-align: center;
  color: var(--text-3);
  font-size: 13px;
}

.auth-card :deep(.el-input__wrapper) {
  border-radius: 8px;
}
</style>
