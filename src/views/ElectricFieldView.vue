<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import ControlSlider from '@/components/ControlSlider.vue'
import ElectricField2DCanvas from '@/components/ElectricField2DCanvas.vue'
import ElectricFieldCanvas from '@/components/ElectricFieldCanvas.vue'
import { useElectricFieldStore } from '@/stores/electricField'
import { fieldConfigOptions } from '@/utils/electricField'

type ViewMode = '2d' | '3d'

const store = useElectricFieldStore()
const {
  configId,
  charges,
  testQuC,
  probe,
  fieldLines,
  fieldLines2D,
  eAtProbe,
  eMag,
  fAtProbe,
  fMag,
  showAxisGuides,
  showAxisFieldE,
  showAxisAnalysis,
  axisProbePos,
  axisForces,
  axisForceScaleMag,
  eAtAxisProbe,
} = storeToRefs(store)

const viewMode = ref<ViewMode>('2d')
const isFullscreen = ref(false)
const showForce = computed(() => Math.abs(testQuC.value) >= 0.05)
const showAxisControls = computed(
  () => viewMode.value === '2d' && showAxisAnalysis.value,
)
/** 轴上试探电荷开启时，隐藏自由探测点对应的右侧 F/E 控件 */
const showFreeProbeControls = computed(
  () => !(showAxisControls.value && showAxisFieldE.value),
)

function isPositive(q: number) {
  return q >= 0
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <p class="crumb">
        <RouterLink to="/electromagnetism">电磁学专题</RouterLink>
        ／
        <RouterLink to="/electromagnetism/electrostatics">静电场</RouterLink>
        ／ 电场强度与电场线
      </p>
      <h1>电场强度与电场线</h1>
      <p class="formula">
        定义 E = F/q（与试探电荷无关）。切换组态查看电场线；点电荷可改正负；二维 / 三维切换观察；调节试探电荷
        q 对照 F 与 E。
      </p>
    </header>

    <div class="layout">
      <section class="panel field" :class="{ 'is-fullscreen': isFullscreen }">
        <div class="field-head">
          <h2>电场线（{{ viewMode === '2d' ? '2D' : '3D' }}）</h2>
          <div class="field-actions">
            <div class="view-switch" role="radiogroup" aria-label="视图维度">
              <button
                type="button"
                role="radio"
                :aria-checked="viewMode === '2d'"
                :class="{ active: viewMode === '2d' }"
                @click="viewMode = '2d'"
              >
                二维
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="viewMode === '3d'"
                :class="{ active: viewMode === '3d' }"
                @click="viewMode = '3d'"
              >
                三维
              </button>
            </div>
            <button
              type="button"
              class="fullscreen-btn"
              :aria-pressed="isFullscreen"
              @click="toggleFullscreen"
            >
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </button>
          </div>
        </div>

        <div class="canvas-wrap">
          <ElectricField2DCanvas
            v-if="viewMode === '2d'"
            :charges="charges"
            :field-lines="fieldLines2D"
            :probe="probe"
            :e-at-probe="eAtProbe"
            :f-at-probe="fAtProbe"
            :show-force="showForce"
            :config-id="configId"
            :show-axis-guides="showAxisGuides"
            :show-axis-field-e="showAxisFieldE"
            :axis-probe-pos="axisProbePos"
            :axis-forces="axisForces"
            :axis-force-scale-mag="axisForceScaleMag"
            :e-at-axis-probe="eAtAxisProbe"
            :format-f="store.formatF"
            @update:axis-probe="store.setAxisProbe"
          />
          <ElectricFieldCanvas
            v-else
            :charges="charges"
            :field-lines="fieldLines"
            :probe="probe"
            :e-at-probe="eAtProbe"
            :f-at-probe="fAtProbe"
            :show-force="showForce"
          />
        </div>
        <p v-if="!isFullscreen" class="caption">
          红为正电荷（+），蓝为负电荷（−）；蓝色箭头为 E，橙色为 F。
          <template v-if="viewMode === '3d'">拖拽旋转，滚轮缩放。</template>
        </p>
        <p v-else class="fullscreen-tip">按 Esc 或点「退出全屏」返回</p>
      </section>

      <section class="panel controls">
        <h2>电荷组态</h2>
        <div class="mode-switch" role="radiogroup" aria-label="电荷组态">
          <button
            v-for="option in fieldConfigOptions"
            :key="option.id"
            type="button"
            role="radio"
            :aria-checked="configId === option.id"
            :class="{ active: configId === option.id }"
            @click="store.setConfig(option.id)"
          >
            <span>{{ option.label }}</span>
            <small>{{ option.hint }}</small>
          </button>
        </div>

        <template v-if="configId === 'single'">
          <h2>源电荷正负</h2>
          <div class="sign-switch" role="group" aria-label="点电荷电性">
            <button
              type="button"
              :class="{ active: isPositive(charges[0]?.q ?? 0), pos: true }"
              @click="store.setChargePositive(0, true)"
            >
              +
            </button>
            <button
              type="button"
              :class="{ active: !isPositive(charges[0]?.q ?? 0), neg: true }"
              @click="store.setChargePositive(0, false)"
            >
              −
            </button>
          </div>
        </template>

        <template v-if="showAxisControls">
          <h2>辅助线与场强</h2>
          <div class="toggle-list">
            <label class="toggle">
              <input v-model="showAxisGuides" type="checkbox" />
              电荷连线与中垂线
            </label>
            <label class="toggle">
              <input v-model="showAxisFieldE" type="checkbox" />
              轴上正试探电荷（分力 / 合力）
            </label>
          </div>
        </template>

        <template v-if="showFreeProbeControls">
          <h2>试探电荷与 F、E</h2>
          <ControlSlider
            :model-value="testQuC"
            label="试探电荷 q"
            unit="μC"
            :min="-3"
            :max="3"
            :step="0.5"
            @update:model-value="store.setTestQuC"
          />
          <p class="hint">F = qE：改 q 时 E 不变，F 成比例变化。</p>

          <dl class="readout">
            <div>
              <dt>|E|（探测点）</dt>
              <dd>{{ store.formatE(eMag) }}</dd>
            </div>
            <div>
              <dt>|F| = |q|·|E|</dt>
              <dd>{{ store.formatF(fMag) }}</dd>
            </div>
            <div>
              <dt>q</dt>
              <dd>{{ testQuC.toFixed(1) }} μC</dd>
            </div>
          </dl>
        </template>

        <button type="button" class="reset" @click="store.reset()">重置</button>
      </section>
    </div>

    <section class="notes">
      <article>
        <h2>电场强度</h2>
        <p>
          E = F/q，描述电场本身的性质，与试探电荷无关。同一点放入不同 q，受力 F
          变，但算出的 E 相同。
        </p>
      </article>
      <article>
        <h2>电场线与电性</h2>
        <p>
          电场线从正电荷出发，终止于负电荷。把点电荷改成负电后，电场线改为向球汇聚；同种电荷同为正或同为负时，电场线互相排斥。
        </p>
      </article>
      <article>
        <h2>建议操作</h2>
        <p>
          先在二维下切换三种组态与点电荷 +/−；再切到三维旋转观察；最后只调试探电荷
          q，确认 |E| 几乎不变而 |F| 随之改变。
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
  grid-template-columns: minmax(0, 1.55fr) minmax(250px, 0.8fr);
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
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.55rem;
}

