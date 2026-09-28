<script setup lang="ts">
import { chargingOptions, type ChargingMode } from '@/utils/charging'

defineProps<{
  modelValue: ChargingMode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ChargingMode]
}>()
</script>

<template>
  <div class="switcher" role="radiogroup" aria-label="起电方式">
    <button
      v-for="option in chargingOptions"
      :key="option.id"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.id"
      :class="{ active: modelValue === option.id }"
      @click="emit('update:modelValue', option.id)"
    >
      <span>{{ option.label }}</span>
      <small>{{ option.hint }}</small>
    </button>
  </div>
</template>

<style scoped>
.switcher {
  display: grid;
  gap: 0.5rem;
}

button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

button.active {
  border-color: #1d4ed8;
  background: #eff6ff;
  color: #1e3a8a;
}

small {
  font-size: 0.78rem;
  opacity: 0.85;
}
</style>
