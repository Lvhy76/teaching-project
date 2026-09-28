import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  distance,
  formatEnergy,
  formatPhi,
  potentialAt,
  potentialEnergy,
  type PointCharge,
} from '@/utils/electricPotential'

/** 仿真坐标系：单位 m，源电荷固定在原点附近 */
export const FIELD_BOUNDS = {
  minX: -0.35,
  maxX: 0.35,
  minY: -0.22,
  maxY: 0.22,
}

export const useElectricPotentialStore = defineStore('electricPotential', () => {
  /** 源电荷 Q（C），默认 +2 μC */
  const sourceQ = ref(2e-6)
  /** 试探电荷 q（C），默认 +0.5 μC */
  const testQ = ref(0.5e-6)
  const testX = ref(0.18)
  const testY = ref(0)

  const source = computed<PointCharge>(() => ({
    x: 0,
    y: 0,
    q: sourceQ.value,
  }))

  const test = computed<PointCharge>(() => ({
    x: testX.value,
    y: testY.value,
    q: testQ.value,
  }))

  const r = computed(() => distance(source.value, test.value))
  const phi = computed(() => potentialAt(source.value, testX.value, testY.value))
  const energy = computed(() => potentialEnergy(source.value, test.value))

  /**
   * 固定标尺：按滑块最大电荷量与较近距离估算，
   * 避免调节 Q、q 时条高比例不变。
   */
  const phiScale = (9e9 * 5e-6) / 0.05
  const energyScale = (9e9 * 5e-6 * 2e-6) / 0.05

  function setTestPosition(x: number, y: number) {
    const minR = 0.04
    let nx = Math.min(FIELD_BOUNDS.maxX, Math.max(FIELD_BOUNDS.minX, x))
    let ny = Math.min(FIELD_BOUNDS.maxY, Math.max(FIELD_BOUNDS.minY, y))
    const dist = Math.hypot(nx, ny)
    if (dist < minR) {
      const scale = minR / Math.max(dist, 1e-9)
      nx *= scale
      ny *= scale
    }
    testX.value = nx
    testY.value = ny
  }

  function reset() {
    sourceQ.value = 2e-6
    testQ.value = 0.5e-6
    testX.value = 0.18
    testY.value = 0
  }

  return {
    sourceQ,
    testQ,
    testX,
    testY,
    source,
    test,
    r,
    phi,
    energy,
    phiScale,
    energyScale,
    setTestPosition,
    reset,
    formatPhi,
    formatEnergy,
  }
})
