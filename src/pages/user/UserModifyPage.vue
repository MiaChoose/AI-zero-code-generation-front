<template>
  <div class="user-modify-page">
    <div class="modify-card">
      <h2 class="title">个人资料</h2>
      <p class="desc">修改你的昵称与头像</p>
      <a-form
        :model="formState"
        name="profile"
        autocomplete="off"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item label="头像" name="userAvatar" class="form-item-avatar">
          <div class="avatar-upload-wrap">
            <a-avatar
              :size="88"
              :src="formState.userAvatar || loginUserStore.loginUser.userAvatar"
              class="avatar-preview"
            />
            <div class="avatar-actions">
              <a-upload
                name="file"
                :show-upload-list="false"
                :before-upload="beforeAvatarUpload"
                accept="image/*"
              >
                <a-button type="primary" size="small">
                  <UploadOutlined />
                  上传头像
                </a-button>
              </a-upload>
            </div>
          </div>
        </a-form-item>
        <a-form-item
          label="昵称"
          name="userName"
          :rules="[
            { required: true, message: '请输入昵称' },
            { max: 32, message: '昵称最多 32 个字符' },
          ]"
        >
          <a-input
            v-model:value="formState.userName"
            placeholder="请输入昵称"
            allow-clear
            :maxlength="32"
            show-count
            class="input-nickname"
          />
        </a-form-item>
        <a-form-item class="form-item-actions">
          <a-space size="middle">
            <a-button type="primary" html-type="submit" :loading="submitting">
              保存
            </a-button>
            <a-button @click="router.push('/')">返回</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { updateUserProfile, uploadUserAvatar } from '@/api/userController'
import type { API } from '@/api/typings'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const formState = reactive<API.UserProfileUpdateRequest>({
  userName: '',
  userAvatar: '',
})
const submitting = ref(false)

onMounted(() => {
  const user = loginUserStore.loginUser
  if (!user?.id) {
    router.replace('/user/login?redirect=/user/modify')
    return
  }
  formState.userName = user?.userName ?? ''
  formState.userAvatar = user?.userAvatar ?? ''
})

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB')
    return false
  }
  uploadAvatar(file)
  return false
}

async function uploadAvatar(file: File) {
  try {
    const res = await uploadUserAvatar(file)
    if (res.data.code === 0 && res.data.data) {
      formState.userAvatar = res.data.data
      message.success('头像上传成功')
    } else {
      message.error('头像上传失败，' + (res.data.message || ''))
    }
  } catch (e: any) {
    message.error('头像上传失败')
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    const res = await updateUserProfile({
      userName: formState.userName,
      userAvatar: formState.userAvatar || undefined,
    })
    if (res.data.code === 0 && res.data.data) {
      loginUserStore.setLoginUser(res.data.data)
      message.success('保存成功')
      router.push('/')
    } else {
      message.error('保存失败，' + (res.data.message || ''))
    }
  } catch (e: any) {
    message.error('保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.user-modify-page {
  min-height: calc(100vh - 64px);
  padding: 48px 24px;
  background: linear-gradient(180deg, #d7ffee 0%, #b3f4dd 45%, #8ad7bf 100%);
}

.modify-card {
  max-width: 420px;
  margin: 0 auto;
  padding: 40px 40px 36px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 6px 24px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(34, 211, 238, 0.12);
}

.title {
  text-align: center;
  margin-bottom: 6px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1e293b;
}

.desc {
  text-align: center;
  color: #64748b;
  margin-bottom: 28px;
  font-size: 14px;
}

.avatar-upload-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.avatar-preview {
  border: 2px solid rgba(34, 211, 238, 0.2);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.avatar-actions :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.form-item-actions :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.form-item-actions :deep(.ant-btn:not(.ant-btn-primary)) {
  border-radius: 8px;
  border-color: rgba(20, 184, 166, 0.35);
  color: #0f766e;
}

.form-item-actions :deep(.ant-btn:not(.ant-btn-primary):hover) {
  border-color: #14b8a6;
  color: #0d9488;
}

.input-nickname :deep(.ant-input) {
  border-radius: 8px;
  border-color: rgba(148, 163, 184, 0.35);
}

.input-nickname :deep(.ant-input:hover),
.input-nickname :deep(.ant-input:focus) {
  border-color: rgba(20, 184, 166, 0.5);
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}

.avatar-actions {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .user-modify-page {
    padding: 32px 16px;
  }
  .modify-card {
    padding: 28px 24px 28px;
    border-radius: 16px;
  }
}
</style>
