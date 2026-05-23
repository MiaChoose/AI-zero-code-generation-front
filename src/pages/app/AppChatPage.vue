<template>
  <div id="appChatPage">
    <!-- 顶部栏 -->
    <div class="header-bar">
      <div class="header-left">
        <h1 class="app-name">{{ appInfo?.appName || '网站生成器' }}</h1>
        <a-tag v-if="appInfo?.codeGenType" color="blue" class="code-gen-type-tag">
          {{ formatCodeGenType(appInfo.codeGenType) }}
        </a-tag>
      </div>
      <div class="header-right">
        <a-button type="default" @click="showAppDetail">
          <template #icon>
            <InfoCircleOutlined />
          </template>
          应用详情
        </a-button>
        <a-button
          type="primary"
          ghost
          @click="downloadCode"
          :loading="downloading"
          :disabled="!isOwner"
        >
          <template #icon>
            <DownloadOutlined />
          </template>
          下载代码
        </a-button>
        <a-button type="primary" @click="deployApp" :loading="deploying">
          <template #icon>
            <CloudUploadOutlined />
          </template>
          部署
        </a-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧对话区域 -->
      <div class="chat-section">
        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <!-- 加载更多按钮 -->
          <div v-if="hasMoreHistory" class="load-more-container">
            <a-button type="link" @click="loadMoreHistory" :loading="loadingHistory" size="small">
              加载更多历史消息
            </a-button>
          </div>
          <div v-for="(message, index) in messages" :key="index" class="message-item">
            <div v-if="message.type === 'user'" class="user-message">
              <div class="message-content">{{ message.content }}</div>
              <div class="message-avatar">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
              </div>
            </div>
            <div v-else class="ai-message">
              <div class="message-avatar">
                <a-avatar :src="aiAvatar" />
              </div>
              <div class="message-content">
                <MarkdownRenderer v-if="message.content" :content="message.content" />
                <div v-if="message.loading" class="typing-indicator" aria-label="AI 正在思考">
                  <span class="dot" />
                  <span class="dot" />
                  <span class="dot" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 选中元素信息展示 -->
        <a-alert
          v-if="selectedElementInfo"
          class="selected-element-alert"
          type="info"
          closable
          @close="clearSelectedElement"
        >
          <template #message>
            <div class="selected-element-info">
              <div class="element-header">
                <span class="element-tag">
                  选中元素：{{ selectedElementInfo.tagName.toLowerCase() }}
                </span>
                <span v-if="selectedElementInfo.id" class="element-id">
                  #{{ selectedElementInfo.id }}
                </span>
                <span v-if="selectedElementInfo.className" class="element-class">
                  .{{ selectedElementInfo.className.split(' ').join('.') }}
                </span>
              </div>
              <div class="element-details">
                <div v-if="selectedElementInfo.textContent" class="element-item">
                  内容: {{ selectedElementInfo.textContent.substring(0, 50) }}
                  {{ selectedElementInfo.textContent.length > 50 ? '...' : '' }}
                </div>
                <div v-if="selectedElementInfo.pagePath" class="element-item">
                  页面路径: {{ selectedElementInfo.pagePath }}
                </div>
                <div class="element-item">
                  选择器:
                  <code class="element-selector-code">{{ selectedElementInfo.selector }}</code>
                </div>
              </div>
            </div>
          </template>
        </a-alert>

        <!-- 用户消息输入框 -->
        <div class="input-container">
          <div class="input-wrapper">
            <a-tooltip v-if="!isOwner" title="无法在别人的作品下对话哦~" placement="top">
              <a-textarea
                v-model:value="userInput"
                :placeholder="getInputPlaceholder()"
                :rows="4"
                :maxlength="1000"
                @keydown.enter.prevent="sendMessage"
                :disabled="isGenerating || !isOwner"
              />
            </a-tooltip>
            <a-textarea
              v-else
              v-model:value="userInput"
              :placeholder="getInputPlaceholder()"
              :rows="4"
              :maxlength="1000"
              @keydown.enter.prevent="sendMessage"
              :disabled="isGenerating"
            />
            <div class="input-actions">
              <a-button
                type="primary"
                @click="sendMessage"
                :loading="isGenerating"
                :disabled="!isOwner"
              >
                发送
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧网页展示区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <h3>生成后的网页展示</h3>
          <div class="preview-actions">
            <a-button
              v-if="isOwner && previewUrl"
              type="link"
              :danger="isEditMode"
              @click="toggleEditMode"
              :class="{ 'edit-mode-active': isEditMode }"
              style="padding: 0; height: auto; margin-right: 12px"
            >
              <template #icon>
                <EditOutlined />
              </template>
              {{ isEditMode ? '退出编辑' : '编辑模式' }}
            </a-button>
            <a-button v-if="previewUrl" type="link" @click="openInNewTab">
              <template #icon>
                <ExportOutlined />
              </template>
              新窗口打开
            </a-button>
          </div>
        </div>
        <div class="preview-content">
          <div v-if="!previewUrl && !isGenerating" class="preview-placeholder">
            <div class="placeholder-icon">🌐</div>
            <p>网站文件生成完成后将在这里展示</p>
          </div>
          <div v-else-if="isGenerating" class="preview-loading">
            <a-spin size="large" />
            <p>正在生成网站...</p>
          </div>
          <iframe
            v-else
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
            @load="onIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- 应用详情弹窗 -->
    <AppDetailModal
      v-model:open="appDetailVisible"
      :app="appInfo"
      :show-actions="isOwner || isAdmin"
      @edit="editApp"
      @delete="deleteApp"
    />

    <!-- 部署成功弹窗 -->
    <DeploySuccessModal
      v-model:open="deployModalVisible"
      :deploy-url="deployUrl"
      @open-site="openDeployedSite"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import {
  getAppVoById,
  deployApp as deployAppApi,
  deleteApp as deleteAppApi,
} from '@/api/appController'
import { listAppChatHistory } from '@/api/chatHistoryController'
import { CodeGenTypeEnum, formatCodeGenType } from '@/utils/codeGenTypes'
import request from '@/request'

