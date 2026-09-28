<script setup lang="ts">
import { pathOptions, type PathId } from '@/utils/pathWork'

defineProps<{
  modelValue: PathId
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PathId]
}>()
</script>

<template>
  <div class="switcher" role="radiogroup" aria-label="路径选择">
    <button
      v-for="option in pathOptions"
      :key="option.id"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.id"
      :class="{ active: modelValue === option.id }"
      :style="{ '--accent': option.color }"
      @click="emit('update:modelValue', option.id)"
    >
      <span class="dot" />
      <span class="text">
        <span>{{ option.label }}</span>
        <small>{{ option.hint }}</small>
      </span>
    </button>
  </div>
</template>

<style scoped>
.switcher {
  display: grid;
  gap: 0.45rem;
}

button {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

button.active {
  border-color: var(--accent, #1d4ed8);
  background: color-mix(in srgb, var(--accent, #1d4ed8) 12%, white);
}

.dot {
  flex: 0 0 auto;
  width: 0.65rem;
  height: 0.65rem;
  margin-top: 0.35rem;
  border-radius: 50%;
  background: var(--accent, #1d4ed8);
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

small {
  font-size: 0.78rem;
  opacity: 0.85;
}
</style>
