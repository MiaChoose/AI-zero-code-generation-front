<template>
  <div id="userLoginPage">
    <h2 class="title">AI 应用生成 - 用户登录</h2>
    <div class="desc">轻松生成完整应用</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码长度不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <div class="tips">
        没有账号
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
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
#userLoginPage {
  max-width: 420px;
  margin: 48px auto;
  padding: 32px 32px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 24px 80px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(18px);
}

.title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #0f172a;
}

.desc {
  text-align: center;
  color: #6b7280;
  margin-bottom: 24px;
  font-size: 13px;
}

.tips {
  text-align: right;
  color: #9ca3af;
  font-size: 12px;
  margin-bottom: 8px;
}

.tips a {
  color: #14b8a6;
}

@media (max-width: 768px) {
  #userLoginPage {
    margin: 32px 12px;
    padding: 24px 18px 20px;
    border-radius: 18px;
  }
}
</style>
