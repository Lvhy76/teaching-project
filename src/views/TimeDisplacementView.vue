<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import PathDisplacementCanvas from '@/components/PathDisplacementCanvas.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import TimeLineCanvas from '@/components/TimeLineCanvas.vue'
import { useTimeDisplacementStore } from '@/stores/timeDisplacement'
import { formatSigned } from '@/utils/timeDisplacement'

const store = useTimeDisplacementStore()
const {
  time,
  duration,
  playing,
  t1,
  t2,
  position,
  velocity,
  x1,
  x2,
  deltaT,
  displacement,
  pathLength,
  inInterval,
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
        ／ 时间、时刻、位移
      </p>
      <h1>时间、时刻、位移</h1>
      <p class="formula">
        时刻对应时间轴上的一个点；时间间隔是两个时刻之间的一段。位移是从初位置指向末位置的有向线段，路程是实际走过的路径长度。
      </p>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>位移与路程</h2>
        <PathDisplacementCanvas
          :time="time"
          :duration="duration"
          :t1="t1"
          :t2="t2"
          :x1="x1"
          :x2="x2"
          :displacement="displacement"
          :path-length="pathLength"
          :in-interval="inInterval"
        />
        <p class="caption">
          小车先向右匀速到 8 m，再向左折返。拖动 t₁、t₂ 可改变研究的时间段。
        </p>
      </section>

      <section class="panel controls">
        <h2>选取两个时刻</h2>
        <ControlSlider v-model="t1" label="时刻 t₁" unit="s" :min="0" :max="8" :step="0.1" />
        <ControlSlider v-model="t2" label="时刻 t₂" unit="s" :min="0" :max="8" :step="0.1" />
        <PlaybackControls :playing="playing" @play="store.play()" @pause="store.pause()" @reset="store.reset()" />
        <dl class="readout">
          <div>
            <dt>当前时刻 t</dt>
            <dd>{{ time.toFixed(1) }} s</dd>
          </div>
          <div>
            <dt>当前位置 x</dt>
            <dd>{{ position.toFixed(1) }} m</dd>
          </div>
          <div>
            <dt>瞬时速度 v</dt>
            <dd>{{ formatSigned(velocity) }} m/s</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="panel">
      <h2>时刻是点，时间是段</h2>
      <TimeLineCanvas :time="time" :duration="duration" :t1="t1" :t2="t2" />
      <p class="caption">
        红色圆点表示时刻 t₁、t₂；蓝色高亮段表示时间间隔 Δt = {{ deltaT.toFixed(1) }} s。
      </p>
    </section>

    <section class="compare">
      <article>
        <h2>位移 Δx</h2>
        <p class="value">{{ formatSigned(displacement) }} m</p>
        <p>从 x(t₁)={{ x1.toFixed(1) }} m 指向 x(t₂)={{ x2.toFixed(1) }} m，有大小也有方向。</p>
      </article>
      <article>
        <h2>路程 s</h2>
        <p class="value path">{{ pathLength.toFixed(1) }} m</p>
        <p>在 Δt 内实际走过的路径长度，只有大小，没有方向。</p>
      </article>
      <article>
        <h2>课堂对照</h2>
        <p>
          当小车折返后，路程会继续增加，位移却可能变小甚至为负。完整往返时位移可为 0，路程却等于 16 m。
        </p>
      </article>
    </section>

    <section class="notes">
      <article>
        <h2>时刻与时间</h2>
        <p>时刻回答“什么时候”，对应时间轴上的点；时间（时间间隔）回答“持续多久”，对应两点之间的线段。</p>
      </article>
      <article>
        <h2>位移与路程</h2>
        <p>位移由初、末位置决定，与路径无关；路程由路径决定。直线运动且不反向时，路程等于位移的绝对值。</p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>先取 t₁=0、t₂=4，再取 t₁=0、t₂=8，比较两次位移与路程；再把 t₁、t₂ 都放在折返后半段，观察位移为负的情况。</p>
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
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.7fr);
  gap: 1rem;
}

.panel h2 {
  margin-bottom: 0.6rem;
  font-size: 1rem;
  color: var(--color-heading);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.caption {
  margin-top: 0.55rem;
  font-size: 0.92rem;
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

.readout dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  color: var(--color-heading);
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
  font-size: 1.45rem;
  font-variant-numeric: tabular-nums;
}

.value.path {
  color: #c2410c;
}

.panel + .panel {
  margin-top: 1rem;
}

@media (max-width: 800px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
