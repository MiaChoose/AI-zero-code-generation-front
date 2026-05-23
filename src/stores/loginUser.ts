import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUser } from '@/api/userController.ts'

/**
 * 登录用户信息
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  // 默认值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  /**
   * 获取登录用户信息
   * @returns true 表示已与后端完成一次判定（无论是否登录），false 表示请求失败（网络/超时），调用方可重试
   */
  async function fetchLoginUser(): Promise<boolean> {
    try {
      // 跳过统一错误提示：未登录 (40100) 是首屏正常态，不应弹 toast
      const res = await getLoginUser({ skipErrorHandler: true })
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      }
      return true
    } catch (error) {
      console.error('获取登录用户信息失败：', error)
      return false
    }
  }

  // 更新登录用户信息
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})
