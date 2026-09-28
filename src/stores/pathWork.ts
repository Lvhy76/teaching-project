import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  FIELD_BOUNDS,
  POINT_A,
  POINT_B,
  formatLength,
  formatWork,
  pathLength,
  pathMeta,
  pathOptions,
  pathWaypoints,
  pointOnPath,
  workAlongProgress,
  workUniform,
  type PathId,
} from '@/utils/pathWork'

export const usePathWorkStore = defineStore('pathWork', () => {
  /** 试探电荷 q（C），默认 +2 μC */
  const testQ = ref(2e-6)
  /** 匀强电场强度 Ex（N/C = V/m），水平向右 */
  const fieldE = ref(5e4)
  const pathId = ref<PathId>('straight')
  const progress = ref(0)
  const playing = ref(false)

  const a = POINT_A
  const b = POINT_B

  const points = computed(() => pathWaypoints(pathId.value, a, b))
  const length = computed(() => pathLength(points.value))
  const position = computed(() => pointOnPath(points.value, progress.value))

  /** 整段路径做功（与路径无关，只与 A、B 有关） */
  const totalWork = computed(() => workUniform(testQ.value, fieldE.value, a, b))
  /** 动画累积做功 */
  const currentWork = computed(() =>
    workAlongProgress(testQ.value, fieldE.value, points.value, progress.value),
  )
  /** 电势差 U_AB = φA − φB = E · (rA − rB) 在 φ = −E·r 约定下为 Ex(xA−xB) 的负… 
   *  取无穷远或参考：W = q(φA − φB)，匀强场 φ = −Ex x → φA−φB = Ex(xB−xA)，W=q Ex Δx
   */
  const voltageAB = computed(() => fieldE.value * (b.x - a.x))

  const comparisons = computed(() =>
    pathOptions.map((option) => {
      const pts = pathWaypoints(option.id, a, b)
      return {
        ...option,
        length: pathLength(pts),
        work: workUniform(testQ.value, fieldE.value, a, b),
        active: option.id === pathId.value,
      }
    }),
  )

  watch(pathId, () => {
    progress.value = 0
    playing.value = false
  })

  function setPath(id: PathId) {
    pathId.value = id
  }

  function play() {
    if (progress.value >= 1) progress.value = 0
    playing.value = true
  }

  function pause() {
    playing.value = false
  }

  function reset() {
    playing.value = false
    progress.value = 0
  }

  /** 按弧长匀速推进，约 2.4 s 走完 */
  function tick(elapsedMs: number) {
    if (!playing.value) return
    const durationMs = 2400
    progress.value = Math.min(1, progress.value + elapsedMs / durationMs)
    if (progress.value >= 1) playing.value = false
  }

  return {
    testQ,
    fieldE,
    pathId,
    progress,
    playing,
    a,
    b,
    bounds: FIELD_BOUNDS,
    points,
    length,
    position,
    totalWork,
    currentWork,
    voltageAB,
    comparisons,
    pathMeta: computed(() => pathMeta(pathId.value)),
    pathOptions,
    setPath,
    play,
    pause,
    reset,
    tick,
    formatWork,
    formatLength,
  }
})
