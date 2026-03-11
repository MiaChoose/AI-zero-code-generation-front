<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <p class="copyright">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          class="author-link"
        >
          AI-zero-code-generation
        </a>
      </p>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
// 无需额外的响应式数据
</script>

<style scoped>
.footer {
  background: transparent;
  text-align: center;
  padding: 16px 24px 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.copyright {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.author-link {
  color: #0f766e;
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.author-link:hover {
  color: #14b8a6;
}
</style>
