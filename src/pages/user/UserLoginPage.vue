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
  }
}
</script>

<style scoped>
.user-login-page {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: var(--space-10);
  border-radius: var(--radius-3xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-elevated);
}

.title {
  text-align: center;
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-xl);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.desc {
  text-align: center;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-8);
  font-size: var(--font-size-base);
}

.tips {
  text-align: right;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
}

.link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.form-item-submit :deep(.ant-btn-primary) {
  height: 44px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .user-login-page {
    padding: var(--space-8) var(--space-3);
  }
  .login-card {
    padding: var(--space-6);
  }
}
</style>
