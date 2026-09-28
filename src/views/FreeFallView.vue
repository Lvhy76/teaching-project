<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import FreeFallCanvas from '@/components/FreeFallCanvas.vue'
import FreeFallGraph from '@/components/FreeFallGraph.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { useFreeFallStore } from '@/stores/freeFall'

const store = useFreeFallStore()
const {
  height,
  g,
  v0,
  time,
  duration,
  playing,
  showTwin,
  fallen,
  altitude,
  velocity,
  landed,
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
        ／ 自由落体运动
      </p>
      <h1>自由落体运动</h1>
      <p class="formula">
        物体只在重力作用下由静止开始下落，就是自由落体。它是加速度为 g 的匀变速直线运动：
        v = gt，h<sub>下落</sub> = ½gt²。
      </p>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>下落过程</h2>
        <FreeFallCanvas
          :height="height"
          :g="g"
          :v0="v0"
          :time="time"
          :duration="duration"
          :velocity="velocity"
          :show-twin="showTwin"
          :landed="landed"
        />
        <label class="check">
          <input v-model="showTwin" type="checkbox" />
          同时释放质量不同的两球（伽利略思想实验）
        </label>
      </section>

      <section class="panel controls">
        <h2>参数</h2>
        <ControlSlider v-model="height" label="释放高度 H" unit="m" :min="5" :max="40" :step="1" />
        <ControlSlider v-model="g" label="重力加速度 g" unit="m/s²" :min="1.6" :max="9.8" :step="0.1" />
        <ControlSlider v-model="v0" label="初速度 v₀（向下为正）" unit="m/s" :min="0" :max="8" :step="0.5" />
        <PlaybackControls :playing="playing" @play="store.play()" @pause="store.pause()" @reset="store.reset()" />
        <dl class="readout">
          <div>
            <dt>下落时间</dt>
            <dd>{{ duration.toFixed(2) }} s</dd>
          </div>
          <div>
            <dt>当前 t</dt>
            <dd>{{ time.toFixed(2) }} s</dd>
          </div>
          <div>
            <dt>离地高度 h</dt>
            <dd>{{ altitude.toFixed(2) }} m</dd>
          </div>
          <div>
            <dt>已下落</dt>
            <dd>{{ fallen.toFixed(2) }} m</dd>
          </div>
          <div>
            <dt>速度 v</dt>
            <dd>{{ velocity.toFixed(2) }} m/s</dd>
          </div>
        </dl>
      </section>
    </div>

    <div class="graphs">
      <FreeFallGraph
        kind="ht"
        title="h-t 图像（离地高度）"
        :height="height"
        :g="g"
        :v0="v0"
        :time="time"
        :duration="duration"
      />
      <FreeFallGraph
        kind="vt"
        title="v-t 图像（向下为正）"
        :height="height"
        :g="g"
        :v0="v0"
        :time="time"
        :duration="duration"
      />
    </div>

    <section class="compare">
      <article>
        <h2>基本公式</h2>
        <p>v₀ = 0 时：v = gt，下落位移 y = ½gt²，落地时间 t = √(2H/g)。</p>
      </article>
      <article>
        <h2>与匀变速的关系</h2>
        <p>自由落体就是 a = g、v₀ = 0 的匀变速直线运动。v-t 图像是过原点的直线，斜率等于 g。</p>
      </article>
      <article>
        <h2>质量无关</h2>
        <p>忽略空气阻力时，下落加速度与质量无关。两球从同一高度同时释放，会同时落地。</p>
      </article>
    </section>

    <section class="notes">
      <article>
        <h2>什么是自由落体</h2>
        <p>初速度为零、只受重力作用的下落。实际中常近似忽略空气阻力，把它当作自由落体处理。</p>
      </article>
      <article>
        <h2>g 的取值</h2>
        <p>地球表面常取 g = 9.8 m/s²。把 g 调小可粗略感受“月球上落得更慢”。</p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>先取 v₀ = 0、g = 9.8，改变高度看落地时间；再打开双球对照；最后把 g 调到 1.6 对比。</p>
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

.check {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.7rem;
  font-size: 0.95rem;
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

@media (max-width: 900px) {
  .layout,
  .graphs {
    grid-template-columns: 1fr;
  }
}
</style>
