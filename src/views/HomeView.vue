<script setup lang="ts">
interface Lesson {
  title: string
  summary: string
  to: string
}

interface Chapter {
  title: string
  lessons: Lesson[]
}

const chapters: Chapter[] = [
  {
    title: '运动学',
    lessons: [
      {
        title: '匀变速直线运动',
        summary: '调节初速度和加速度，对照动画、v-t 图像和 x-t 图像。',
        to: '/kinematics',
      },
    ],
  },
]
</script>

<template>
  <main class="home">
    <h1>知识点导航</h1>
    <p class="lead">选择一个知识点，进入课堂演示。</p>

    <section v-for="chapter in chapters" :key="chapter.title" class="chapter">
      <h2>{{ chapter.title }}</h2>
      <div class="lessons">
        <RouterLink
          v-for="lesson in chapter.lessons"
          :key="lesson.to"
          class="lesson"
          :to="lesson.to"
        >
          <h3>{{ lesson.title }}</h3>
          <p>{{ lesson.summary }}</p>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home h1 {
  font-size: 1.75rem;
  color: var(--color-heading);
}

.lead {
  margin: 0.4rem 0 1.5rem;
}

.chapter + .chapter {
  margin-top: 1.5rem;
}

.chapter h2 {
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: var(--color-heading);
}

.lessons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.lesson {
  display: block;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.lesson h3 {
  margin-bottom: 0.35rem;
  color: var(--color-heading);
}

.lesson p {
  color: var(--color-text);
}

.lesson:hover {
  border-color: #1d4ed8;
}
</style>
