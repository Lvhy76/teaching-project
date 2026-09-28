<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ChargingCanvas from '@/components/ChargingCanvas.vue'
import ChargingModeSwitcher from '@/components/ChargingModeSwitcher.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { useChargingStore } from '@/stores/charging'

const store = useChargingStore()
const { mode, stepIndex, playing, step, steps, isFirst, isLast } = storeToRefs(store)

let timerId = 0
let last = 0

function loop(timestamp: number) {
  if (last > 0) {
    store.tickAuto(timestamp - last)
  }
  last = timestamp
  timerId = requestAnimationFrame(loop)
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
        <RouterLink to="/electromagnetism/electrostatics">静电场</RouterLink>
        ／ 电荷、起电方式
      </p>
      <h1>电荷、起电方式</h1>
      <p class="formula">
        电荷守恒：摩擦、接触、感应过程中，电荷只能转移或重新分布，不能凭空产生或消失。
      </p>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>电荷分布</h2>
        <ChargingCanvas :mode="mode" :step="step" :step-index="stepIndex" />
        <p class="caption">步骤 {{ stepIndex + 1 }} / {{ steps.length }}：{{ step.title }}</p>
      </section>

      <section class="panel controls">
        <h2>起电方式</h2>
        <ChargingModeSwitcher :model-value="mode" @update:model-value="store.setMode" />
        <h2>过程控制</h2>
        <PlaybackControls
          :playing="playing"
          @play="store.play()"
          @pause="store.pause()"
          @reset="store.reset()"
        />
        <div class="step-nav">
          <button type="button" :disabled="isFirst" @click="store.prev()">上一步</button>
          <button type="button" :disabled="isLast" @click="store.next()">下一步</button>
        </div>
        <dl class="readout">
          <div v-for="body in step.bodies" :key="body.id">
            <dt>{{ body.label }}</dt>
            <dd>
              <template v-if="body.leftCharge !== undefined && body.rightCharge !== undefined">
                近端 {{ body.leftCharge > 0 ? '+' : '' }}{{ body.leftCharge }}，
                远端 {{ body.rightCharge > 0 ? '+' : '' }}{{ body.rightCharge }}
                （净电荷 {{ body.charge > 0 ? '+' : '' }}{{ body.charge }}）
              </template>
              <template v-else>
                {{ body.charge === 0 ? '不带电' : body.charge > 0 ? `+${body.charge}` : `${body.charge}` }}
              </template>
            </dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>摩擦起电</h2>
        <p>两种物体相互摩擦时，电子从一个物体转移到另一个物体。失去电子的带正电，得到电子的带负电。</p>
      </article>
      <article>
        <h2>接触起电</h2>
        <p>带电体与导体接触后，电荷会在导体上重新分配。分开后，原来不带电的导体也会带上同种电荷。</p>
      </article>
      <article>
        <h2>感应起电</h2>
        <p>带电体靠近导体时先使电荷分离；再通过接地把一种电荷导走，最后导体带上与带电体异种的电荷。</p>
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
  grid-template-columns: minmax(0, 1.5fr) minmax(250px, 0.75fr);
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
  gap: 0.75rem;
}

.caption {
  margin-top: 0.55rem;
  font-size: 0.92rem;
}

.step-nav {
  display: flex;
  gap: 0.5rem;
}

.step-nav button {
  flex: 1;
  padding: 0.45rem 0.7rem;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: transparent;
  color: #1d4ed8;
  font: inherit;
  cursor: pointer;
}

.step-nav button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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
  text-align: right;
  color: var(--color-heading);
  font-variant-numeric: tabular-nums;
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
