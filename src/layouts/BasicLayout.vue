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
  /* 薄荷云背景 + 半透明白罩，营造卡片漂浮观感 */
  background: var(--gradient-mint);
  position: relative;
}

.basic-layout::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}

.basic-layout :deep(> *) {
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  width: 100%;
  padding: var(--space-8) var(--space-8) var(--space-10);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: transparent;
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--space-4) var(--space-3) var(--space-6);
  }
}
</style>
