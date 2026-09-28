<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Lesson } from '@/data/lessons'

defineProps<{
  crumbParent: { title: string; to: string }
  title: string
  summary: string
  lessons: Lesson[]
}>()
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink :to="crumbParent.to">{{ crumbParent.title }}</RouterLink>
        ／ {{ title }}
      </p>
      <h1>{{ title }}</h1>
      <p class="lead">{{ summary }}</p>
    </header>

    <section class="lessons">
      <RouterLink
        v-for="lesson in lessons.filter((item) => item.to && !item.comingSoon)"
        :key="lesson.to"
        class="lesson"
        :to="lesson.to!"
        :style="{ backgroundImage: `url(${lesson.cover})` }"
      >
        <span class="lesson-shade" />
        <span class="lesson-body">
          <h2>{{ lesson.title }}</h2>
          <p>{{ lesson.summary }}</p>
        </span>
      </RouterLink>

      <div
        v-for="lesson in lessons.filter((item) => item.comingSoon)"
        :key="lesson.title"
        class="lesson soon"
        :style="{ backgroundImage: `url(${lesson.cover})` }"
      >
        <span class="lesson-shade" />
        <span class="lesson-body">
          <h2>{{ lesson.title }}</h2>
          <p>{{ lesson.summary }}</p>
          <span class="badge">即将推出</span>
        </span>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.25rem;
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

.lessons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.lesson {
  position: relative;
  display: flex;
  min-height: 168px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background-color: #1e3a8a;
  background-position: center;
  background-size: cover;
  color: #fff;
}

.lesson-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.28), rgba(15, 23, 42, 0.78));
}

.lesson-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
}

.lesson h2 {
  font-size: 1.1rem;
  color: #fff;
}

.lesson p {
  color: rgba(248, 250, 252, 0.92);
  font-size: 0.9rem;
  line-height: 1.45;
}

.lesson:hover:not(.soon) {
  border-color: #1d4ed8;
}

.lesson:hover:not(.soon) .lesson-shade {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.18), rgba(29, 78, 216, 0.72));
}

.soon {
  opacity: 0.78;
  cursor: default;
}

.badge {
  display: inline-block;
  margin-top: 0.15rem;
  color: #93c5fd;
  font-size: 0.82rem;
}
</style>
