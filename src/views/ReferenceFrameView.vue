<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import FrameSwitcher from '@/components/FrameSwitcher.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import ReferenceFrameCanvas from '@/components/ReferenceFrameCanvas.vue'
import { useReferenceFrameStore } from '@/stores/referenceFrame'

const store = useReferenceFrameStore()
const {
  frame,
  vCar,
  vWalk,
  vPlane,
  time,
  duration,
  playing,
  showParticle,
  vPerson,
  vCarRel,
  vPlaneRel,
  vGroundRel,
  vPersonGround,
  personDisplacement,
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

function formatVelocity(value: number): string {
  const rounded = Math.abs(value) < 0.05 ? 0 : value
  return `${rounded.toFixed(1)} m/s`
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/kinematics">运动学专题</RouterLink>
        ／ 质点与参考系
      </p>
      <h1>质点与参考系</h1>
      <p class="formula">
        研究运动时，可把物体看成质点；描述它的位置和速度，必须先选定参考系。相对速度：v<sub>人地</sub> = v<sub>人车</sub> + v<sub>车地</sub>。
      </p>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>观察同一质点</h2>
        <ReferenceFrameCanvas
          :frame="frame"
          :time="time"
          :duration="duration"
          :v-car="vCar"
          :v-walk="vWalk"
          :v-plane="vPlane"
          :v-car-rel="vCarRel"
          :v-person="vPerson"
          :v-plane-rel="vPlaneRel"
          :show-particle="showParticle"
        />
        <p class="caption">
          红点是同一个乘客质点。当前参考系中，它的位移是 {{ formatVelocity(personDisplacement).replace(' m/s', ' m') }}。
        </p>
      </section>

      <section class="panel controls">
        <h2>选择参考系</h2>
        <FrameSwitcher v-model="frame" />
        <label class="check">
          <input v-model="showParticle" type="checkbox" />
          把乘客画成质点
        </label>
        <h2>速度参数</h2>
        <ControlSlider v-model="vCar" label="汽车相对地面" unit="m/s" :min="4" :max="12" :step="1" />
        <ControlSlider v-model="vWalk" label="乘客相对汽车" unit="m/s" :min="-1.2" :max="1.5" :step="0.1" />
        <ControlSlider v-model="vPlane" label="飞机相对地面" unit="m/s" :min="16" :max="32" :step="1" />
        <PlaybackControls :playing="playing" @play="store.play()" @pause="store.pause()" @reset="store.reset()" />
      </section>
    </div>

    <section class="panel table-panel">
      <h2>当前参考系中的速度</h2>
      <p class="hint">切换参考系后，同一时刻各物体的速度都会改变，但乘客相对地面的速度始终满足合成关系。</p>
      <table>
        <thead>
          <tr>
            <th>物体</th>
            <th>相对当前参考系</th>
            <th>相对地面</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>乘客（质点）</td>
            <td>{{ formatVelocity(vPerson) }}</td>
            <td>{{ formatVelocity(vPersonGround) }}</td>
          </tr>
          <tr>
            <td>汽车</td>
            <td>{{ formatVelocity(vCarRel) }}</td>
            <td>{{ formatVelocity(vCar) }}</td>
          </tr>
          <tr>
            <td>飞机</td>
            <td>{{ formatVelocity(vPlaneRel) }}</td>
            <td>{{ formatVelocity(vPlane) }}</td>
          </tr>
          <tr>
            <td>地面 / 树木</td>
            <td>{{ formatVelocity(vGroundRel) }}</td>
            <td>0.0 m/s</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="notes">
      <article>
        <h2>什么是质点</h2>
        <p>当物体的大小和形状对所研究的问题影响可以忽略时，可把它看成有质量的点。这里把车厢里走动的乘客看成质点，只关心它的位置和速度。</p>
      </article>
      <article>
        <h2>运动是相对的</h2>
        <p>选地面时，汽车向前开，树木静止；选汽车时，车厢静止，树木向后掠过。物体是否运动，取决于参考系，没有绝对的“动”或“静”。</p>
      </article>
      <article>
        <h2>课堂追问</h2>
        <p>坐在匀速飞机里竖直向上抛小球，球会落回手里吗？先在飞机参考系想，再换到地面参考系核对：水平方向小球与飞机速度相同。</p>
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

.caption {
  margin-top: 0.55rem;
  font-size: 0.92rem;
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

.check {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.95rem;
}

.table-panel {
  margin-top: 1rem;
}

.hint {
  margin-bottom: 0.7rem;
  font-size: 0.92rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 0.45rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

th {
  color: var(--color-heading);
  font-weight: 650;
}

.notes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.notes article {
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.notes h2 {
  margin-bottom: 0.35rem;
  font-size: 1rem;
  color: var(--color-heading);
}

@media (max-width: 800px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
