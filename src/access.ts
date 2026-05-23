import { useLoginUserStore } from '@/stores/loginUser'
import { message } from 'ant-design-vue'
import router from '@/router'

// 是否已经向后端确认过登录态（无论已登录或未登录）
let loginStateResolved = false

/**
 * 全局权限校验
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  // 首次进入或前一次拉取失败时，等待后端返回再做权限判定
  // 这样在请求超时/网络异常恢复后，下一次导航仍能正确判定登录态
  if (!loginStateResolved) {
    const ok = await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    if (ok) {
      loginStateResolved = true
    }
  }
  const toUrl = to.fullPath
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 'admin') {
      message.error('没有权限')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})
