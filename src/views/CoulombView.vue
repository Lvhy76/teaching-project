<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import CoulombCanvas from '@/components/CoulombCanvas.vue'
import { useCoulombStore } from '@/stores/coulomb'

const store = useCoulombStore()
const { q1UC, q2UC, distance, force, directionLabel, x1, x2 } = storeToRefs(store)
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/electrostatics">静电场</RouterLink>
        ／ 库仑定律
      </p>
      <h1>库仑定律</h1>
      <p class="formula">
        真空中两点电荷间的作用力：F = k|Q₁Q₂|/r²，方向沿连线；同号相斥，异号相吸。调节 Q₁、Q₂、r，实时计算 F。
      </p>
    </header>

    <div class="layout">
      <section class="panel field">
        <h2>两点电荷受力</h2>
        <CoulombCanvas
          :x1="x1"
          :x2="x2"
          :q1-u-c="q1UC"
          :q2-u-c="q2UC"
          :force-magnitude="force.magnitude"
          :repulsive="force.repulsive"
          :valid="force.valid"
        />
        <p class="caption">
          橙色箭头表示排斥，绿色箭头表示吸引；F₁₂ 与 F₂₁ 大小相等、方向相反（牛顿第三定律）。
        </p>
      </section>

      <section class="panel controls">
        <h2>参数</h2>
        <ControlSlider
          :model-value="q1UC"
          label="电荷量 Q₁"
          unit="μC"
          :min="-8"
          :max="8"
          :step="0.5"
          @update:model-value="store.setQ1UC"
        />
        <ControlSlider
          :model-value="q2UC"
          label="电荷量 Q₂"
          unit="μC"
          :min="-8"
          :max="8"
          :step="0.5"
          @update:model-value="store.setQ2UC"
        />
        <ControlSlider
          :model-value="distance * 100"
          label="距离 r"
          unit="cm"
          :min="4"
          :max="40"
          :step="1"
          @update:model-value="store.setDistanceCm"
        />
        <button type="button" class="reset" @click="store.reset()">重置</button>

        <dl class="readout">
          <div>
            <dt>Q₁</dt>
            <dd>{{ store.formatChargeUC(q1UC) }}</dd>
          </div>
          <div>
            <dt>Q₂</dt>
            <dd>{{ store.formatChargeUC(q2UC) }}</dd>
          </div>
          <div>
            <dt>r</dt>
            <dd>{{ store.formatDistance(distance) }}</dd>
          </div>
          <div>
            <dt>F 大小</dt>
            <dd>{{ store.formatForce(force.magnitude) }}</dd>
          </div>
          <div>
            <dt>方向</dt>
            <dd>{{ directionLabel }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>大小</h2>
        <p>
          F = k|Q₁Q₂|/r²。电荷量乘积越大、距离越小，静电力越大。k = 9×10⁹ N·m²/C²（真空中）。
        </p>
      </article>
      <article>
        <h2>方向</h2>
        <p>
          力沿两电荷连线：同号电荷相互排斥，异号电荷相互吸引。作用力与反作用力等大反向。
        </p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>
          先保持同号，减小 r 看 F 迅速变大；再把其中一个改为负电荷，观察箭头变为吸引；最后只改一个
          Q，体会 F 与电荷量成正比。
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

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
