import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  SOURCE_COLORS,
  clampPosition,
  componentForces,
  defaultSourcePositions,
  formatChargeUC,
  formatForce,
  formatForceAngle,
  resultantForce,
  separateFrom,
  type PointCharge,
} from '@/utils/forceSuperposition'

export type DragTarget = 'test' | string

function makeSources(count: number): PointCharge[] {
  return defaultSourcePositions(count).map((p, i) => ({
    id: `Q${i + 1}`,
    label: `Q${i + 1}`,
    x: p.x,
    y: p.y,
    q: p.qUC * 1e-6,
    color: SOURCE_COLORS[i] ?? '#64748b',
  }))
}

function defaultTest(): PointCharge {
  return {
    id: 'q',
    label: 'q',
    x: 0,
    y: 0,
    q: 1e-6,
    color: '#0f172a',
  }
}

export const useForceSuperpositionStore = defineStore('forceSuperposition', () => {
  const sourceCount = ref(2)
  const sources = ref<PointCharge[]>(makeSources(2))
  /** 试探电荷固定作为圆心默认在原点 */
  const test = ref<PointCharge>(defaultTest())
  const activeId = ref<DragTarget>('test')

  const components = computed(() => componentForces(test.value, sources.value))
  const net = computed(() => resultantForce(components.value))

  function setSourceCount(n: number) {
    const count = Math.min(3, Math.max(2, Math.round(n)))
    sourceCount.value = count
    const next = makeSources(count)
    sources.value = next.map((s, i) => {
      const prev = sources.value[i]
      if (!prev) return s
      return { ...s, q: prev.q }
    })
  }

  function setTestQuC(value: number) {
    test.value = { ...test.value, q: value * 1e-6 }
  }

  function setSourceQuC(id: string, value: number) {
    sources.value = sources.value.map((s) =>
      s.id === id ? { ...s, q: value * 1e-6 } : s,
    )
  }

  function setActive(id: DragTarget) {
    activeId.value = id
  }

  function moveCharge(id: DragTarget, x: number, y: number) {
    const others =
      id === 'test'
        ? sources.value
        : [
            { x: test.value.x, y: test.value.y },
            ...sources.value.filter((s) => s.id !== id),
          ]
    const pos = separateFrom(clampPosition(x, y), others)
    if (id === 'test') {
      test.value = { ...test.value, ...pos }
    } else {
      sources.value = sources.value.map((s) => (s.id === id ? { ...s, ...pos } : s))
    }
  }

  function reset() {
    sourceCount.value = 2
    sources.value = makeSources(2)
    test.value = defaultTest()
    activeId.value = 'test'
  }

  return {
    sourceCount,
    sources,
    test,
    activeId,
    components,
    net,
    setSourceCount,
    setTestQuC,
    setSourceQuC,
    setActive,
    moveCharge,
    reset,
    formatChargeUC,
    formatForce,
    formatForceAngle,
  }
})
