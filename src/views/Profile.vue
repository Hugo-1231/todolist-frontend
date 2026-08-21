<template>
  <div class="profile-page">
    <header class="profile-header">
      <el-button text class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h1 class="title">个人中心</h1>
    </header>

    <div class="profile-body">
      <!-- 头像 -->
      <div class="card avatar-card">
        <div class="avatar-wrap" @click="triggerUpload">
          <img v-if="profile.avatar" :src="profile.avatar" class="avatar-img" alt="头像" />
          <span v-else class="avatar-fallback">{{ initial }}</span>
          <span class="avatar-edit"><el-icon><Camera /></el-icon></span>
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="onFileChange" />
        <div class="avatar-hint">点击头像上传</div>
      </div>

      <!-- 昵称 -->
      <div class="card">
        <div class="field-label">昵称</div>
        <div class="field-row">
          <el-input v-model="nickname" placeholder="输入昵称" maxlength="50" />
          <el-button type="primary" :loading="saving.nickname" @click="saveNickname">保存</el-button>
        </div>
      </div>

      <!-- 用户名（只读） -->
      <div class="card">
        <div class="field-label">用户名</div>
        <div class="readonly">{{ profile.username }}</div>
      </div>

      <!-- 手机号 -->
      <div class="card">
        <div class="field-label">手机号</div>
        <div class="field-row">
          <el-input v-model="phone" placeholder="用于修改密码" maxlength="11" />
          <el-button type="primary" :loading="saving.phone" @click="savePhone">
            {{ profile.phone ? '更新' : '绑定' }}
          </el-button>
        </div>
        <div class="field-tip">手机号可用于通过验证修改密码</div>
      </div>

      <!-- 邮箱 -->
      <div class="card">
        <div class="field-label">邮箱</div>
        <div class="field-row">
          <el-input v-model="email" placeholder="输入邮箱" />
          <el-button type="primary" :loading="saving.email" @click="saveEmail">
            {{ profile.email ? '更新' : '绑定' }}
          </el-button>
        </div>
      </div>

      <!-- 修改密码 -->
      <div class="card">
        <div class="field-label">修改密码</div>
        <el-input v-model="pwdPhone" class="mb" placeholder="已绑定的手机号" maxlength="11" />
        <el-input v-model="newPwd" class="mb" type="password" show-password placeholder="新密码（至少 6 位）" />
        <el-input v-model="confirmPwd" class="mb" type="password" show-password placeholder="确认新密码" />
        <el-button type="primary" class="full-btn" :loading="saving.password" @click="savePassword">
          修改密码
        </el-button>
      </div>

      <!-- 退出登录 -->
      <el-button class="logout-btn" @click="logout">
        <el-icon><SwitchButton /></el-icon>退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Camera, SwitchButton } from '@element-plus/icons-vue'
import { getProfile, updateProfile, bindPhone, bindEmail, changePassword } from '../api/user'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const profile = ref({})
const nickname = ref('')
const phone = ref('')
const email = ref('')
const pwdPhone = ref('')
const newPwd = ref('')
const confirmPwd = ref('')
const fileInput = ref()
const saving = reactive({ nickname: false, phone: false, email: false, password: false })

const initial = computed(() => (profile.value.nickname || profile.value.username || '?').charAt(0))

async function load() {
  try {
    profile.value = await getProfile()
    nickname.value = profile.value.nickname || ''
    phone.value = profile.value.phone || ''
    email.value = profile.value.email || ''
  } catch (e) {
    // 拦截器已提示
  }
}

function goBack() {
  router.push('/')
}

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      // 压缩为 200x200 的正方形
      const size = 200
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      saveAvatar(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

async function saveAvatar(base64) {
  try {
    profile.value = await updateProfile({ avatar: base64 })
    ElMessage.success('头像已更新')
  } catch (e) {
    // 拦截器已提示
  }
}

async function saveNickname() {
  if (!nickname.value.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }
  saving.nickname = true
  try {
    profile.value = await updateProfile({ nickname: nickname.value.trim() })
    ElMessage.success('昵称已更新')
  } catch (e) {
    // 拦截器已提示
  } finally {
    saving.nickname = false
  }
}

async function savePhone() {
  saving.phone = true
  try {
    profile.value = await bindPhone(phone.value.trim())
    ElMessage.success('手机号已绑定')
  } catch (e) {
    // 拦截器已提示
  } finally {
    saving.phone = false
  }
}

async function saveEmail() {
  saving.email = true
  try {
    profile.value = await bindEmail(email.value.trim())
    ElMessage.success('邮箱已绑定')
  } catch (e) {
    // 拦截器已提示
  } finally {
    saving.email = false
  }
}

async function savePassword() {
  if (!pwdPhone.value.trim()) {
    ElMessage.warning('请输入已绑定的手机号')
    return
  }
  if (newPwd.value.length < 6) {
    ElMessage.warning('新密码至少 6 位')
    return
  }
  if (newPwd.value !== confirmPwd.value) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  saving.password = true
  try {
    await changePassword(pwdPhone.value.trim(), newPwd.value)
    ElMessage.success('密码已修改，请重新登录')
    authStore.logout()
    router.push('/login')
  } catch (e) {
    // 拦截器已提示
  } finally {
    saving.password = false
  }
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(load)
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--card);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  font-size: 18px;
  color: var(--text-2);
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.profile-body {
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 16px 48px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 14px;
}

.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
}

.avatar-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--border);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 600;
  color: #fff;
  background: var(--primary);
}

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.avatar-hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-3);
}

.hidden-input {
  display: none;
}

.field-label {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 8px;
  font-weight: 500;
}

.field-row {
  display: flex;
  gap: 8px;
}

.field-row .el-input {
  flex: 1;
}

.field-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-3);
}

.readonly {
  padding: 8px 0;
  color: var(--text-1);
  font-weight: 500;
}

.mb {
  margin-bottom: 10px;
}

.full-btn {
  width: 100%;
  border-radius: 8px;
}

.logout-btn {
  width: 100%;
  border-radius: 8px;
  color: var(--danger);
}
</style>