import { defineAsyncComponent } from 'vue'

// 异步加载 Markdown 渲染器：把 markdown-it / highlight.js 抽到独立 chunk，
// 仅在用户进入应用对话页且有消息时才请求，缩小首屏体积
const MarkdownRenderer = defineAsyncComponent(() => import('@/components/MarkdownRenderer.vue'))
import AppDetailModal from '@/components/AppDetailModal.vue'
import DeploySuccessModal from '@/components/DeploySuccessModal.vue'
import aiAvatar from '@/assets/logo.png'
import { API_BASE_URL, getStaticPreviewUrl } from '@/config/env'
import { VisualEditor, type ElementInfo } from '@/utils/visualEditor'

import {
  CloudUploadOutlined,
  SendOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const appInfo = ref<API.AppVO>()
const appId = ref<any>()

// 对话相关
interface Message {
  type: 'user' | 'ai'
  content: string
  loading?: boolean
  createTime?: string
}

const messages = ref<Message[]>([])
const userInput = ref('')
const isGenerating = ref(false)
const messagesContainer = ref<HTMLElement>()
const currentEventSource = ref<EventSource | null>(null)
const currentGenerationId = ref('')
const STOP_STATUS_FLAG_KEY = 'app_chat_generation_stop_requested'

// 对话历史相关
const loadingHistory = ref(false)
const hasMoreHistory = ref(false)
const lastCreateTime = ref<string>()
const historyLoaded = ref(false)

// 预览相关
const previewUrl = ref('')
const previewReady = ref(false)

// 部署相关
const deploying = ref(false)
const deployModalVisible = ref(false)
const deployUrl = ref('')

// 下载相关
const downloading = ref(false)

// 可视化编辑相关
const isEditMode = ref(false)
const selectedElementInfo = ref<ElementInfo | null>(null)
const visualEditor = new VisualEditor({
  onElementSelected: (elementInfo: ElementInfo) => {
    selectedElementInfo.value = elementInfo
  },
})

// 权限相关
const isOwner = computed(() => {
  return appInfo.value?.userId === loginUserStore.loginUser.id
})

const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

// 应用详情相关
const appDetailVisible = ref(false)

// 显示应用详情
const showAppDetail = () => {
  appDetailVisible.value = true
}

// 加载对话历史
const loadChatHistory = async (isLoadMore = false) => {
  if (!appId.value || loadingHistory.value) return
  loadingHistory.value = true
  try {
    const params: API.listAppChatHistoryParams = {
      appId: appId.value,
      pageSize: 10,
    }
    // 如果是加载更多，传递最后一条消息的创建时间作为游标
    if (isLoadMore && lastCreateTime.value) {
      params.lastCreateTime = lastCreateTime.value
    }
    const res = await listAppChatHistory(params)
    if (res.data.code === 0 && res.data.data) {
      const chatHistories = res.data.data.records || []
      if (chatHistories.length > 0) {
        // 将对话历史转换为消息格式，并按时间正序排列（老消息在前）
        const historyMessages: Message[] = chatHistories
          .map((chat) => ({
            type: (chat.messageType === 'user' ? 'user' : 'ai') as 'user' | 'ai',
            content: chat.message || '',
            createTime: chat.createTime,
          }))
          .reverse() // 反转数组，让老消息在前
        if (isLoadMore) {
          // 加载更多时，将历史消息添加到开头
          messages.value.unshift(...historyMessages)
        } else {
          // 初始加载，直接设置消息列表
          messages.value = historyMessages
        }
        // 更新游标
        lastCreateTime.value = chatHistories[chatHistories.length - 1]?.createTime
        // 检查是否还有更多历史
        hasMoreHistory.value = chatHistories.length === 10
      } else {
        hasMoreHistory.value = false
      }
      historyLoaded.value = true
    }
  } catch (error) {
    console.error('加载对话历史失败：', error)
    message.error('加载对话历史失败')
  } finally {
    loadingHistory.value = false
  }
}

// 加载更多历史消息
const loadMoreHistory = async () => {
  await loadChatHistory(true)
}

// 获取应用信息
const fetchAppInfo = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('应用ID不存在')
    router.push('/')
    return
  }

  appId.value = id

  try {
    const res = await getAppVoById({ id: id as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data

      // 先加载对话历史
      await loadChatHistory()
      // 如果有至少2条对话记录，展示对应的网站
      if (messages.value.length >= 2) {
        updatePreview()
      }
      // 检查是否需要自动发送初始提示词
      // 只有在是自己的应用且没有对话历史时才自动发送
      if (
        appInfo.value.initPrompt &&
        isOwner.value &&
        messages.value.length === 0 &&
        historyLoaded.value
      ) {
        await sendInitialMessage(appInfo.value.initPrompt)
      }
    } else {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    console.error('获取应用信息失败：', error)
    message.error('获取应用信息失败')
    router.push('/')
  }
}

// 发送初始消息
const sendInitialMessage = async (prompt: string) => {
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: prompt,
  })

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(prompt, aiMessageIndex)
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isGenerating.value) {
    return
  }

  let message = userInput.value.trim()
  // 如果有选中的元素，将元素信息添加到提示词中
  if (selectedElementInfo.value) {
    let elementContext = `\n\n选中元素信息：`
    if (selectedElementInfo.value.pagePath) {
      elementContext += `\n- 页面路径: ${selectedElementInfo.value.pagePath}`
    }
    elementContext += `\n- 标签: ${selectedElementInfo.value.tagName.toLowerCase()}\n- 选择器: ${selectedElementInfo.value.selector}`
    if (selectedElementInfo.value.textContent) {
      elementContext += `\n- 当前内容: ${selectedElementInfo.value.textContent.substring(0, 100)}`
    }
    message += elementContext
  }
  userInput.value = ''
  // 添加用户消息（包含元素信息）
  messages.value.push({
    type: 'user',
    content: message,
  })

  // 发送消息后，清除选中元素并退出编辑模式
  if (selectedElementInfo.value) {
    clearSelectedElement()
    if (isEditMode.value) {
      toggleEditMode()
    }
  }

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(message, aiMessageIndex)
}

