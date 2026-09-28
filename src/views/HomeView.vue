<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { topics } from '@/data/lessons'
</script>

<template>
  <main class="home">
    <h1>知识点导航</h1>
    <p class="lead">选择一个专题，进入课堂演示。</p>

    <div class="topics">
      <RouterLink
        v-for="topic in topics"
        :key="topic.to"
        class="topic"
        :to="topic.to"
        :style="{ backgroundImage: `url(${topic.cover})` }"
      >
        <span class="topic-shade" />
        <span class="topic-body">
          <h2>{{ topic.title }}</h2>
          <p>{{ topic.summary }}</p>
        </span>
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.home h1 {
  font-size: 1.75rem;
  color: var(--color-heading);
}

.lead {
  margin: 0.4rem 0 1.25rem;
}

.topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.topic {
  position: relative;
  display: flex;
  min-height: 180px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: #1e3a8a;
  background-position: center;
  background-size: cover;
  color: #fff;
}

.topic-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.28), rgba(15, 23, 42, 0.72));
}

.topic-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 1.15rem 1.2rem;
}

.topic h2 {
  font-size: 1.25rem;
  color: #fff;
}

.topic p {
  max-width: 28ch;
  color: rgba(248, 250, 252, 0.92);
  font-size: 0.95rem;
  line-height: 1.45;
}

.topic:hover {
  border-color: #1d4ed8;
}

.topic:hover .topic-shade {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.18), rgba(29, 78, 216, 0.72));
}
</style>
