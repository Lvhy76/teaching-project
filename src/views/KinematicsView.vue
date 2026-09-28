<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import MotionCanvas from '@/components/MotionCanvas.vue'
import MotionGraph from '@/components/MotionGraph.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { useKinematicsStore } from '@/stores/kinematics'

const store = useKinematicsStore()
const { v0, acceleration, time, duration, playing, velocity, position, x0 } = storeToRefs(store)

const params = computed(() => ({
  x0: x0.value,
  v0: v0.value,
  acceleration: acceleration.value,
}))

let frameId = 0
let lastTimestamp = 0

function frame(timestamp: number) {
  if (lastTimestamp > 0) {
    const delta = Math.min(0.05, (timestamp - lastTimestamp) / 1000)
    store.tick(delta)
  }
  lastTimestamp = timestamp
  frameId = requestAnimationFrame(frame)
}

onMounted(() => {
  frameId = requestAnimationFrame(frame)
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  store.pause()
})

function formatValue(value: number): string {
  return value.toFixed(2)
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/kinematics">运动学专题</RouterLink>
        ／ 匀变速直线运动
      </p>
      <h1>匀变速直线运动</h1>
      <p class="formula">v = v₀ + at，x = x₀ + v₀t + ½at²。取 x₀ = 0。</p>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>运动动画</h2>
        <MotionCanvas
          :params="params"
          :time="time"
          :duration="duration"
          :velocity="velocity"
        />
      </section>

      <section class="panel controls">
        <h2>参数</h2>
        <ControlSlider v-model="v0" label="初速度 v₀" unit="m/s" :min="-8" :max="12" :step="0.5" />
        <ControlSlider v-model="acceleration" label="加速度 a" unit="m/s²" :min="-4" :max="4" :step="0.1" />
        <PlaybackControls :playing="playing" @play="store.play()" @pause="store.pause()" @reset="store.reset()" />
        <dl class="readout">
          <div>
            <dt>时间 t</dt>
            <dd>{{ formatValue(time) }} s</dd>
          </div>
          <div>
            <dt>速度 v</dt>
            <dd>{{ formatValue(velocity) }} m/s</dd>
          </div>
          <div>
            <dt>位移 x</dt>
            <dd>{{ formatValue(position) }} m</dd>
          </div>
        </dl>
      </section>
    </div>

    <div class="graphs">
      <MotionGraph title="x-t 图像" kind="xt" :params="params" :time="time" :duration="duration" />
      <MotionGraph title="v-t 图像" kind="vt" :params="params" :time="time" :duration="duration" />
    </div>
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

.formula {
  margin-top: 0.25rem;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.7fr);
  gap: 1rem;
}

.panel h2,
.graphs :deep(figcaption) {
  font-size: 1rem;
}

.panel h2 {
  margin-bottom: 0.6rem;
  color: var(--color-heading);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.readout {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}

.readout div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.35rem;
  border-top: 1px solid var(--color-border);
}

.readout dt {
  color: var(--color-text);
}

.readout dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  color: var(--color-heading);
}

.graphs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 800px) {
  .layout,
  .graphs {
    grid-template-columns: 1fr;
  }
}
</style>
