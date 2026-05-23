<template>
  <a-layout-footer class="footer">
    <p class="copyright">
      <a
        href="https://github.com/MiaChoose"
        target="_blank"
        rel="noopener noreferrer"
        class="author-link"
      >
        AI-zero-code-generation © MiaChoose
      </a>
    </p>
  </a-layout-footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.footer {
  background: var(--color-surface);
  text-align: center;
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
}

.copyright {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  letter-spacing: 0.04em;
}

.author-link {
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color 0.2s;
}

.author-link:hover {
  color: var(--color-primary);
}
</style>
