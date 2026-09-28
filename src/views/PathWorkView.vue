<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import PathSwitcher from '@/components/PathSwitcher.vue'
import PathWorkCanvas from '@/components/PathWorkCanvas.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { usePathWorkStore } from '@/stores/pathWork'

const store = usePathWorkStore()
const {
  testQ,
  fieldE,
  pathId,
  progress,
  playing,
  points,
  position,
  length,
  totalWork,
  currentWork,
  voltageAB,
  comparisons,
  pathMeta,
} = storeToRefs(store)

const showAllPaths = ref(true)

let timerId = 0
let last = 0

function loop(timestamp: number) {
  if (last > 0) {
    store.tick(timestamp - last)
  }
  last = timestamp
  timerId = requestAnimationFrame(loop)
}

function setQuC(value: number) {
  testQ.value = value * 1e-6
}

function setEkVpm(value: number) {
  fieldE.value = value * 1000
}

onMounted(() => {
  timerId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(timerId)
  store.pause()
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/field-energy">静电场中的能量</RouterLink>
        ／ 电场力做功与路径无关
      </p>
      <h1>电场力做功与路径无关</h1>
      <p class="formula">
        匀强电场中 W = qU<sub>AB</sub> = qEΔx，只取决于起点 A、终点 B，与所经路径无关。
      </p>
    </header>

    <div class="layout">
      <section class="panel field">
        <div class="field-head">
          <h2>多路径对比</h2>
          <label class="toggle">
            <input v-model="showAllPaths" type="checkbox" />
            显示全部路径
          </label>
        </div>
        <PathWorkCanvas
          :path-id="pathId"
          :points="points"
          :position="position"
          :progress="progress"
          :field-e="fieldE"
          :show-all-paths="showAllPaths"
        />
        <p class="caption">当前：{{ pathMeta.label }} · 已走 {{ (progress * 100).toFixed(0) }}%</p>
      </section>

      <section class="panel controls">
        <h2>选择路径</h2>
        <PathSwitcher :model-value="pathId" @update:model-value="store.setPath" />

        <h2>过程控制</h2>
        <PlaybackControls
          :playing="playing"
          @play="store.play()"
          @pause="store.pause()"
          @reset="store.reset()"
        />

        <h2>参数</h2>
        <ControlSlider
          :model-value="testQ * 1e6"
          label="试探电荷 q"
          unit="μC"
          :min="-4"
          :max="4"
          :step="0.1"
          @update:model-value="setQuC"
        />
        <ControlSlider
          :model-value="fieldE / 1000"
          label="电场强度 E"
          unit="kV/m"
          :min="10"
          :max="100"
          :step="1"
          @update:model-value="setEkVpm"
        />

        <dl class="readout">
          <div>
            <dt>路径长度</dt>
            <dd>{{ store.formatLength(length) }}</dd>
          </div>
          <div>
            <dt>电势差 U<sub>AB</sub></dt>
            <dd>{{ (voltageAB / 1000).toFixed(1) }} kV</dd>
          </div>
          <div>
            <dt>累积做功</dt>
            <dd>{{ store.formatWork(currentWork) }}</dd>
          </div>
          <div>
            <dt>全程做功</dt>
            <dd>{{ store.formatWork(totalWork) }}</dd>
          </div>
        </dl>
      </section>

      <section class="panel compare">
        <h2>各路径对比</h2>
        <table>
          <thead>
            <tr>
              <th>路径</th>
              <th>长度</th>
              <th>做功 W</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in comparisons"
              :key="row.id"
              :class="{ active: row.active }"
            >
              <td>
                <span class="swatch" :style="{ background: row.color }" />
                {{ row.label }}
              </td>
              <td>{{ store.formatLength(row.length) }}</td>
              <td>{{ store.formatWork(row.work) }}</td>
            </tr>
          </tbody>
        </table>
        <p class="compare-note">长度不同，做功相同 → 电场力做功与路径无关。</p>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>为什么与路径无关？</h2>
        <p>
          匀强电场中 F = qE 恒定。W = ∫F·dl = qEΔx，竖直段不做功，只有水平位移贡献，故任意连接 A、B
          的路径做功都等于 qE(x<sub>B</sub>−x<sub>A</sub>)。
        </p>
      </article>
      <article>
        <h2>与电势差的关系</h2>
        <p>
          正因为做功与路径无关，才能定义电势差：W<sub>AB</sub> = qU<sub>AB</sub>。换路径重播，右侧表格中 W
          列保持不变。
        </p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>
          先选直线播放，记下做功；再换折线、圆弧、迂回路径对比长度与做功；最后改变 q 或 E，看 W
          同步变化而“各路径相等”仍成立。
        </p>
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
  grid-template-columns: minmax(0, 1.4fr) minmax(230px, 0.75fr) minmax(220px, 0.7fr);
  gap: 1rem;
  align-items: start;
}

.panel h2 {
  margin-bottom: 0.55rem;
  font-size: 1rem;
  color: var(--color-heading);
}

.field-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.55rem;
}

.field-head h2 {
  margin: 0;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  color: var(--color-text);
  cursor: pointer;
}

.caption {
  margin-top: 0.45rem;
  font-size: 0.9rem;
  color: #64748b;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.readout {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}

.readout div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.35rem;
  border-top: 1px solid var(--color-border);
}

.readout dd {
  margin: 0;
  color: var(--color-heading);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.compare table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.compare th,
.compare td {
  padding: 0.45rem 0.3rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.compare th:last-child,
.compare td:last-child,
.compare th:nth-child(2),
.compare td:nth-child(2) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.compare tr.active td {
  background: #eff6ff;
  color: #1e3a8a;
}

.swatch {
  display: inline-block;
  width: 0.55rem;
  height: 0.55rem;
  margin-right: 0.35rem;
  border-radius: 50%;
  vertical-align: middle;
}

.compare-note {
  margin-top: 0.65rem;
  font-size: 0.88rem;
  color: #1d4ed8;
}

.notes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
