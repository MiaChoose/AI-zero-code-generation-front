<template>
  <div class="user-login-page">
    <div class="login-card">
      <h2 class="title">登录</h2>
      <p class="desc">使用账号登录 Mia 应用生成</p>
      <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input
            v-model:value="formState.userAccount"
            placeholder="请输入账号"
            size="large"
            class="input-field"
          />
        </a-form-item>
        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            size="large"
            class="input-field"
          />
        </a-form-item>
        <div class="tips">
          没有账号
          <RouterLink to="/user/register" class="link">去注册</RouterLink>
        </div>
        <a-form-item class="form-item-submit">
          <a-button type="primary" html-type="submit" size="large" block>登录</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { userLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const res = await userLogin(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
.user-login-page {
  min-height: calc(100vh - 64px);
  padding: 48px 24px;
  background: linear-gradient(180deg, #d7ffee 0%, #b3f4dd 45%, #8ad7bf 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 400px;
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

.input-field :deep(.ant-input),
.input-field :deep(.ant-input-password input) {
  border-radius: 8px;
  border-color: rgba(148, 163, 184, 0.35);
}

.input-field :deep(.ant-input:hover),
.input-field :deep(.ant-input:focus),
.input-field :deep(.ant-input-password:hover input),
.input-field :deep(.ant-input-password:focus-within input) {
  border-color: rgba(20, 184, 166, 0.5);
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}

.form-item-submit :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  height: 44px;
}

.tips {
  text-align: right;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 16px;
}

.link {
  color: #0f766e;
  font-weight: 500;
  text-decoration: none;
}

.link:hover {
  color: #14b8a6;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .user-login-page {
    padding: 32px 16px;
  }
  .login-card {
    padding: 28px 24px 28px;
    border-radius: 16px;
  }
}
</style>
