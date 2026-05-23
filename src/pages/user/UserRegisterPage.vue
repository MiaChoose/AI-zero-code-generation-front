<template>
  <div class="user-register-page">
    <div class="register-card">
      <h2 class="title">注册</h2>
      <p class="desc">创建账号，开始使用 Mia 应用生成</p>
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
            { min: 8, message: '密码不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            size="large"
            class="input-field"
          />
        </a-form-item>
        <a-form-item
          name="checkPassword"
          :rules="[
            { required: true, message: '请确认密码' },
            { min: 8, message: '密码不能小于 8 位' },
            { validator: validateCheckPassword },
          ]"
        >
          <a-input-password
            v-model:value="formState.checkPassword"
            placeholder="请确认密码"
            size="large"
            class="input-field"
          />
        </a-form-item>
        <div class="tips">
          已有账号？
          <RouterLink to="/user/login" class="link">去登录</RouterLink>
        </div>
        <a-form-item class="form-item-submit">
          <a-button type="primary" html-type="submit" size="large" block>注册</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { reactive } from 'vue'

const router = useRouter()

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

/**
 * 验证确认密码
 * @param rule
 * @param value
 * @param callback
 */
const validateCheckPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value !== formState.userPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserRegisterRequest) => {
  const res = await userRegister(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  }
}
</script>

<style scoped>
.user-register-page {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
}

.register-card {
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
  .user-register-page {
    padding: var(--space-8) var(--space-3);
  }
  .register-card {
    padding: var(--space-6);
  }
}
</style>
