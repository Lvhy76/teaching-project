import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  VELOCITY_DURATION,
  averageVelocity,
  defaultVelocityParams,
  instantaneousVelocity,
  positionAt,
  velocityAt,
} from '@/utils/velocityLesson'

export const useVelocityLessonStore = defineStore('velocityLesson', () => {
  const v0 = ref(defaultVelocityParams.v0)
  const acceleration = ref(defaultVelocityParams.acceleration)
  const time = ref(0)
  const duration = ref(VELOCITY_DURATION)
  const playing = ref(false)
  const t1 = ref(1)
  const t2 = ref(4)
  const t0 = ref(2.5)

  const params = computed(() => ({
    x0: 0,
    v0: v0.value,
    acceleration: acceleration.value,
  }))

  const position = computed(() => positionAt(params.value, time.value))
  const velocity = computed(() => velocityAt(params.value, time.value))
  const x1 = computed(() => positionAt(params.value, t1.value))
  const x2 = computed(() => positionAt(params.value, t2.value))
  const deltaX = computed(() => x2.value - x1.value)
  const deltaT = computed(() => t2.value - t1.value)
  const vAvg = computed(() => averageVelocity(params.value, t1.value, t2.value))
  const vInst = computed(() => instantaneousVelocity(params.value, t0.value))
  const xAtT0 = computed(() => positionAt(params.value, t0.value))

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
    v0,
    acceleration,
    time,
    duration,
    playing,
    t1,
    t2,
    t0,
    params,
    position,
    velocity,
    x1,
    x2,
    deltaX,
    deltaT,
    vAvg,
    vInst,
    xAtT0,
    play,
    pause,
    reset,
    tick,
  }
})