// 生成代码 - 使用 EventSource 处理流式响应
const generateCode = async (userMessage: string, aiMessageIndex: number) => {
  let streamCompleted = false

  try {
    // 获取 axios 配置的 baseURL
    const baseURL = request.defaults.baseURL || API_BASE_URL

    // 为每次生成创建唯一会话 ID，避免刷新后旧停止请求误伤新会话
    currentGenerationId.value = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    // 构建URL参数
    const params = new URLSearchParams({
      appId: appId.value || '',
      message: userMessage,
      generationId: currentGenerationId.value,
    })

    const url = `${baseURL}/app/chat/gen/code?${params}`

    // 先关闭之前的连接，避免并发流残留
    if (currentEventSource.value) {
      currentEventSource.value.close()
      currentEventSource.value = null
    }

    // 创建 EventSource 连接
    const eventSource = new EventSource(url, {
      withCredentials: true,
    })
    currentEventSource.value = eventSource

    let fullContent = ''

    // 处理接收到的消息
    eventSource.onmessage = function (event) {
      if (streamCompleted) return

      try {
        // 解析JSON包装的数据
        const parsed = JSON.parse(event.data)
        const content = parsed.d

        // 拼接内容
        if (content !== undefined && content !== null) {
          fullContent += content
          messages.value[aiMessageIndex].content = fullContent
          messages.value[aiMessageIndex].loading = false
          scrollToBottom()
        }
      } catch (error) {
        console.error('解析消息失败:', error)
        handleError(error, aiMessageIndex)
      }
    }

    // 处理done事件
    eventSource.addEventListener('done', function () {
      if (streamCompleted) return

      streamCompleted = true
      isGenerating.value = false
      eventSource.close()
      currentEventSource.value = null
      currentGenerationId.value = ''

      // 延迟更新预览，确保后端已完成处理
      setTimeout(async () => {
        await fetchAppInfo()
        updatePreview()
      }, 1000)
    })

    // 处理business-error事件（后端限流等错误）
    eventSource.addEventListener('business-error', function (event: MessageEvent) {
      if (streamCompleted) return

      try {
        const errorData = JSON.parse(event.data)
        console.error('SSE业务错误事件:', errorData)

        // 显示具体的错误信息
        const errorMessage = errorData.message || '生成过程中出现错误'
        messages.value[aiMessageIndex].content = `❌ ${errorMessage}`
        messages.value[aiMessageIndex].loading = false
        message.error(errorMessage)

        streamCompleted = true
        isGenerating.value = false
        eventSource.close()
        currentEventSource.value = null
        currentGenerationId.value = ''
      } catch (parseError) {
        console.error('解析错误事件失败:', parseError, '原始数据:', event.data)
        handleError(new Error('服务器返回错误'), aiMessageIndex)
      }
    })

    // 处理取消事件（后端明确退出信号）
    eventSource.addEventListener('cancelled', function (event: MessageEvent) {
      if (streamCompleted) return
      let cancelledMessage = '⏹️ 已停止生成，本次任务已退出。'
      try {
        const payload = JSON.parse(event.data || '{}')
        if (payload?.message) {
          cancelledMessage = `⏹️ ${payload.message}`
        }
      } catch (e) {
        // 取消事件解析失败不影响主流程
      }

      messages.value[aiMessageIndex].content = cancelledMessage
      messages.value[aiMessageIndex].loading = false
      message.info('已停止生成，可继续发起新对话')

      streamCompleted = true
      isGenerating.value = false
      eventSource.close()
      currentEventSource.value = null
      currentGenerationId.value = ''
    })

    // 处理错误
    eventSource.onerror = function () {
      if (streamCompleted || !isGenerating.value) return
      // 检查是否是正常的连接关闭
      if (eventSource?.readyState === EventSource.CONNECTING) {
        streamCompleted = true
        isGenerating.value = false
        eventSource.close()
        currentEventSource.value = null
        currentGenerationId.value = ''

        setTimeout(async () => {
          await fetchAppInfo()
          updatePreview()
        }, 1000)
      } else {
        handleError(new Error('SSE连接错误'), aiMessageIndex)
      }
    }
  } catch (error) {
    console.error('创建 EventSource 失败：', error)
    handleError(error, aiMessageIndex)
  }
}

