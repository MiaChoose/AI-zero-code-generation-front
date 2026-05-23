<template>
  <a-layout-header class="header">
    <a-row :wrap="false" align="middle" class="header-row">
      <!-- 左侧：Logo和标题 -->
      <a-col flex="220px">
        <RouterLink to="/" class="brand-link">
          <img class="logo" src="@/assets/logo.png" alt="Logo" />
          <span class="site-title">Mia 应用生成</span>
        </RouterLink>
      </a-col>
      <!-- 中间：导航菜单 -->
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :items="menuItems"
          class="header-menu"
          @click="handleMenuClick"
        />
      </a-col>
      <!-- 右侧：用户操作区域 -->
      <a-col>
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space class="user-trigger" :size="8">
                <a-avatar :size="32" :src="loginUserStore.loginUser.userAvatar" />
                <span class="user-name">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="goModify">
                    <UserOutlined />
                    个人资料
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type MenuProps, message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { userLogout } from '@/api/userController.ts'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const router = useRouter()
// 当前选中菜单
const selectedKeys = ref<string[]>(['/'])
// 监听路由变化，更新当前选中菜单
router.afterEach((to) => {
  selectedKeys.value = [to.path]
})

// 菜单配置项
const originItems = [
  {
    key: '/',
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/appManage',
    label: '应用管理',
    title: '应用管理',
  },
  {
    key: '/admin/chatManage',
    label: '对话管理',
    title: '对话管理',
  },
]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    const menuKey = menu?.key as string
    if (menuKey?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const menuItems = computed<MenuProps['items']>(() => filterMenus(originItems))

// 处理菜单点击
const handleMenuClick: MenuProps['onClick'] = (e) => {
  const key = e.key as string
  selectedKeys.value = [key]
  // 跳转到对应页面
  if (key.startsWith('/')) {
    router.push(key)
  }
}

// 个人资料
const goModify = () => {
  router.push('/user/modify')
}

// 退出登录
const doLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  }
}
</script>

<style scoped>
.header {
  background: var(--color-surface);
  height: 56px;
  line-height: 56px;
  padding: 0 var(--space-6);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.header-row {
  height: 56px;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
}

.logo {
  height: 32px;
  width: 32px;
  border-radius: var(--radius-sm);
}

.site-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

.header-menu {
  background: transparent;
  border-bottom: none !important;
  line-height: 54px;
}

.user-login-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-trigger {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.user-trigger:hover {
  background: var(--color-primary-bg);
}

.user-name {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

/* 菜单项激活态使用主色而非默认蓝 */
.header-menu :deep(.ant-menu-item-selected) {
  color: var(--color-primary) !important;
}

.header-menu :deep(.ant-menu-item-selected::after),
.header-menu :deep(.ant-menu-item-active::after) {
  border-bottom-color: var(--color-primary) !important;
}
</style>

