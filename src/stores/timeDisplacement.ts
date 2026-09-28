import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  TOTAL_DURATION,
  displacementBetween,
  pathLengthBetween,
  positionAt,
  velocityAt,
} from '@/utils/timeDisplacement'

export const useTimeDisplacementStore = defineStore('timeDisplacement', () => {
  const time = ref(0)
  const duration = ref(TOTAL_DURATION)
  const playing = ref(false)
  const t1 = ref(1)
  const t2 = ref(5)

  const position = computed(() => positionAt(time.value))
  const velocity = computed(() => velocityAt(time.value))
  const x1 = computed(() => positionAt(t1.value))
  const x2 = computed(() => positionAt(t2.value))
  const deltaT = computed(() => Math.abs(t2.value - t1.value))
  const displacement = computed(() => displacementBetween(t1.value, t2.value))
  const pathLength = computed(() => pathLengthBetween(t1.value, t2.value))
  const inInterval = computed(() => {
    const low = Math.min(t1.value, t2.value)
    const high = Math.max(t1.value, t2.value)
    return time.value >= low && time.value <= high
  })

  function play() {
    if (time.value >= duration.value) {
      time.value = 0
    }
    playing.value = true
  }

  function pause() {
    playing.value = false
  }

  function reset() {
    playing.value = false
    time.value = 0
  }

  function tick(deltaSeconds: number) {
    if (!playing.value) return
    const next = time.value + deltaSeconds
    if (next >= duration.value) {
      time.value = duration.value
      playing.value = false
      return
    }
    time.value = next
  }

  return {
    time,
    duration,
    playing,
    t1,
    t2,
    position,
    velocity,
    x1,
    x2,
    deltaT,
    displacement,
    pathLength,
    inInterval,
    play,
    pause,
    reset,
    tick,
  }
})
