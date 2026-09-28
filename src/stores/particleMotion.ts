import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  deflectAngle,
  formatAccel,
  formatAngle,
  formatSpeed,
  sampleTrajectory,
  stateAt,
  type MotionMode,
} from '@/utils/particleMotion'

export const useParticleMotionStore = defineStore('particleMotion', () => {
  const mode = ref<MotionMode>('deflect')
  /** 电荷量 q（C），默认 5 nC */
  const chargeQ = ref(5e-9)
  /** 质量 m（kg），默认 500 μg */
  const mass = ref(5e-7)
  /** 场强大小 E（N/C）；加速模式水平向右，偏转模式竖直向下 */
  const fieldE = ref(4e4)
  /** 初速度 v0（m/s），沿 +x */
  const v0 = ref(12)
  const time = ref(0)
  const playing = ref(false)
  /** 已走过的轨迹 */
  const trail = ref<{ x: number; y: number }[]>([])

  /** 课堂播放倍速：1 = 约 5–6 秒看完一次，可再调慢 */
  const playSpeed = ref(1)

  const state = computed(() =>
    stateAt(mode.value, time.value, chargeQ.value, mass.value, fieldE.value, v0.value),
  )

  const previewPath = computed(() =>
    sampleTrajectory(mode.value, chargeQ.value, mass.value, fieldE.value, v0.value),
  )

  const accelMag = computed(() => Math.abs(state.value.ax) + Math.abs(state.value.ay))
  const speed = computed(() => Math.hypot(state.value.vx, state.value.vy))
  const angle = computed(() => deflectAngle(state.value.vx, state.value.vy))

  watch([mode, chargeQ, mass, fieldE, v0], () => {
    playing.value = false
    time.value = 0
    trail.value = []
  })

  function setMode(next: MotionMode) {
    mode.value = next
  }

  function play() {
    if (state.value.done) {
      time.value = 0
      trail.value = []
    }
    if (trail.value.length === 0) {
      const s = stateAt(mode.value, 0, chargeQ.value, mass.value, fieldE.value, v0.value)
      trail.value = [{ x: s.x, y: s.y }]
    }
    playing.value = true
  }

  function pause() {
    playing.value = false
  }

  function reset() {
    playing.value = false
    time.value = 0
    trail.value = []
  }

  function tick(dt: number) {
    if (!playing.value) return
    // 物理过程本身只有几十毫秒，需强力放慢才能课堂可见
    const baseScale = mode.value === 'accelerate' ? 0.005 : 0.006
    const scale = baseScale * Math.max(0.25, playSpeed.value)
    let remaining = Math.min(0.05, dt) * scale
    const maxStep = 0.0004
    while (remaining > 1e-9 && playing.value) {
      const step = Math.min(maxStep, remaining)
      time.value += step
      remaining -= step
      const s = stateAt(mode.value, time.value, chargeQ.value, mass.value, fieldE.value, v0.value)
      const last = trail.value[trail.value.length - 1]
      if (!last || Math.hypot(s.x - last.x, s.y - last.y) > 0.0012) {
        trail.value.push({ x: s.x, y: s.y })
      }
      if (s.done) {
        playing.value = false
        break
      }
    }
  }

  return {
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
    setMode,
    play,
    pause,
    reset,
    tick,
    formatAccel,
    formatAngle,
    formatSpeed,
  }
})
