<script setup lang="ts">
defineProps<{
  label: string
  unit: string
  modelValue: number
  min: number
  max: number
  step: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function onInput(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <label class="slider">
    <span class="slider-label">
      <span>{{ label }}</span>
      <strong>{{ modelValue.toFixed(1) }} {{ unit }}</strong>
    </span>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :aria-label="label"
      @input="onInput"
    />
  </label>
</template>

<style scoped>
.slider {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.95rem;
}

input[type='range'] {
  width: 100%;
  accent-color: #1d4ed8;
}
</style>
