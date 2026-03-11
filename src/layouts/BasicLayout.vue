<template>
  <a-layout class="basic-layout">
    <!-- 顶部导航栏 -->
    <GlobalHeader />
    <!-- 主要内容区域 -->
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
    <!-- 底部版权信息 -->
    <GlobalFooter />
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* 全局背景：以 #D7FFEE 为主的自上而下柔和渐变 */
  background: linear-gradient(180deg, #d7ffee 0%, #b3f4dd 45%, #8ad7bf 100%);
}

.main-content {
  flex: 1;
  width: 100%;
  padding: 32px 32px 40px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px 12px 24px;
  }
}
</style>
