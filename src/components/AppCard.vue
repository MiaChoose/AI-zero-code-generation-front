<template>
  <div class="app-card" :class="{ 'app-card--featured': featured }">
    <div class="app-preview">
      <img v-if="app.cover" :src="app.cover" :alt="app.appName" />
      <div v-else class="app-placeholder">
        <span class="app-placeholder-icon">🤖</span>
      </div>
      <div class="app-overlay">
        <a-space size="small" wrap>
          <a-button type="primary" size="small" @click="handleViewChat">查看对话</a-button>
          <a-button v-if="app.deployKey" size="small" @click="handleViewWork">查看作品</a-button>
        </a-space>
      </div>
    </div>
    <div class="app-info">
      <div class="app-info-left">
        <a-avatar :src="app.user?.userAvatar" :size="36">
          {{ app.user?.userName?.charAt(0) || 'U' }}
        </a-avatar>
      </div>
      <div class="app-info-right">
        <h3 class="app-title">{{ app.appName || '未命名应用' }}</h3>
        <p class="app-author">
          {{ app.user?.userName || (featured ? '官方' : '未知用户') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  app: API.AppVO
  featured?: boolean
}

interface Emits {
  (e: 'view-chat', appId: string | number | undefined): void
  (e: 'view-work', app: API.AppVO): void
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})

const emit = defineEmits<Emits>()

const handleViewChat = () => {
  emit('view-chat', props.app.id)
}

const handleViewWork = () => {
  emit('view-work', props.app)
}
</script>

<style scoped>
.app-card {
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  transition: all 0.25s ease;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary-soft);
  box-shadow: var(--shadow-card-hover);
}

.app-card--featured {
  border-color: var(--color-primary-soft);
}

.app-card--featured:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-primary);
}

.app-preview {
  height: 180px;
  background: linear-gradient(145deg, #d7ffee 0%, #b3f4dd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.app-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-placeholder-icon {
  font-size: 48px;
  opacity: 0.7;
}

.app-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.app-card:hover .app-overlay {
  opacity: 1;
}

.app-info {
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-top: 1px solid var(--color-divider);
}

.app-info-left {
  flex-shrink: 0;
}

.app-info-right {
  flex: 1;
  min-width: 0;
}

.app-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin: 0 0 2px;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.app-author {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