.field-head h2 {
  margin-bottom: 0;
}

.field-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.view-switch {
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.2rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.view-switch button {
  min-width: 3.2rem;
  padding: 0.3rem 0.65rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.view-switch button.active {
  background: #1d4ed8;
  color: #fff;
}

.fullscreen-btn {
  padding: 0.3rem 0.7rem;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: transparent;
  color: #1d4ed8;
  font: inherit;
  cursor: pointer;
}

.canvas-wrap {
  min-height: 0;
}

.field.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0.85rem 1rem 1rem;
  border: none;
  border-radius: 0;
  background: #0f172a;
  color: #e2e8f0;
}

.field.is-fullscreen h2 {
  color: #f8fafc;
}

.field.is-fullscreen .view-switch {
  border-color: #334155;
  background: #1e293b;
}

.field.is-fullscreen .view-switch button {
  color: #e2e8f0;
}

.field.is-fullscreen .view-switch button.active {
  background: #3b82f6;
  color: #fff;
}

.field.is-fullscreen .fullscreen-btn {
  border-color: #93c5fd;
  color: #93c5fd;
}

.field.is-fullscreen .canvas-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
}

.field.is-fullscreen .canvas-wrap :deep(.canvas),
.field.is-fullscreen .canvas-wrap :deep(.viewport) {
  flex: 1;
  width: 100%;
  height: 100% !important;
  min-height: 0;
  border: none;
  border-radius: 0;
}

.fullscreen-tip {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.caption,
.hint {
  margin-top: 0.45rem;
  font-size: 0.88rem;
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

.sign-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
}

.sign-switch button {
  min-width: 2.4rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.sign-switch button.active.pos {
  border-color: #dc2626;
  background: #fef2f2;
  color: #dc2626;
}

.sign-switch button.active.neg {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.toggle-list {
  display: grid;
  gap: 0.4rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
}

.toggle input {
  width: 1rem;
  height: 1rem;
  accent-color: #1d4ed8;
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
