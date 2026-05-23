<script setup lang="ts">
import { theme } from 'ant-design-vue'
import BasicLayout from '@/layouts/BasicLayout.vue'

// 把 antd 主色锁定成品牌主色 #10B981
const themeConfig = {
  token: {
    colorPrimary: '#10B981',
    colorInfo: '#10B981',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorTextBase: '#0F172A',
    borderRadius: 10,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif",
  },
  algorithm: theme.defaultAlgorithm,
}
</script>

<template>
  <a-config-provider :theme="themeConfig">
    <BasicLayout />
  </a-config-provider>
</template>

<style>
/* 全局样式优化 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Roboto',
    'Helvetica Neue', sans-serif;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

html {
  overflow-x: hidden;
}
</style>
