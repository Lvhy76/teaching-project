<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  summary: string
}>()
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／ {{ title }}
      </p>
      <h1>{{ title }}</h1>
      <p class="lead">{{ summary }}</p>
    </header>
    <p class="empty">该子专题的课堂模块即将扩展，请先学习「静电场」中的已有演示。</p>
    <RouterLink class="back" to="/electromagnetism">返回电磁学专题</RouterLink>
  </main>
</template>

<style scoped>
.page-header {
  margin-bottom: 1rem;
}

.crumb,
.crumb a {
  color: #1d4ed8;
  font-size: 0.9rem;
}

h1 {
  font-size: 1.75rem;
  color: var(--color-heading);
}

.lead {
  margin-top: 0.35rem;
}

.empty {
  margin-bottom: 1rem;
}

.back {
  color: #1d4ed8;
}
</style>
