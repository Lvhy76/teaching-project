import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  coulombForce,
  forceDirectionLabel,
  formatChargeUC,
  formatDistance,
  formatForce,
} from '@/utils/coulomb'

/** 仿真坐标：两电荷在水平线上，间距为 r（m） */
export const COULOMB_BOUNDS = {
  minX: -0.25,
  maxX: 0.25,
  minY: -0.12,
  maxY: 0.12,
}

export const useCoulombStore = defineStore('coulomb', () => {
  /** Q1、Q2（μC） */
  const q1UC = ref(2)
  const q2UC = ref(2)
  /** 间距 r（m） */
  const distance = ref(0.12)

  const q1 = computed(() => q1UC.value * 1e-6)
  const q2 = computed(() => q2UC.value * 1e-6)

  const force = computed(() => coulombForce(q1.value, q2.value, distance.value))
  const directionLabel = computed(() =>
    forceDirectionLabel(force.value.repulsive, q1.value, q2.value),
  )

  /** 画布上两电荷的位置（对称放置） */
  const x1 = computed(() => -distance.value / 2)
  const x2 = computed(() => distance.value / 2)

  function setQ1UC(value: number) {
    q1UC.value = value
  }

  function setQ2UC(value: number) {
    q2UC.value = value
  }

  function setDistance(meters: number) {
    distance.value = Math.min(0.4, Math.max(0.04, meters))
  }

  /** 用厘米设置间距，便于滑块 */
  function setDistanceCm(cm: number) {
    setDistance(cm / 100)
  }

  function reset() {
    q1UC.value = 2
    q2UC.value = 2
    distance.value = 0.12
  }

  return {
    q1UC,
    q2UC,
    distance,
    q1,
    q2,
    force,
    directionLabel,
    x1,
    x2,
    setQ1UC,
    setQ2UC,
    setDistance,
    setDistanceCm,
    reset,
    formatChargeUC,
    formatDistance,
    formatForce,
  }
})