// 错误处理函数
const handleError = (error: unknown, aiMessageIndex: number) => {
  console.error('生成代码失败：', error)
  messages.value[aiMessageIndex].content = '抱歉，生成过程中出现了错误，请重试。'
  messages.value[aiMessageIndex].loading = false
  message.error('生成失败，请重试')
  isGenerating.value = false
  if (currentEventSource.value) {
    currentEventSource.value.close()
    currentEventSource.value = null
  }
  currentGenerationId.value = ''
}

/**
 * 页面卸载阶段尽量可靠地发送停止请求：
 * 1) 优先 sendBeacon（页面关闭时成功率更高）
 * 2) 兜底 keepalive fetch
 */
const sendStopRequestOnLeave = (stopUrl: string) => {
  let beaconSent = false
  try {
    if (navigator.sendBeacon) {
      beaconSent = navigator.sendBeacon(stopUrl, new Blob([], { type: 'application/json' }))
    }
  } catch (e) {
    console.warn('sendBeacon stop request failed', e)
  }
  if (!beaconSent) {
    fetch(stopUrl, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
    }).catch(() => {
      // 页面关闭阶段无需打断用户
    })
  }
}

/**
 * 页面离开 / 刷新时，主动关闭 SSE 并通知后端取消生成。
 */
const stopGenerationOnLeave = () => {
  if (currentEventSource.value) {
    currentEventSource.value.close()
    currentEventSource.value = null
  }
  if (!isGenerating.value || !appId.value) {
    return
  }
  const baseURL = request.defaults.baseURL || API_BASE_URL
  const params = new URLSearchParams({
    appId: String(appId.value),
    generationId: currentGenerationId.value,
  })
  const stopUrl = `${baseURL}/app/chat/stop?${params.toString()}`
  sessionStorage.setItem(STOP_STATUS_FLAG_KEY, '1')
  sendStopRequestOnLeave(stopUrl)
  isGenerating.value = false
  currentGenerationId.value = ''
}

