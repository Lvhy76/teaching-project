<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink class="brand" to="/">高中物理动画演示</RouterLink>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink
          to="/kinematics"
          :class="{ 'is-current': route.path.startsWith('/kinematics') }"
        >
          运动学专题
        </RouterLink>
        <RouterLink
          to="/electromagnetism"
          :class="{ 'is-current': route.path.startsWith('/electromagnetism') }"
        >
          电磁学专题
        </RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.brand {
  font-size: 1.05rem;
  font-weight: 650;
  color: var(--color-heading);
}

nav {
  display: flex;
  gap: 0.25rem;
}

nav a {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  color: var(--color-text);
}

nav a.router-link-exact-active,
nav a.is-current {
  background: #1d4ed8;
  color: #fff;
}
</style>
