import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  CAR_HALF_LENGTH,
  frameVelocity,
  personGroundVelocity,
  positionInFrame,
  relativeVelocity,
  type FrameId,
} from '@/utils/referenceFrame'

export const useReferenceFrameStore = defineStore('referenceFrame', () => {
  const frame = ref<FrameId>('ground')
  const vCar = ref(8)
  const vWalk = ref(0.6)
  const vPlane = ref(20)
  const time = ref(0)
  const duration = ref(6)
  const playing = ref(false)
  const showParticle = ref(true)

  const scene = computed(() => ({
    vCar: vCar.value,
    vWalk: vWalk.value,
    vPlane: vPlane.value,
  }))

  const vFrame = computed(() => frameVelocity(frame.value, scene.value))
  const positions = computed(() => positionInFrame(frame.value, scene.value, time.value))
  const xCar = computed(() => positions.value.car)
  const xPerson = computed(() => positions.value.person)
  const xPlane = computed(() => positions.value.plane)
  const personDisplacement = computed(() => {
    const start = positionInFrame(frame.value, scene.value, 0).person
    return positions.value.person - start
  })

  const vPersonGround = computed(() => personGroundVelocity(scene.value))
  const vPerson = computed(() => relativeVelocity(vPersonGround.value, vFrame.value))
  const vCarRel = computed(() => relativeVelocity(vCar.value, vFrame.value))
  const vPlaneRel = computed(() => relativeVelocity(vPlane.value, vFrame.value))
  const vGroundRel = computed(() => relativeVelocity(0, vFrame.value))

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
    frame,
    vCar,
    vWalk,
    vPlane,
    time,
    duration,
    playing,
    showParticle,
    carHalfLength: CAR_HALF_LENGTH,
    personDisplacement,
    vFrame,
    xCar,
    xPerson,
    xPlane,
    vPerson,
    vCarRel,
    vPlaneRel,
    vGroundRel,
    vPersonGround,
    play,
    pause,
    reset,
    tick,
  }
})
