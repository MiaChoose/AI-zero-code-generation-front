<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowUpOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage } from '@/api/appController'
import { getDeployUrl } from '@/config/env'
import AppCard from '@/components/AppCard.vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 用户提示词
const userPrompt = ref('')
const creating = ref(false)

// Tab 切换：featured（精选）/ mine（我的）
const activeTab = ref<'featured' | 'mine'>('featured')

// 我的应用数据
const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

// 精选应用数据
const featuredApps = ref<API.AppVO[]>([])
const featuredAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

// 灵感提示
const inspirations: { label: string; prompt: string }[] = [
  {
    label: '个人博客网站',
    prompt:
      '创建一个现代化的个人博客网站，包含文章列表、详情页、分类标签、搜索功能、评论系统和个人简介页面。采用简洁的设计风格，支持响应式布局，文章支持 Markdown 格式，首页展示最新文章和热门推荐。',
  },
  {
    label: '企业官网',
    prompt:
      '设计一个专业的企业官网，包含公司介绍、产品服务展示、新闻资讯、联系我们等页面。采用商务风格，包含轮播图、产品展示卡片、团队介绍、客户案例展示，支持多语言切换和在线客服功能。',
  },
  {
    label: '在线商城',
    prompt:
      '构建一个功能完整的在线商城，包含商品展示、购物车、用户注册登录、订单管理、支付结算等功能。设计现代化的商品卡片布局，支持商品搜索筛选、用户评价、优惠券系统和会员积分功能。',
  },
  {
    label: '作品展示',
    prompt:
      '制作一个精美的作品展示网站，适合设计师、摄影师、艺术家等创作者。包含作品画廊、项目详情页、个人简历、联系方式等模块。采用瀑布流或网格布局展示作品，支持图片放大预览和作品分类筛选。',
  },
]

// 设置提示词
const setPrompt = (prompt: string) => {
  userPrompt.value = prompt
}

const isLoggedIn = computed(() => !!loginUserStore.loginUser.id)

// 创建应用
const createApp = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('请输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const res = await addApp({
      initPrompt: userPrompt.value.trim(),
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      const appId = String(res.data.data)
      await router.push(`/app/chat/${appId}`)
    }
  } catch (error) {
    console.error('创建应用失败：', error)
  } finally {
    creating.value = false
  }
}

