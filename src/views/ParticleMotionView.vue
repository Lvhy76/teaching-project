<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import ParticleMotionCanvas from '@/components/ParticleMotionCanvas.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { useParticleMotionStore } from '@/stores/particleMotion'
import { motionModeOptions } from '@/utils/particleMotion'

const store = useParticleMotionStore()
const {
  mode,
  chargeQ,
  mass,
  fieldE,
  v0,
  time,
  playing,
  playSpeed,
  trail,
  state,
  previewPath,
  accelMag,
  speed,
  angle,
} = storeToRefs(store)

const showPreview = ref(true)

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

function setQnC(value: number) {
  chargeQ.value = value * 1e-9
}

function setMassUg(value: number) {
  mass.value = value * 1e-9
}

function setEkVpm(value: number) {
  fieldE.value = value * 1000
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
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/field-energy">静电场中的能量</RouterLink>
        ／ 带电粒子在电场中的运动
      </p>
      <h1>带电粒子在电场中的运动</h1>
      <p class="formula">
        匀强电场中 a = qE/m。加速：初速与 E 同向；偏转：初速垂直于 E，轨迹为抛物线（类平抛）。
      </p>
    </header>

    <div class="layout">
      <section class="panel field">
        <div class="field-head">
          <h2>轨迹实时追踪</h2>
          <label class="toggle">
            <input v-model="showPreview" type="checkbox" />
            显示完整轨迹预览
          </label>
        </div>
        <ParticleMotionCanvas
          :mode="mode"
          :state="state"
          :trail="trail"
          :preview-path="previewPath"
          :field-e="fieldE"
          :show-preview="showPreview"
        />
        <p class="caption">
          橙色为已走过轨迹；虚线为理论全轨迹。偏转模式下出电场后沿切线匀速飞出。
        </p>
      </section>

      <section class="panel controls">
        <h2>运动类型</h2>
        <div class="mode-switch" role="radiogroup" aria-label="运动类型">
          <button
            v-for="option in motionModeOptions"
            :key="option.id"
            type="button"
            role="radio"
            :aria-checked="mode === option.id"
            :class="{ active: mode === option.id }"
            @click="store.setMode(option.id)"
          >
            <span>{{ option.label }}</span>
            <small>{{ option.hint }}</small>
          </button>
        </div>

        <h2>过程控制</h2>
        <PlaybackControls
          :playing="playing"
          @play="store.play()"
          @pause="store.pause()"
          @reset="store.reset()"
        />
        <ControlSlider
          :model-value="playSpeed"
          label="播放速度"
          unit="×"
          :min="0.25"
          :max="2"
          :step="0.25"
          @update:model-value="(v) => (playSpeed = v)"
        />
        <p class="speed-hint">默认已放慢便于观察；觉得慢可调高播放速度。</p>

        <h2>参数</h2>
        <ControlSlider
          :model-value="chargeQ * 1e9"
          label="电荷量 q"
          unit="nC"
          :min="-40"
          :max="40"
          :step="1"
          @update:model-value="setQnC"
        />
        <ControlSlider
          :model-value="mass * 1e9"
          label="质量 m"
          unit="μg"
          :min="100"
          :max="2000"
          :step="50"
          @update:model-value="setMassUg"
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
        <ControlSlider
          :model-value="v0"
          label="初速度 v₀"
          unit="m/s"
          :min="0"
          :max="20"
          :step="0.5"
          @update:model-value="(v) => (v0 = v)"
        />

        <dl class="readout">
          <div>
            <dt>时间 t</dt>
            <dd>{{ time.toFixed(3) }} s</dd>
          </div>
          <div>
            <dt>|a| = |q|E/m</dt>
            <dd>{{ store.formatAccel(accelMag) }}</dd>
          </div>
          <div>
            <dt>v<sub>x</sub></dt>
            <dd>{{ store.formatSpeed(state.vx) }}</dd>
          </div>
          <div>
            <dt>v<sub>y</sub></dt>
            <dd>{{ store.formatSpeed(state.vy) }}</dd>
          </div>
          <div>
            <dt>速率 v</dt>
            <dd>{{ store.formatSpeed(speed) }}</dd>
          </div>
          <div v-if="mode === 'deflect'">
            <dt>速度偏向角</dt>
            <dd>{{ store.formatAngle(angle) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>加速</h2>
        <p>
          初速度与电场同向时，粒子做匀加速直线运动：v = v₀ + at，x = v₀t + ½at²，其中 a = qE/m。电场力做功，动能增加。
        </p>
      </article>
      <article>
        <h2>偏转（类平抛）</h2>
        <p>
          初速度垂直于电场时，沿初速方向匀速、沿电场方向匀加速，合运动为抛物线，与平抛运动类似。出电场后不受电场力，沿切线匀速飞出。
        </p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>
          先看偏转模式播放，对照虚线预览；再增大 E 或减小 m 观察偏转变大；切换到加速模式对比直线运动；最后把 q
          调成负值看偏转方向反转。
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
  grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.85fr);
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
  cursor: pointer;
}

.caption {
  margin-top: 0.45rem;
  font-size: 0.9rem;
  color: #64748b;
}

.speed-hint {
  margin: -0.35rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
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
