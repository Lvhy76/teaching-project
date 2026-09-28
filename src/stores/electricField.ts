import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  axisProbePosition,
  buildFieldLines,
  buildFieldLines2D,
  cloneCharges,
  configById,
  electricFieldAt,
  forceFromField,
  forcesOnPositiveTest,
  axisForceReferenceMag,
  formatE,
  formatF,
  formatSourceCharge,
  length,
  type AxisProbeAxis,
  type FieldCharge,
  type FieldConfigId,
  type Vec3,
} from '@/utils/electricField'

/** 轴上正试探电荷电量（固定，便于看方向与相对大小） */
const AXIS_TEST_Q = 1e-6

export const useElectricFieldStore = defineStore('electricField', () => {
  const configId = ref<FieldConfigId>('single')
  /** 当前组态下的源电荷（可改正负） */
  const charges = ref<FieldCharge[]>(cloneCharges(configById('single').charges))
  /** 试探电荷 q（μC 滑块），用于演示 F = qE */
  const testQuC = ref(1)
  const probe = ref<Vec3>({ x: 0.12, y: 0.06, z: 0 })
  const fieldLines = ref<Vec3[][]>([])
  const fieldLines2D = ref<Vec3[][]>([])

  /** 二维：同种/异种辅助线与轴上场强显隐 */
  const showAxisGuides = ref(true)
  const showAxisFieldE = ref(true)
  /** 轴上正试探电荷：所在轴与参数 */
  const axisProbeAxis = ref<AxisProbeAxis>('join')
  const axisProbeT = ref(0.35)

  const configMeta = computed(() => configById(configId.value))
  const testQ = computed(() => testQuC.value * 1e-6)
  const showAxisAnalysis = computed(
    () => configId.value === 'same' || configId.value === 'opposite',
  )

  const eAtProbe = computed(() => electricFieldAt(probe.value, charges.value))
  const eMag = computed(() => length(eAtProbe.value))
  const fAtProbe = computed(() => forceFromField(testQ.value, eAtProbe.value))
  const fMag = computed(() => length(fAtProbe.value))

  const axisProbePos = computed(() =>
    axisProbePosition(charges.value, axisProbeAxis.value, axisProbeT.value),
  )

  const axisForces = computed(() => {
    const pos = axisProbePos.value
    if (!pos) {
      return { components: [], netFx: 0, netFy: 0, netMag: 0 }
    }
    return forcesOnPositiveTest(pos, charges.value, AXIS_TEST_Q)
  })

  /** 固定比例尺：拖动时箭头长度随真实 |F| 变化 */
  const axisForceScaleMag = computed(() =>
    axisForceReferenceMag(charges.value, AXIS_TEST_Q),
  )

  const eAtAxisProbe = computed(() => {
    const pos = axisProbePos.value
    if (!pos) return { x: 0, y: 0, z: 0 }
    return electricFieldAt(pos, charges.value)
  })

  function rebuildLines() {
    fieldLines.value = buildFieldLines(charges.value, configId.value)
    fieldLines2D.value = buildFieldLines2D(charges.value, configId.value)
  }

  function resetAxisProbe() {
    axisProbeAxis.value = 'join'
    axisProbeT.value = 0.35
  }

  watch(configId, (id) => {
    charges.value = cloneCharges(configById(id).charges)
    resetAxisProbe()
    rebuildLines()
  })

  watch(
    charges,
    () => {
      rebuildLines()
    },
    { deep: true },
  )

  rebuildLines()

  function setConfig(id: FieldConfigId) {
    configId.value = id
  }

  function setTestQuC(value: number) {
    testQuC.value = value
  }

  function setAxisProbe(axis: AxisProbeAxis, t: number) {
    axisProbeAxis.value = axis
    axisProbeT.value = t
  }

  /** 切换某个源电荷正负；同种组态下同步翻转全部，保持“同种” */
  function toggleChargeSign(index: number) {
    if (index < 0 || index >= charges.value.length) return
    if (configId.value === 'same') {
      charges.value = charges.value.map((c) => ({ ...c, q: -c.q }))
      return
    }
    const target = charges.value[index]!
    charges.value = charges.value.map((c, i) =>
      i === index ? { ...c, q: -target.q } : c,
    )
  }

  function setChargePositive(index: number, positive: boolean) {
    if (index < 0 || index >= charges.value.length) return
    if (configId.value === 'same') {
      const sign = positive ? 1 : -1
      charges.value = charges.value.map((c) => ({
        ...c,
        q: sign * Math.abs(c.q || 2e-6),
      }))
      return
    }
    charges.value = charges.value.map((c, i) => {
      if (i !== index) return c
      const mag = Math.abs(c.q) || 2e-6
      return { ...c, q: positive ? mag : -mag }
    })
  }

  function reset() {
    configId.value = 'single'
    charges.value = cloneCharges(configById('single').charges)
    testQuC.value = 1
    probe.value = { x: 0.12, y: 0.06, z: 0 }
    showAxisGuides.value = true
    showAxisFieldE.value = true
    resetAxisProbe()
    rebuildLines()
  }

  return {
    configId,
    charges,
    testQuC,
    probe,
    fieldLines,
    fieldLines2D,
    showAxisGuides,
    showAxisFieldE,
    axisProbeAxis,
    axisProbeT,
    axisProbePos,
    axisForces,
    axisForceScaleMag,
    eAtAxisProbe,
    showAxisAnalysis,
    configMeta,
    testQ,
    eAtProbe,
    eMag,
    fAtProbe,
    fMag,
    setConfig,
    setTestQuC,
    setAxisProbe,
    toggleChargeSign,
    setChargePositive,
    reset,
    formatE,
    formatF,
    formatSourceCharge,
  }
})
