<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import AccelerationGraphCanvas from '@/components/AccelerationGraphCanvas.vue'
import AccelerationMotionCanvas from '@/components/AccelerationMotionCanvas.vue'
import ControlSlider from '@/components/ControlSlider.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { useAccelerationLessonStore } from '@/stores/accelerationLesson'
import { formatSigned } from '@/utils/accelerationLesson'

const store = useAccelerationLessonStore()
const {
  v0,
  acceleration,
  time,
  duration,
  playing,
  t1,
  t2,
  params,
  position,
  velocity,
  v1,
  v2,
  deltaV,
  deltaT,
  aAvg,
  changeLabel,
  relationText,
  willReverseSoon,
  changeKind,
} = storeToRefs(store)

let frameId = 0
let lastTimestamp = 0

function loop(timestamp: number) {
  if (lastTimestamp > 0) {
    const delta = Math.min(0.05, (timestamp - lastTimestamp) / 1000)
    store.tick(delta)
  }
  lastTimestamp = timestamp
  frameId = requestAnimationFrame(loop)
}

onMounted(() => {
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  store.pause()
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/kinematics">运动学专题</RouterLink>
        ／ 加速度
      </p>
      <h1>加速度</h1>
      <p class="formula">
        加速度描述速度变化的快慢：a = Δv / Δt。速度与加速度同向时加速，反向时减速；“加速 / 减速”看的是速率，不是速度正负本身。
      </p>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>速度与加速度方向</h2>
        <AccelerationMotionCanvas
          :params="params"
          :time="time"
          :duration="duration"
          :velocity="velocity"
          :change-label="changeLabel"
          :relation-text="relationText"
        />
        <p v-if="willReverseSoon" class="warn">速率减到 0 后，速度将反向，然后与加速度同向而重新加速。</p>
        <p v-else class="caption">观察红、橙箭头：同向还是反向，决定速率变大还是变小。</p>
      </section>

      <section class="panel controls">
        <h2>课堂预设</h2>
        <div class="presets">
          <button type="button" @click="store.applyPreset('same')">同向加速</button>
          <button type="button" @click="store.applyPreset('opposite')">反向减速</button>
          <button type="button" @click="store.applyPreset('negative-same')">负向加速</button>
          <button type="button" @click="store.applyPreset('zero')">匀速</button>
        </div>
        <h2>参数</h2>
        <ControlSlider v-model="v0" label="初速度 v₀" unit="m/s" :min="-5" :max="6" :step="0.1" />
        <ControlSlider v-model="acceleration" label="加速度 a" unit="m/s²" :min="-2.5" :max="2.5" :step="0.1" />
        <ControlSlider v-model="t1" label="时刻 t₁" unit="s" :min="0" :max="6" :step="0.1" />
        <ControlSlider v-model="t2" label="时刻 t₂" unit="s" :min="0" :max="6" :step="0.1" />
        <PlaybackControls :playing="playing" @play="store.play()" @pause="store.pause()" @reset="store.reset()" />
        <dl class="readout">
          <div>
            <dt>当前 t</dt>
            <dd>{{ time.toFixed(2) }} s</dd>
          </div>
          <div>
            <dt>当前 v</dt>
            <dd>{{ formatSigned(velocity) }} m/s</dd>
          </div>
          <div>
            <dt>当前 x</dt>
            <dd>{{ position.toFixed(2) }} m</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd :class="changeKind">{{ changeLabel }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="panel graph-panel">
      <AccelerationGraphCanvas
        :params="params"
        :time="time"
        :duration="duration"
        :t1="t1"
        :t2="t2"
        :v1="v1"
        :v2="v2"
        :a-avg="aAvg"
      />
      <p class="caption">
        橙色折线标出 Δt 内的 Δv；斜边斜率等于加速度。匀变速时，平均加速度等于瞬时加速度 a。
      </p>
    </section>

    <section class="compare">
      <article>
        <h2>速度变化量 Δv</h2>
        <p class="value">{{ formatSigned(deltaV) }} m/s</p>
        <p>
          v(t₁)={{ formatSigned(v1) }} m/s，v(t₂)={{ formatSigned(v2) }} m/s，
          Δt={{ formatSigned(deltaT, 1) }} s。
        </p>
      </article>
      <article>
        <h2>加速度 a = Δv/Δt</h2>
        <p class="value accel">{{ formatSigned(aAvg) }} m/s²</p>
        <p>当前设定 a={{ formatSigned(acceleration) }} m/s²。匀变速时二者一致。</p>
      </article>
      <article>
        <h2>方向关系</h2>
        <p class="relation">{{ relationText }}</p>
        <p>不要把“速度为负”直接当成减速；关键看 v 与 a 是否同号。</p>
      </article>
    </section>

    <section class="notes">
      <article>
        <h2>加速度的定义</h2>
        <p>加速度是速度对时间的变化率。它告诉你速度如何变，而不是物体此刻有多快。</p>
      </article>
      <article>
        <h2>同向与反向</h2>
        <p>v 与 a 同向：速率增大；反向：速率减小。速率减到零后，若 a 仍不为零，速度会反向。</p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>依次点击四个预设，观察箭头方向与 v-t 斜率；再把 t₁、t₂ 拉开，核对 Δv / Δt 是否等于 a。</p>
      </article>
    </section>
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
  grid-template-columns: minmax(0, 1.45fr) minmax(250px, 0.75fr);
  gap: 1rem;
}

.panel h2 {
  margin-bottom: 0.55rem;
  font-size: 1rem;
  color: var(--color-heading);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.presets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}

.presets button {
  padding: 0.4rem 0.5rem;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: #eff6ff;
  color: #1e3a8a;
  font: inherit;
  cursor: pointer;
}

.presets button:hover {
  background: #dbeafe;
}

.caption,
.warn {
  margin-top: 0.55rem;
  font-size: 0.92rem;
}

.warn {
  color: #c2410c;
}

.readout {
  display: grid;
  gap: 0.4rem;
  margin: 0;
}

.readout div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.3rem;
  border-top: 1px solid var(--color-border);
}

.readout dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  color: var(--color-heading);
}

.readout dd.speeding-up {
  color: #15803d;
}

.readout dd.slowing-down {
  color: #c2410c;
}

.graph-panel {
  margin-top: 1rem;
}

.compare,
.notes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.compare article,
.notes article {
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.compare h2,
.notes h2 {
  margin-bottom: 0.35rem;
  font-size: 1rem;
  color: var(--color-heading);
}

.value {
  margin: 0.2rem 0 0.45rem;
  color: #ea580c;
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
}

.value.accel {
  color: #1d4ed8;
}

.relation {
  margin-bottom: 0.35rem;
  color: var(--color-heading);
  font-weight: 650;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
