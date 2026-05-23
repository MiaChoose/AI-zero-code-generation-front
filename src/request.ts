import axios, { type AxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import { API_BASE_URL } from '@/config/env'

/**
 * 业务约定：后端响应统一为 { code, data, message }
 * - code === 0           成功
 * - code === 40100       未登录，跳转登录页
 * - 其余非 0              业务错误，统一 message.error(message)
 *
 * 调用方若想自行处理错误（如表单内联报错），可在 options 中传 skipErrorHandler: true。
 */
export interface RequestOptions extends AxiosRequestConfig {
  skipErrorHandler?: boolean
}

interface BaseResponse<T = unknown> {
  code?: number
  data?: T
  message?: string
}

const NOT_LOGIN_CODE = 40100
const SUCCESS_CODE = 0

const myAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const data = response.data as BaseResponse | undefined
    const config = response.config as RequestOptions
    const skip = config?.skipErrorHandler

    // 非业务包裹结构（如二进制流、SSE 等）直接返回
    if (!data || typeof data.code !== 'number') {
      return response
    }

    if (data.code === NOT_LOGIN_CODE) {
      const url = response.request?.responseURL ?? ''
      if (
        !url.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        message.warning('请先登录')
        window.location.href = `/user/login?redirect=${window.location.href}`
      }
      return response
    }

    if (data.code !== SUCCESS_CODE && !skip) {
      message.error(data.message || '请求失败')
    }
    return response
  },
  function (error) {
    const skip = (error?.config as RequestOptions | undefined)?.skipErrorHandler
    if (!skip) {
      const status = error?.response?.status
      const tip = status ? `网络异常 (${status})` : '网络异常，请稍后重试'
      message.error(tip)
    }
    return Promise.reject(error)
  },
)

export default myAxios
