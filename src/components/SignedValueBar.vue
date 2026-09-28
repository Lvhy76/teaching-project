<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: number
  scale: number
  positiveLabel: string
  negativeLabel: string
  positiveColor?: string
  negativeColor?: string
  formatValue: (value: number) => string
  hint?: string
}>()

const ratio = computed(() => {
  if (!Number.isFinite(props.value) || props.scale <= 0) return 0
  return Math.max(-1, Math.min(1, props.value / props.scale))
})

const barStyle = computed(() => {
  const value = ratio.value
  const positive = props.positiveColor ?? '#ea580c'
  const negative = props.negativeColor ?? '#2563eb'
  if (value >= 0) {
    return {
      height: `${Math.abs(value) * 50}%`,
      bottom: '50%',
      background: positive,
    }
  }
  return {
    height: `${Math.abs(value) * 50}%`,
    top: '50%',
    background: negative,
  }
})
</script>

<template>
  <div class="chart" :aria-label="title">
    <h3>{{ title }}</h3>
    <p class="value">{{ formatValue(value) }}</p>
    <div class="axis">
      <span class="label positive">{{ positiveLabel }}</span>
      <div class="track">
        <div class="zero" />
        <div class="bar" :style="barStyle" />
      </div>
      <span class="label negative">{{ negativeLabel }}</span>
    </div>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  height: 100%;
  min-height: 280px;
}

h3 {
  font-size: 0.95rem;
  color: var(--color-heading);
  text-align: center;
}

.value {
  min-height: 1.2em;
  color: var(--color-heading);
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.axis {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.label {
  font-size: 0.78rem;
  color: #64748b;
}

.track {
  position: relative;
  width: 52px;
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
  overflow: hidden;
}

.zero {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  border-top: 1px dashed #94a3b8;
}

.bar {
  position: absolute;
  left: 9px;
  right: 9px;
  border-radius: 4px;
  transition: height 0.08s linear, background-color 0.08s linear;
}

.hint {
  font-size: 0.78rem;
  color: var(--color-text);
  text-align: center;
  line-height: 1.35;
}
</style>