// 加载我的应用
const loadMyApps = async () => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  try {
    const res = await listMyAppVoByPage({
      pageNum: myAppsPage.current,
      pageSize: myAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载我的应用失败：', error)
  }
}

// 加载精选应用
const loadFeaturedApps = async () => {
  try {
    const res = await listGoodAppVoByPage({
      pageNum: featuredAppsPage.current,
      pageSize: featuredAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载精选应用失败：', error)
  }
}

// 查看对话
const viewChat = (appId: string | number | undefined) => {
  if (appId) {
    router.push(`/app/chat/${appId}?view=1`)
  }
}

// 查看作品
const viewWork = (app: API.AppVO) => {
  if (app.deployKey) {
    const url = getDeployUrl(app.deployKey)
    window.open(url, '_blank')
  }
}

onMounted(() => {
  loadMyApps()
  loadFeaturedApps()
})
</script>

<template>
  <div id="homePage">
    <div class="container">
      <!-- Hero 区域 -->
      <section class="hero-section">
        <h1 class="hero-title">生成你想要的网站</h1>
        <p class="hero-subtitle">输入你的想法，AI 自动为你完成代码、设计与部署。</p>

        <!-- Hero 输入卡 -->
        <div class="hero-card">
          <a-textarea
            v-model:value="userPrompt"
            placeholder="例如：帮我创建一个简洁的个人博客网站，支持 Markdown 写作和文章分类。"
            :rows="4"
            :maxlength="1000"
            :bordered="false"
            class="hero-textarea"
            @keydown.ctrl.enter.prevent="createApp"
            @keydown.meta.enter.prevent="createApp"
          />
          <div class="hero-card-footer">
            <span class="hero-tip">Ctrl / ⌘ + Enter 发送</span>
            <a-button
              type="primary"
              shape="circle"
              size="large"
              :loading="creating"
              class="send-btn"
              @click="createApp"
            >
              <template #icon>
                <ArrowUpOutlined />
              </template>
            </a-button>
          </div>
        </div>

        <!-- 灵感 chip -->
        <div class="inspirations">
          <span class="inspiration-label">✨ 灵感示例</span>
          <button
            v-for="item in inspirations"
            :key="item.label"
            class="chip"
            type="button"
            @click="setPrompt(item.prompt)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>

      <!-- 应用 Tab 切换 -->
      <section class="apps-section">
        <a-tabs v-model:active-key="activeTab" class="apps-tabs">
          <a-tab-pane key="featured" tab="精选作品">
            <div class="app-grid">
              <AppCard
                v-for="app in featuredApps"
                :key="app.id"
                :app="app"
                :featured="true"
                @view-chat="viewChat"
                @view-work="viewWork"
              />
            </div>
            <a-empty
              v-if="!featuredApps.length"
              description="暂无精选作品"
              class="empty-state"
            />
            <div v-if="featuredAppsPage.total > 0" class="pagination-wrapper">
              <a-pagination
                v-model:current="featuredAppsPage.current"
                v-model:page-size="featuredAppsPage.pageSize"
                :total="featuredAppsPage.total"
                :show-size-changer="false"
                :show-total="(total: number) => `共 ${total} 个`"
                @change="loadFeaturedApps"
              />
            </div>
          </a-tab-pane>

          <a-tab-pane key="mine" tab="我的应用" :disabled="!isLoggedIn">
            <div v-if="!isLoggedIn" class="empty-state">
              <a-empty description="登录后查看你创建的应用">
                <a-button type="primary" @click="router.push('/user/login')">去登录</a-button>
              </a-empty>
            </div>
            <template v-else>
              <div class="app-grid">
                <AppCard
                  v-for="app in myApps"
                  :key="app.id"
                  :app="app"
                  @view-chat="viewChat"
                  @view-work="viewWork"
                />
              </div>
              <a-empty v-if="!myApps.length" description="还没有作品，输入想法创建一个吧" class="empty-state" />
              <div v-if="myAppsPage.total > 0" class="pagination-wrapper">
                <a-pagination
                  v-model:current="myAppsPage.current"
                  v-model:page-size="myAppsPage.pageSize"
                  :total="myAppsPage.total"
                  :show-size-changer="false"
                  :show-total="(total: number) => `共 ${total} 个`"
                  @change="loadMyApps"
                />
              </div>
            </template>
          </a-tab-pane>
        </a-tabs>
      </section>
    </div>
  </div>
</template>

<style scoped>
#homePage {
  width: 100%;
  min-height: 100%;
}

.container {
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
  box-sizing: border-box;
}

/* Hero */
.hero-section {
  text-align: center;
  padding: var(--space-12) 0 var(--space-10);
}

.hero-title {
  font-size: var(--font-size-hero);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
  letter-spacing: -0.5px;
  line-height: var(--line-height-tight);
}

.hero-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-8);
}

.hero-card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: var(--radius-3xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-elevated);
  padding: var(--space-5) var(--space-6) var(--space-3);
  text-align: left;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.hero-card:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    var(--shadow-elevated),
    var(--shadow-focus-ring);
}

.hero-textarea {
  background: transparent;
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
  resize: none;
  padding: 0;
}

.hero-textarea :deep(textarea) {
  background: transparent;
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
}

.hero-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-divider);
  margin-top: var(--space-3);
}

.hero-tip {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.send-btn {
  background: var(--color-primary);
  border: none;
  box-shadow: var(--shadow-primary);
}

.send-btn:hover {
  background: var(--color-primary-hover) !important;
}

/* 灵感 chip */
.inspirations {
  margin-top: var(--space-6);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  align-items: center;
}

.inspiration-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-right: var(--space-2);
}

.chip {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-full);
  padding: 6px 14px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
  transform: translateY(-1px);
}

/* 应用 Tab */
.apps-section {
  margin: var(--space-6) 0 var(--space-12);
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border);
  padding: var(--space-6) var(--space-8);
  box-shadow: var(--shadow-card);
}

.apps-tabs :deep(.ant-tabs-nav) {
  margin-bottom: var(--space-6);
}

.apps-tabs :deep(.ant-tabs-tab) {
  font-size: var(--font-size-md);
  padding: var(--space-3) 0;
}

.apps-tabs :deep(.ant-tabs-ink-bar) {
  background: var(--color-primary);
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-5);
}

.empty-state {
  padding: var(--space-12) 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }
  .hero-subtitle {
    font-size: var(--font-size-base);
  }
  .hero-card {
    padding: var(--space-4);
  }
  .apps-section {
    padding: var(--space-4);
  }
  .app-grid {
    grid-template-columns: 1fr;
  }
}
</style>
