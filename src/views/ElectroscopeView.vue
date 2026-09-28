<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import ElectroscopeCanvas from '@/components/ElectroscopeCanvas.vue'
import { useElectroscopeStore } from '@/stores/electroscope'

const store = useElectroscopeStore()
const {
  chargeUC,
  displayHalfDeg,
  halfDeg,
  fullDeg,
  charged,
  positive,
} = storeToRefs(store)

let frameId = 0
let last = 0

function loop(timestamp: number) {
  if (last > 0) {
    const dt = Math.min(0.05, (timestamp - last) / 1000)
    store.tick(dt)
  }
  last = timestamp
  frameId = requestAnimationFrame(loop)
}

onMounted(() => {
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/electrostatics">静电场</RouterLink>
        ／ 验电器
      </p>
      <h1>验电器</h1>
      <p class="formula">
        金属箔带上同种电荷后相互排斥而张开；电荷量越大，张角越大。调节电荷量，观察箔片张角实时变化。
      </p>
    </header>

    <div class="layout">
      <section class="panel field">
        <h2>箔片张角</h2>
        <ElectroscopeCanvas
          :half-angle-deg="displayHalfDeg"
          :charge-u-c="chargeUC"
          :charged="charged"
          :positive="positive"
        />
        <p class="caption">
          竖直方向为 θ=0；图中标出的是两箔片夹角 2θ。正、负电荷都会使箔片张开（斥力与电性无关，只与同号有关）。
        </p>
      </section>

      <section class="panel controls">
        <h2>电荷量</h2>
        <ControlSlider
          :model-value="chargeUC"
          label="带电量 Q"
          unit="μC"
          :min="-10"
          :max="10"
          :step="0.5"
          @update:model-value="store.setChargeUC"
        />
        <button type="button" class="reset" @click="store.reset()">重置</button>
        <button type="button" class="action" @click="store.setChargeUC(0)">放电（Q→0）</button>

        <dl class="readout">
          <div>
            <dt>带电量</dt>
            <dd>{{ store.formatChargeUC(chargeUC) }}</dd>
          </div>
          <div>
            <dt>电性</dt>
            <dd>
              {{ !charged ? '不带电' : positive ? '正电' : '负电' }}
            </dd>
          </div>
          <div>
            <dt>半张角 θ</dt>
            <dd>{{ store.formatAngle(halfDeg) }}</dd>
          </div>
          <div>
            <dt>全张角 2θ</dt>
            <dd>{{ store.formatAngle(fullDeg) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>工作原理</h2>
        <p>
          验电器金属球、金属杆与箔片连成导体。带电体接触金属球后，电荷传到两片箔上；同号电荷相斥，箔片张开。
        </p>
      </article>
      <article>
        <h2>张角与电荷量</h2>
        <p>
          |Q| 越大，斥力越大，张角越大；放电后电荷导走，箔片重新下垂合拢。正电、负电都能使箔片张开，张角只反映电荷多少的大致程度。
        </p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>
          先把 Q 从 0 慢慢调大，看张角增大；再改成负值对比符号；最后点“放电”，观察箔片合拢。
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
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.75fr);
  gap: 1rem;
  align-items: start;
}

.panel h2 {
  margin-bottom: 0.55rem;
  font-size: 1rem;
  color: var(--color-heading);
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

.reset,
.action {
  padding: 0.45rem 0.7rem;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: transparent;
  color: #1d4ed8;
  font: inherit;
  cursor: pointer;
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

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
