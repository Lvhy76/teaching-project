import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  clampProbe,
  deltaPotentialEnergy,
  formatPhiLocal,
  formatVoltage,
  formatWork,
  moveToSameEquipotential,
  onSameEquipotential,
  potentialAtMode,
  potentialDifference,
  radiusOf,
  workFromVoltage,
  type FieldMode,
  type PointCharge,
  type ProbeId,
  type ProbePoint,
} from '@/utils/potentialDifference'

export const usePotentialDifferenceStore = defineStore('potentialDifference', () => {
  const fieldMode = ref<FieldMode>('point')
  /** 源电荷 Q（C），点电荷模式 */
  const sourceQ = ref(2e-6)
  /** 匀强电场 Ex（N/C），水平向右为正 */
  const fieldE = ref(5e4)
  /** 试探电荷 q（C） */
  const testQ = ref(0.5e-6)
  const pointA = ref<ProbePoint>({ x: 0.2, y: 0.08 })
  const pointB = ref<ProbePoint>({ x: 0.12, y: -0.1 })
  const activeProbe = ref<ProbeId>('B')

  const source = computed<PointCharge>(() => ({ x: 0, y: 0, q: sourceQ.value }))

  const phiA = computed(() =>
    potentialAtMode(fieldMode.value, source.value, fieldE.value, pointA.value.x, pointA.value.y),
  )
  const phiB = computed(() =>
    potentialAtMode(fieldMode.value, source.value, fieldE.value, pointB.value.x, pointB.value.y),
  )
  const uAB = computed(() => potentialDifference(phiA.value, phiB.value))
  const workAB = computed(() => workFromVoltage(testQ.value, uAB.value))

  const epA = computed(() => testQ.value * phiA.value)
  const epB = computed(() => testQ.value * phiB.value)
  const deltaEp = computed(() => deltaPotentialEnergy(epA.value, epB.value))

  const rA = computed(() => radiusOf(pointA.value))
  const rB = computed(() => radiusOf(pointB.value))
  const sameEquipotential = computed(() =>
    onSameEquipotential(fieldMode.value, pointA.value, pointB.value),
  )

  /** 固定标尺：两种场按滑块极值估算 */
  const voltageScale = computed(() => {
    if (fieldMode.value === 'uniform') return 1e5 * 0.7
    return (9e9 * 5e-6) / 0.05
  })
  const workScale = computed(() => voltageScale.value * 2e-6)

  watch(fieldMode, (mode) => {
    pointA.value = clampProbe(mode, pointA.value.x, pointA.value.y)
    pointB.value = clampProbe(mode, pointB.value.x, pointB.value.y)
  })

  function setFieldMode(mode: FieldMode) {
    fieldMode.value = mode
  }

  function setActiveProbe(id: ProbeId) {
    activeProbe.value = id
  }

  function setProbePosition(id: ProbeId, x: number, y: number) {
    const next = clampProbe(fieldMode.value, x, y)
    if (id === 'A') pointA.value = next
    else pointB.value = next
  }

  function moveActiveTo(x: number, y: number) {
    setProbePosition(activeProbe.value, x, y)
  }

  function snapActiveToOtherEquipotential() {
    if (activeProbe.value === 'A') {
      pointA.value = moveToSameEquipotential(fieldMode.value, pointA.value, pointB.value)
    } else {
      pointB.value = moveToSameEquipotential(fieldMode.value, pointB.value, pointA.value)
    }
  }

  function reset() {
    fieldMode.value = 'point'
    sourceQ.value = 2e-6
    fieldE.value = 5e4
    testQ.value = 0.5e-6
    pointA.value = { x: 0.2, y: 0.08 }
    pointB.value = { x: 0.12, y: -0.1 }
    activeProbe.value = 'B'
  }

  return {
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
    epA,
    epB,
    deltaEp,
    rA,
    rB,
    sameEquipotential,
    voltageScale,
    workScale,
    setFieldMode,
    setActiveProbe,
    setProbePosition,
    moveActiveTo,
    snapActiveToOtherEquipotential,
    reset,
    formatPhi: formatPhiLocal,
    formatEnergy: formatWork,
    formatVoltage,
  }
})