// 更新预览
const updatePreview = () => {
  if (appId.value) {
    const codeGenType = appInfo.value?.codeGenType || CodeGenTypeEnum.HTML
    const newPreviewUrl = getStaticPreviewUrl(codeGenType, appId.value)
    previewUrl.value = newPreviewUrl
    previewReady.value = true
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 下载代码
const downloadCode = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }
  downloading.value = true
  try {
    const API_BASE_URL = request.defaults.baseURL || ''
    const url = `${API_BASE_URL}/app/download/${appId.value}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId.value}.zip`
    // 下载文件
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    link.click()
    // 清理
    URL.revokeObjectURL(downloadUrl)
    message.success('代码下载成功')
  } catch (error) {
    console.error('下载失败：', error)
    message.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

// 部署应用
const deployApp = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  deploying.value = true
  try {
    const res = await deployAppApi({
      appId: appId.value as unknown as number,
    })

    if (res.data.code === 0 && res.data.data) {
      deployUrl.value = res.data.data
      deployModalVisible.value = true
      message.success('部署成功')
    }
  } catch (error) {
    console.error('部署失败：', error)
  } finally {
    deploying.value = false
  }
}

// 在新窗口打开预览
const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// 打开部署的网站
const openDeployedSite = () => {
  if (deployUrl.value) {
    window.open(deployUrl.value, '_blank')
  }
}

// iframe加载完成
const onIframeLoad = () => {
  previewReady.value = true
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (iframe) {
    visualEditor.init(iframe)
    visualEditor.onIframeLoad()
  }
}

// 编辑应用
const editApp = () => {
  if (appInfo.value?.id) {
    router.push(`/app/edit/${appInfo.value.id}`)
  }
}

// 删除应用
const deleteApp = async () => {
  if (!appInfo.value?.id) return

  try {
    const res = await deleteAppApi({ id: appInfo.value.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      appDetailVisible.value = false
      router.push('/')
    }
  } catch (error) {
    console.error('删除失败：', error)
    message.error('删除失败')
  }
}

// 可视化编辑相关函数
const toggleEditMode = () => {
  // 检查 iframe 是否已经加载
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (!iframe) {
    message.warning('请等待页面加载完成')
    return
  }
  // 确保 visualEditor 已初始化
  if (!previewReady.value) {
    message.warning('请等待页面加载完成')
    return
  }
  const newEditMode = visualEditor.toggleEditMode()
  isEditMode.value = newEditMode
}

const clearSelectedElement = () => {
  selectedElementInfo.value = null
  visualEditor.clearSelection()
}

const getInputPlaceholder = () => {
  if (selectedElementInfo.value) {
    return `正在编辑 ${selectedElementInfo.value.tagName.toLowerCase()} 元素，描述您想要的修改...`
  }
  return '请描述你想生成的网站，越详细效果越好哦'
}

// 页面加载时获取应用信息
onMounted(() => {
  if (sessionStorage.getItem(STOP_STATUS_FLAG_KEY) === '1') {
    message.info('已发送停止请求，生成任务正在退出')
    sessionStorage.removeItem(STOP_STATUS_FLAG_KEY)
  }
  fetchAppInfo()
  window.addEventListener('beforeunload', stopGenerationOnLeave)
  window.addEventListener('pagehide', stopGenerationOnLeave)

  // 监听 iframe 消息
  window.addEventListener('message', (event) => {
    visualEditor.handleIframeMessage(event)
  })
})

// 清理资源
onUnmounted(() => {
  window.removeEventListener('beforeunload', stopGenerationOnLeave)
  window.removeEventListener('pagehide', stopGenerationOnLeave)
  stopGenerationOnLeave()
})
</script>

<style scoped>
#appChatPage {
  height: calc(100vh - 56px - 41px); /* viewport - header - footer */
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
}

/* 顶部栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-4) var(--space-3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.code-gen-type-tag {
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-color: var(--color-primary-soft);
}

.app-name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  display: flex;
  gap: var(--space-2);
}

/* 主内容区 */
.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: var(--space-4);
  overflow: hidden;
}

