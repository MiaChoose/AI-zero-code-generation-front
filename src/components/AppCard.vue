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
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 6px 24px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(34, 211, 238, 0.12);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 12px 40px rgba(15, 23, 42, 0.12);
  border-color: rgba(34, 211, 238, 0.22);
}

.app-card--featured {
  border-color: rgba(20, 184, 166, 0.2);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 6px 24px rgba(20, 184, 166, 0.12);
}

.app-card--featured:hover {
  border-color: rgba(20, 184, 166, 0.35);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 12px 40px rgba(20, 184, 166, 0.18);
}

.app-preview {
  height: 180px;
  background: linear-gradient(145deg, #d7ffee 0%, #b3f4dd 50%, #99f6e4 100%);
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
  opacity: 0.85;
  filter: grayscale(0.1);
}

.app-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.88);
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

.app-overlay .ant-btn-primary {
  background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.app-overlay .ant-btn-default {
  border-radius: 8px;
  border-color: rgba(20, 184, 166, 0.4);
  color: #0f766e;
}

.app-overlay .ant-btn-default:hover {
  border-color: #14b8a6;
  color: #0d9488;
}

.app-info {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.6);
}

.app-info-left {
  flex-shrink: 0;
}

.app-info-right {
  flex: 1;
  min-width: 0;
}

.app-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 2px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.app-author {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
