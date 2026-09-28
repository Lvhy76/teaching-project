import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  DEFAULT_G,
  DEFAULT_HEIGHT,
  fallTime,
  fallenDistance,
  formatValue,
  heightAboveGround,
  velocityDown,
} from '@/utils/freeFall'

export const useFreeFallStore = defineStore('freeFall', () => {
  const height = ref(DEFAULT_HEIGHT)
  const g = ref(DEFAULT_G)
  const v0 = ref(0)
  const time = ref(0)
  const playing = ref(false)
  const showTwin = ref(true)

  const duration = computed(() => fallTime(height.value, g.value, v0.value))
  const fallen = computed(() =>
    Math.min(height.value, fallenDistance(g.value, time.value, v0.value)),
  )
  const altitude = computed(() =>
    heightAboveGround(height.value, g.value, time.value, v0.value),
  )
  const velocity = computed(() => {
    if (time.value >= duration.value) {
      return velocityDown(g.value, duration.value, v0.value)
    }
    return velocityDown(g.value, time.value, v0.value)
  })
  const landed = computed(() => time.value >= duration.value - 1e-6)

  watch([height, g, v0], () => {
    if (time.value > duration.value) {
      time.value = duration.value
      playing.value = false
    }
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
    height,
    g,
    v0,
    time,
    duration,
    playing,
    showTwin,
    fallen,
    altitude,
    velocity,
    landed,
    play,
    pause,
    reset,
    tick,
    formatValue,
  }
})
