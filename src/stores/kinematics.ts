import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { positionAt, velocityAt } from '@/utils/kinematics'

export const useKinematicsStore = defineStore('kinematics', () => {
  const x0 = ref(0)
  const v0 = ref(4)
  const acceleration = ref(1)
  const time = ref(0)
  const duration = ref(10)
  const playing = ref(false)

  const params = computed(() => ({
    x0: x0.value,
    v0: v0.value,
    acceleration: acceleration.value,
  }))

  const velocity = computed(() => velocityAt(params.value, time.value))
  const position = computed(() => positionAt(params.value, time.value))

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
    x0,
    v0,
    acceleration,
    time,
    duration,
    playing,
    velocity,
    position,
    play,
    pause,
    reset,
    tick,
  }
})
