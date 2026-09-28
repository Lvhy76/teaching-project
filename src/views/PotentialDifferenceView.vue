<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import EquipotentialCanvas from '@/components/EquipotentialCanvas.vue'
import SignedValueBar from '@/components/SignedValueBar.vue'
import { usePotentialDifferenceStore } from '@/stores/potentialDifference'
import { fieldModeOptions, type ProbeId } from '@/utils/potentialDifference'

const store = usePotentialDifferenceStore()
const {
  fieldMode,
  sourceQ,
  fieldE,
  testQ,
  pointA,
  pointB,
  activeProbe,
  source,
  phiA,
  phiB,
  uAB,
  workAB,
  deltaEp,
  rA,
  rB,
  sameEquipotential,
  voltageScale,
  workScale,
} = storeToRefs(store)

function setSourceQuC(value: number) {
  sourceQ.value = value * 1e-6
}

function setTestQuC(value: number) {
  testQ.value = value * 1e-6
}

function setEkVpm(value: number) {
  fieldE.value = value * 1000
}

function selectProbe(id: ProbeId) {
  store.setActiveProbe(id)
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/field-energy">静电场中的能量</RouterLink>
        ／ 电势差、等势面与做功
      </p>
      <h1>电势差、等势面、电势差与电场力做功</h1>
      <p class="formula">
        U<sub>AB</sub> = φ<sub>A</sub> − φ<sub>B</sub>，W<sub>AB</sub> = qU<sub>AB</sub> = −ΔE<sub>p</sub>。可切换点电荷 / 匀强电场，拖动
        A、B 观察等势面与做功。
      </p>
    </header>

    <div class="layout">
      <section class="panel field">
        <h2>等势面与 A、B 两点</h2>
        <EquipotentialCanvas
          :field-mode="fieldMode"
          :source="source"
          :field-e="fieldE"
          :point-a="pointA"
          :point-b="pointB"
          :active-probe="activeProbe"
          :phi-a="phiA"
          :phi-b="phiB"
          @move="(x, y) => store.moveActiveTo(x, y)"
          @select-probe="selectProbe"
        />
        <p class="caption">
          <template v-if="fieldMode === 'point'">
            红圈过 A、绿圈过 B；点电荷等势面是同心球面（图中为圆）。
          </template>
          <template v-else>
            红线过 A、绿线过 B；匀强电场等势面是与电场垂直的平面（图中为竖直线）。
          </template>
          <span v-if="sameEquipotential" class="same">当前 A、B 近似在同一等势面上，U≈0。</span>
        </p>
      </section>

      <section class="panel bars">
        <SignedValueBar
          title="电势差 U_AB"
          :value="uAB"
          :scale="voltageScale"
          positive-label="U > 0"
          negative-label="U < 0"
          positive-color="#7c3aed"
          negative-color="#0891b2"
          :format-value="store.formatVoltage"
          hint="φ_A − φ_B"
        />
        <SignedValueBar
          title="电场力做功 W"
          :value="workAB"
          :scale="workScale"
          positive-label="W > 0"
          negative-label="W < 0"
          positive-color="#ea580c"
          negative-color="#2563eb"
          :format-value="store.formatEnergy"
          hint="W = qU_AB"
        />
      </section>

      <section class="panel controls">
        <h2>电场类型</h2>
        <div class="mode-switch" role="radiogroup" aria-label="电场类型">
          <button
            v-for="option in fieldModeOptions"
            :key="option.id"
            type="button"
            role="radio"
            :aria-checked="fieldMode === option.id"
            :class="{ active: fieldMode === option.id }"
            @click="store.setFieldMode(option.id)"
          >
            <span>{{ option.label }}</span>
            <small>{{ option.hint }}</small>
          </button>
        </div>

        <h2>活动点</h2>
        <div class="probe-switch" role="radiogroup" aria-label="活动探测点">
          <button
            type="button"
            role="radio"
            :aria-checked="activeProbe === 'A'"
            :class="{ active: activeProbe === 'A' }"
            @click="selectProbe('A')"
          >
            拖动 A
          </button>
          <button
            type="button"
            role="radio"
            :aria-checked="activeProbe === 'B'"
            :class="{ active: activeProbe === 'B' }"
            @click="selectProbe('B')"
          >
            拖动 B
          </button>
        </div>
        <button type="button" class="action" @click="store.snapActiveToOtherEquipotential()">
          把{{ activeProbe }}放到另一点的等势面上
        </button>

        <h2>参数</h2>
        <ControlSlider
          v-if="fieldMode === 'point'"
          :model-value="sourceQ * 1e6"
          label="源电荷 Q"
          unit="μC"
          :min="-5"
          :max="5"
          :step="0.1"
          @update:model-value="setSourceQuC"
        />
        <ControlSlider
          v-else
          :model-value="fieldE / 1000"
          label="电场强度 E"
          unit="kV/m"
          :min="10"
          :max="100"
          :step="1"
          @update:model-value="setEkVpm"
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
        <button type="button" class="reset" @click="store.reset()">重置</button>

        <dl class="readout">
          <div>
            <dt v-if="fieldMode === 'point'">φ<sub>A</sub>（r={{ (rA * 100).toFixed(1) }} cm）</dt>
            <dt v-else>φ<sub>A</sub>（x={{ (pointA.x * 100).toFixed(1) }} cm）</dt>
            <dd>{{ store.formatPhi(phiA) }}</dd>
          </div>
          <div>
            <dt v-if="fieldMode === 'point'">φ<sub>B</sub>（r={{ (rB * 100).toFixed(1) }} cm）</dt>
            <dt v-else>φ<sub>B</sub>（x={{ (pointB.x * 100).toFixed(1) }} cm）</dt>
            <dd>{{ store.formatPhi(phiB) }}</dd>
          </div>
          <div>
            <dt>U<sub>AB</sub> = φ<sub>A</sub>−φ<sub>B</sub></dt>
            <dd>{{ store.formatVoltage(uAB) }}</dd>
          </div>
          <div>
            <dt>W<sub>AB</sub> = qU<sub>AB</sub></dt>
            <dd>{{ store.formatEnergy(workAB) }}</dd>
          </div>
          <div>
            <dt>ΔE<sub>p</sub> = E<sub>pB</sub>−E<sub>pA</sub></dt>
            <dd>{{ store.formatEnergy(deltaEp) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>电势差</h2>
        <p>
          两点间电势差 U<sub>AB</sub> = φ<sub>A</sub> − φ<sub>B</sub>，描述电场本身从 A 到 B
          的电势降落，与试探电荷无关。
        </p>
      </article>
      <article>
        <h2>等势面</h2>
        <p>
          点电荷：等势面为同心球面（图中圆）；匀强电场：等势面为垂直于电场的平面（图中竖直线）。沿等势面移动时
          U=0，电场力不做功。
        </p>
      </article>
      <article>
        <h2>做功关系</h2>
        <p>
          W<sub>AB</sub> = qU<sub>AB</sub> = −ΔE<sub>p</sub>。匀强场中也可写成 W = qEΔx。正电荷从高电势到低电势时电场力做正功。
        </p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>
          先在点电荷场拖动 A、B；再切换到匀强电场对比等势面形状；两种模式下都试“放到同一等势面”，确认 U、W
          接近零。
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
  grid-template-columns: minmax(0, 1.35fr) minmax(200px, 0.55fr) minmax(240px, 0.75fr);
  gap: 1rem;
  align-items: stretch;
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

.same {
  color: #16a34a;
  font-weight: 600;
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

.mode-switch {
  display: grid;
  gap: 0.45rem;
}

.mode-switch button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.mode-switch button.active {
  border-color: #1d4ed8;
  background: #eff6ff;
  color: #1e3a8a;
}

.mode-switch small {
  font-size: 0.78rem;
  opacity: 0.85;
}

.probe-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}

.probe-switch button,
.action,
.reset {
  padding: 0.45rem 0.7rem;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: transparent;
  color: #1d4ed8;
  font: inherit;
  cursor: pointer;
}

.probe-switch button.active {
  background: #1d4ed8;
  color: #fff;
}

.action {
  text-align: left;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
