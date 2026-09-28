<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import VelocityGraphCanvas from '@/components/VelocityGraphCanvas.vue'
import VelocityMotionCanvas from '@/components/VelocityMotionCanvas.vue'
import { useVelocityLessonStore } from '@/stores/velocityLesson'
import { formatSigned } from '@/utils/velocityLesson'

const store = useVelocityLessonStore()
const {
  v0,
  acceleration,
  time,
  duration,
  playing,
  t1,
  t2,
  t0,
  params,
  position,
  velocity,
  x1,
  x2,
  deltaX,
  deltaT,
  vAvg,
  vInst,
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
        ／ 速度与图像
      </p>
      <h1>速度与图像</h1>
      <p class="formula">
        平均速度 v̄ = Δx / Δt，对应 x-t 图像割线斜率；瞬时速度 v = lim<sub>Δt→0</sub> Δx/Δt，对应 x-t 切线斜率，也等于 v-t 图像在该时刻的纵坐标。
      </p>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>运动过程</h2>
        <VelocityMotionCanvas
          :params="params"
          :time="time"
          :duration="duration"
          :velocity="velocity"
        />
        <p class="caption">匀变速直线运动。红箭头表示瞬时速度方向与大小。</p>
      </section>

      <section class="panel controls">
        <h2>运动参数</h2>
        <ControlSlider v-model="v0" label="初速度 v₀" unit="m/s" :min="-2" :max="6" :step="0.1" />
        <ControlSlider v-model="acceleration" label="加速度 a" unit="m/s²" :min="-1" :max="2.5" :step="0.1" />
        <h2>时间选取</h2>
        <ControlSlider v-model="t1" label="时刻 t₁（平均速度）" unit="s" :min="0" :max="6" :step="0.1" />
        <ControlSlider v-model="t2" label="时刻 t₂（平均速度）" unit="s" :min="0" :max="6" :step="0.1" />
        <ControlSlider v-model="t0" label="时刻 t₀（瞬时速度）" unit="s" :min="0" :max="6" :step="0.1" />
        <PlaybackControls :playing="playing" @play="store.play()" @pause="store.pause()" @reset="store.reset()" />
        <dl class="readout">
          <div>
            <dt>当前 t</dt>
            <dd>{{ time.toFixed(2) }} s</dd>
          </div>
          <div>
            <dt>当前 x</dt>
            <dd>{{ position.toFixed(2) }} m</dd>
          </div>
          <div>
            <dt>当前 v</dt>
            <dd>{{ formatSigned(velocity) }} m/s</dd>
          </div>
        </dl>
      </section>
    </div>

    <div class="graphs">
      <VelocityGraphCanvas
        kind="xt"
        title="x-t 图像：割线与切线"
        :params="params"
        :time="time"
        :duration="duration"
        :t1="t1"
        :t2="t2"
        :t0="t0"
        :v-avg="vAvg"
        :v-inst="vInst"
      />
      <VelocityGraphCanvas
        kind="vt"
        title="v-t 图像：平均值与瞬时值"
        :params="params"
        :time="time"
        :duration="duration"
        :t1="t1"
        :t2="t2"
        :t0="t0"
        :v-avg="vAvg"
        :v-inst="vInst"
      />
    </div>

    <section class="compare">
      <article>
        <h2>平均速度 v̄</h2>
        <p class="value">{{ formatSigned(vAvg) }} m/s</p>
        <p>
          Δx = {{ formatSigned(deltaX) }} m，Δt = {{ formatSigned(deltaT, 1) }} s。
          从 (t₁, x₁)=({{ t1.toFixed(1) }}, {{ x1.toFixed(2) }}) 到 (t₂, x₂)=({{ t2.toFixed(1) }}, {{ x2.toFixed(2) }})。
        </p>
      </article>
      <article>
        <h2>瞬时速度 v(t₀)</h2>
        <p class="value inst">{{ formatSigned(vInst) }} m/s</p>
        <p>t₀ = {{ t0.toFixed(1) }} s 处，x-t 切线斜率等于 v-t 图上该点的速度值。</p>
      </article>
      <article>
        <h2>图像对照</h2>
        <p>
          把 t₁、t₂ 逐渐靠近 t₀，看割线是否逼近切线、v̄ 是否逼近 v(t₀)。匀变速时，v̄ 恰好等于这段时间内初、末瞬时速度的平均值。
        </p>
      </article>
    </section>

    <section class="notes">
      <article>
        <h2>平均速度</h2>
        <p>描述一段时间内位移变化的快慢，由初、末位置和时间间隔决定，不关心中间细节。</p>
      </article>
      <article>
        <h2>瞬时速度</h2>
        <p>描述某一时刻运动的快慢和方向。时间间隔取得足够短时，平均速度趋近于瞬时速度。</p>
      </article>
      <article>
        <h2>斜率的含义</h2>
        <p>x-t 图像的斜率表示速度；v-t 图像的斜率表示加速度。本课先抓住“斜率 ↔ 速度”这一对应。</p>
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
  grid-template-columns: minmax(0, 1.4fr) minmax(250px, 0.75fr);
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

.controls h2 + h2,
.controls .slider + h2 {
  margin-top: 0.35rem;
}

.caption {
  margin-top: 0.55rem;
  font-size: 0.92rem;
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

.graphs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  color: #1d4ed8;
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
}

.value.inst {
  color: #dc2626;
}

@media (max-width: 900px) {
  .layout,
  .graphs {
    grid-template-columns: 1fr;
  }
}
</style>
