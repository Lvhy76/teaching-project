<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import PotentialFieldCanvas from '@/components/PotentialFieldCanvas.vue'
import SignedValueBar from '@/components/SignedValueBar.vue'
import { useElectricPotentialStore } from '@/stores/electricPotential'

const store = useElectricPotentialStore()
const { sourceQ, testQ, source, test, r, phi, energy } = storeToRefs(store)

function setSourceQuC(value: number) {
  sourceQ.value = value * 1e-6
}

function setTestQuC(value: number) {
  testQ.value = value * 1e-6
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/field-energy">静电场中的能量</RouterLink>
        ／ 电势能与电势
      </p>
      <h1>电势能与电势</h1>
      <p class="formula">
        取无穷远处为零：φ = kQ/r，Ep = qφ = kQq/r。拖动试探电荷或调节电荷量，观察 φ 与 Ep。
      </p>
    </header>

    <div class="layout">
      <section class="panel field">
        <h2>电场中的试探电荷</h2>
        <PotentialFieldCanvas
          :source="source"
          :test="test"
          :phi="phi"
          :energy="energy"
          @move="(x, y) => store.setTestPosition(x, y)"
        />
      </section>

      <section class="panel bars">
        <SignedValueBar
          title="电势 φ"
          :value="phi"
          :scale="store.phiScale"
          positive-label="φ > 0"
          negative-label="φ < 0"
          positive-color="#dc2626"
          negative-color="#2563eb"
          :format-value="store.formatPhi"
          hint="只由源电荷与位置决定"
        />
        <SignedValueBar
          title="电势能 Ep"
          :value="energy"
          :scale="store.energyScale"
          positive-label="Ep > 0"
          negative-label="Ep < 0"
          positive-color="#ea580c"
          negative-color="#0ea5e9"
          :format-value="store.formatEnergy"
          hint="还与试探电荷 q 有关"
        />
      </section>

      <section class="panel controls">
        <h2>电荷量</h2>
        <ControlSlider
          :model-value="sourceQ * 1e6"
          label="源电荷 Q"
          unit="μC"
          :min="-5"
          :max="5"
          :step="0.1"
          @update:model-value="setSourceQuC"
        />
        <ControlSlider
          :model-value="testQ * 1e6"
          label="试探电荷 q"
          unit="μC"
          :min="-2"
          :max="2"
          :step="0.1"
          @update:model-value="setTestQuC"
        />
        <button type="button" class="reset" @click="store.reset()">重置位置与电荷</button>

        <dl class="readout">
          <div>
            <dt>距离 r</dt>
            <dd>{{ (r * 100).toFixed(1) }} cm</dd>
          </div>
          <div>
            <dt>电势 φ</dt>
            <dd>{{ store.formatPhi(phi) }}</dd>
          </div>
          <div>
            <dt>电势能 Ep</dt>
            <dd>{{ store.formatEnergy(energy) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>电势 φ</h2>
        <p>描述电场本身在某点的性质，与试探电荷无关。正源电荷周围 φ &gt; 0，且离电荷越近电势越高。</p>
      </article>
      <article>
        <h2>电势能 Ep</h2>
        <p>Ep = qφ，同时取决于电场与试探电荷。同号相斥时 Ep 为正；异号相吸时 Ep 为负。</p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>先调大 Q，看 φ 与 Ep 条同时升高；再只调 q，φ 条几乎不动而 Ep 条改变；最后把 q 调成负值对比符号。</p>
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
  grid-template-columns: minmax(0, 1.35fr) minmax(200px, 0.55fr) minmax(230px, 0.7fr);
  gap: 1rem;
  align-items: stretch;
}

.panel h2 {
  margin-bottom: 0.55rem;
  font-size: 1rem;
  color: var(--color-heading);
}

.bars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reset {
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

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .bars {
    min-height: 240px;
  }
}
</style>
