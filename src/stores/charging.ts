import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { stepsForMode, type ChargingMode } from '@/utils/charging'

export const useChargingStore = defineStore('charging', () => {
  const mode = ref<ChargingMode>('friction')
  const stepIndex = ref(0)
  const playing = ref(false)
  const autoTimer = ref(0)

  const steps = computed(() => stepsForMode(mode.value))
  const step = computed(() => steps.value[stepIndex.value] ?? steps.value[0]!)
  const isLast = computed(() => stepIndex.value >= steps.value.length - 1)
  const isFirst = computed(() => stepIndex.value <= 0)

  watch(mode, () => {
    playing.value = false
    stepIndex.value = 0
  })

  function setMode(next: ChargingMode) {
    mode.value = next
  }

  function next() {
    if (isLast.value) {
      playing.value = false
      return
    }
    stepIndex.value += 1
  }

  function prev() {
    if (isFirst.value) return
    stepIndex.value -= 1
  }

  function reset() {
    playing.value = false
    stepIndex.value = 0
  }

  function play() {
    if (isLast.value) {
      stepIndex.value = 0
    }
    playing.value = true
  }

  function pause() {
    playing.value = false
  }

  /** 由页面定时推进步骤 */
  function tickAuto(elapsedMs: number) {
    if (!playing.value) return
    autoTimer.value += elapsedMs
    if (autoTimer.value < 1600) return
    autoTimer.value = 0
    if (isLast.value) {
      playing.value = false
      return
    }
    stepIndex.value += 1
  }

  return {
    mode,
    stepIndex,
    playing,
    steps,
    step,
    isLast,
    isFirst,
    setMode,
    next,
    prev,
    reset,
    play,
    pause,
    tickAuto,
  }
})
