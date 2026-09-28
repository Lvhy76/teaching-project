<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import ForceSuperpositionCanvas from '@/components/ForceSuperpositionCanvas.vue'
import { useForceSuperpositionStore } from '@/stores/forceSuperposition'

const store = useForceSuperpositionStore()
const { sourceCount, sources, test, activeId, components, net } = storeToRefs(store)

function onMove(id: string, x: number, y: number) {
  store.moveCharge(id === 'test' ? 'test' : id, x, y)
}

function onSelect(id: string) {
  store.setActive(id === 'test' ? 'test' : id)
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/electrostatics">静电场</RouterLink>
        ／ 静电力叠加
      </p>
      <h1>静电力叠加</h1>
      <p class="formula">
        试探电荷 q 所受合力 F合 = Σ Fi，各 Fi 按库仑定律计算后做矢量合成。拖动电荷位置，观察分力与合力。
      </p>
    </header>

    <div class="layout">
      <section class="panel field">
        <h2>矢量合成</h2>
        <ForceSuperpositionCanvas
          :test="test"
          :sources="sources"
          :components="components"
          :net-fx="net.fx"
          :net-fy="net.fy"
          :net-magnitude="net.magnitude"
          :active-id="activeId"
          @move="onMove"
          @select="onSelect"
        />
        <p class="caption">
          试探电荷 q 默认在圆心；源电荷排布在圆周上。黑色粗箭头为合力，彩色细箭头为分力。
        </p>
      </section>

      <section class="panel controls">
        <h2>源电荷个数</h2>
        <div class="count-switch" role="radiogroup" aria-label="源电荷个数">
          <button
            type="button"
            role="radio"
            :aria-checked="sourceCount === 2"
            :class="{ active: sourceCount === 2 }"
            @click="store.setSourceCount(2)"
          >
            2 个
          </button>
          <button
            type="button"
            role="radio"
            :aria-checked="sourceCount === 3"
            :class="{ active: sourceCount === 3 }"
            @click="store.setSourceCount(3)"
          >
            3 个
          </button>
        </div>

        <h2>电荷量</h2>
        <ControlSlider
          :model-value="test.q * 1e6"
          label="试探电荷 q"
          unit="μC"
          :min="-4"
          :max="4"
          :step="0.5"
          @update:model-value="store.setTestQuC"
        />
        <ControlSlider
          v-for="source in sources"
          :key="source.id"
          :model-value="source.q * 1e6"
          :label="`${source.label}`"
          unit="μC"
          :min="-6"
          :max="6"
          :step="0.5"
          @update:model-value="(v) => store.setSourceQuC(source.id, v)"
        />
        <button type="button" class="reset" @click="store.reset()">重置</button>

        <dl class="readout">
          <div v-for="f in components" :key="f.fromId">
            <dt :style="{ color: f.color }">{{ f.label }}（来自 {{ f.fromId }}）</dt>
            <dd>{{ store.formatForce(f.magnitude) }}</dd>
          </div>
          <div class="net">
            <dt>|F合|</dt>
            <dd>{{ store.formatForce(net.magnitude) }}</dd>
          </div>
          <div>
            <dt>F合 方向（相对 +x）</dt>
            <dd>{{ store.formatForceAngle(net.fx, net.fy) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>叠加原理</h2>
        <p>
          多个点电荷同时存在时，试探电荷所受静电力等于各点电荷单独作用时的力的矢量和：F合 = F₁ + F₂ + …
        </p>
      </article>
      <article>
        <h2>矢量合成</h2>
        <p>
          先算每个分力的大小与方向，再按平行四边形（或正交分解）合成。分力很大时合力不一定最大，关键夹角。
        </p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>
          先用 2 个同号源电荷对称放置，看分力与合力；再改一个为负电荷；最后加到 3 个并拖动位置，观察 F合
          如何变化。
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
  grid-template-columns: minmax(0, 1.5fr) minmax(250px, 0.8fr);
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

.count-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}

.count-switch button,
.reset {
  padding: 0.45rem 0.7rem;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: transparent;
  color: #1d4ed8;
  font: inherit;
  cursor: pointer;
}

.count-switch button.active {
  background: #1d4ed8;
  color: #fff;
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

.readout .net dt,
.readout .net dd {
  font-weight: 700;
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