/* 左侧对话区 */
.chat-section {
  flex: 0 0 42%;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.messages-container {
  flex: 1;
  min-height: 0;
  padding: var(--space-5) var(--space-5);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.message-item {
  margin-bottom: var(--space-5);
}

.message-item:last-child {
  margin-bottom: 0;
}

.user-message,
.ai-message {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar :deep(.ant-avatar) {
  width: 32px;
  height: 32px;
}

/* 气泡 */
.message-content {
  max-width: 70%;
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-base);
  word-wrap: break-word;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.user-message .message-content {
  background: var(--color-bubble-user-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-bubble-user-border);
  border-bottom-right-radius: var(--radius-sm);
}

.ai-message .message-content {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: var(--radius-sm);
}

/* AI 正在思考：3 点跳动 */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-tertiary);
  animation: dot-bounce 1.2s infinite ease-in-out;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* 加载更多 */
.load-more-container {
  text-align: center;
  padding: var(--space-2) 0;
  margin-bottom: var(--space-3);
}

/* 选中元素提示 */
.selected-element-alert {
  margin: 0 var(--space-5) var(--space-3);
  border-radius: var(--radius-md);
}

.selected-element-info {
  line-height: var(--line-height-normal);
}

.element-header {
  margin-bottom: var(--space-2);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  align-items: baseline;
}

.element-tag {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-primary);
}

.element-id {
  color: var(--color-success);
}

.element-class {
  color: var(--color-warning);
}

.element-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.element-item {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.element-selector-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: var(--color-surface-muted);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-error);
  border: 1px solid var(--color-border);
}

/* 输入区 */
.input-container {
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-divider);
  background: var(--color-surface);
}

.input-wrapper {
  position: relative;
  background: var(--color-surface-muted);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus-ring);
  background: var(--color-surface);
}

.input-wrapper :deep(.ant-input) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: var(--space-3) 56px var(--space-3) var(--space-4);
  resize: none;
}

.input-wrapper :deep(.ant-input:focus) {
  box-shadow: none;
}

.input-actions {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
}

.input-actions :deep(.ant-btn) {
  border-radius: var(--radius-sm);
}

/* 右侧预览区 */
.preview-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-divider);
  height: 52px;
  flex-shrink: 0;
}

.preview-header h3 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-actions {
  display: flex;
  gap: var(--space-2);
}

.preview-content {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
  background: var(--color-surface-muted);
}

.preview-placeholder,
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-tertiary);
  gap: var(--space-3);
}

.placeholder-icon {
  font-size: 48px;
  opacity: 0.6;
}

.preview-loading p {
  margin: 0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: var(--color-surface);
}

/* 编辑模式按钮 */
.edit-mode-active {
  color: var(--color-error) !important;
}

/* 响应式 */
@media (max-width: 1024px) {
  #appChatPage {
    height: auto;
    min-height: calc(100vh - 56px - 41px);
  }
  .main-content {
    flex-direction: column;
  }
  .chat-section {
    flex: none;
    min-width: 0;
    height: 60vh;
  }
  .preview-section {
    flex: none;
    height: 60vh;
  }
  .message-content {
    max-width: 85%;
  }
}

@media (max-width: 768px) {
  #appChatPage {
    padding: var(--space-2);
  }
  .header-bar {
    padding: var(--space-2);
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .app-name {
    font-size: var(--font-size-md);
  }
  .header-right {
    flex-wrap: wrap;
  }
  .main-content {
    gap: var(--space-2);
  }
}
</style>
