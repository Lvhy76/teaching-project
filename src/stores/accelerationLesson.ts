import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  ACCELERATION_DURATION,
  averageAcceleration,
  defaultAccelerationParams,
  directionRelation,
  positionAt,
  speedChangeKind,
  speedChangeLabel,
  velocityAt,
} from '@/utils/accelerationLesson'

export const useAccelerationLessonStore = defineStore('accelerationLesson', () => {
  const v0 = ref(defaultAccelerationParams.v0)
  const acceleration = ref(defaultAccelerationParams.acceleration)
  const time = ref(0)
  const duration = ref(ACCELERATION_DURATION)
  const playing = ref(false)
  const t1 = ref(1)
  const t2 = ref(3.5)

  const params = computed(() => ({
    x0: 0,
    v0: v0.value,
    acceleration: acceleration.value,
  }))

  const position = computed(() => positionAt(params.value, time.value))
  const velocity = computed(() => velocityAt(params.value, time.value))
  const v1 = computed(() => velocityAt(params.value, t1.value))
  const v2 = computed(() => velocityAt(params.value, t2.value))
  const deltaV = computed(() => v2.value - v1.value)
  const deltaT = computed(() => t2.value - t1.value)
  const aAvg = computed(() => averageAcceleration(params.value, t1.value, t2.value))
  const changeKind = computed(() => speedChangeKind(velocity.value, acceleration.value))
  const changeLabel = computed(() => speedChangeLabel(changeKind.value))
  const relationText = computed(() => directionRelation(velocity.value, acceleration.value))
  const willReverseSoon = computed(() => {
    if (Math.abs(acceleration.value) < 1e-6) return false
    if (velocity.value * acceleration.value >= 0) return false
    const timeToStop = -velocity.value / acceleration.value
    return timeToStop > 0 && timeToStop < 1.2
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

  function applyPreset(kind: 'same' | 'opposite' | 'negative-same' | 'zero') {
    if (kind === 'same') {
      v0.value = 2
      acceleration.value = 1.2
    } else if (kind === 'opposite') {
      v0.value = 4
      acceleration.value = -1.2
    } else if (kind === 'negative-same') {
      v0.value = -2
      acceleration.value = -1.2
    } else {
      v0.value = 3
      acceleration.value = 0
    }
    reset()
  }

  return {
    v0,
    acceleration,
    time,
    duration,
    playing,
    t1,
    t2,
    params,
    position,
    velocity,
    v1,
    v2,
    deltaV,
    deltaT,
    aAvg,
    changeKind,
    changeLabel,
    relationText,
    willReverseSoon,
    play,
    pause,
    reset,
    tick,
    applyPreset,
  }
})
