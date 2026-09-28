<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { electromagnetismTopic } from '@/data/lessons'
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">电磁学专题</p>
      <h1>{{ electromagnetismTopic.title }}</h1>
      <p class="lead">{{ electromagnetismTopic.summary }}</p>
    </header>

    <section class="subtopics">
      <RouterLink
        v-for="subtopic in electromagnetismTopic.subtopics"
        :key="subtopic.to"
        class="subtopic"
        :to="subtopic.to"
        :style="{ backgroundImage: `url(${subtopic.cover})` }"
      >
        <span class="subtopic-shade" />
        <span class="subtopic-body">
          <h2>{{ subtopic.title }}</h2>
          <p>{{ subtopic.summary }}</p>
          <span class="meta">
            {{ subtopic.lessons.length > 0 ? `${subtopic.lessons.length} 个模块` : '即将扩展' }}
          </span>
        </span>
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.25rem;
}

.crumb {
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

.subtopics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.subtopic {
  position: relative;
  display: flex;
  min-height: 180px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background-color: #1e3a8a;
  background-position: center;
  background-size: cover;
  color: #fff;
}

.subtopic-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.28), rgba(15, 23, 42, 0.78));
}

.subtopic-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
}

.subtopic h2 {
  font-size: 1.1rem;
  color: #fff;
}

.subtopic p {
  color: rgba(248, 250, 252, 0.92);
  font-size: 0.9rem;
  line-height: 1.45;
}

.meta {
  margin-top: 0.15rem;
  color: #93c5fd;
  font-size: 0.85rem;
}

.subtopic:hover {
  border-color: #1d4ed8;
}

.subtopic:hover .subtopic-shade {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.18), rgba(29, 78, 216, 0.72));
}
</style>
