import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  formatAngle,
  formatChargeUC,
  fullAngleDeg,
  halfAngleDeg,
} from '@/utils/electroscope'

export const useElectroscopeStore = defineStore('electroscope', () => {
  /** 验电器带电量（μC），可正可负 */
  const chargeUC = ref(2)
  /** 画面上平滑显示的半张角（度），用于插值动画 */
  const displayHalfDeg = ref(halfAngleDeg(2))

  const halfDeg = computed(() => halfAngleDeg(chargeUC.value))
  const fullDeg = computed(() => fullAngleDeg(chargeUC.value))
  const charged = computed(() => Math.abs(chargeUC.value) >= 0.05)
  const positive = computed(() => chargeUC.value > 0.05)

  function setChargeUC(value: number) {
    chargeUC.value = value
  }

  function reset() {
    chargeUC.value = 2
    displayHalfDeg.value = halfAngleDeg(2)
  }

  /** 每帧把显示角向目标角靠近 */
  function tick(dt: number) {
    const target = halfDeg.value
    const k = 1 - Math.exp(-12 * dt)
    displayHalfDeg.value += (target - displayHalfDeg.value) * k
    if (Math.abs(target - displayHalfDeg.value) < 0.05) {
      displayHalfDeg.value = target
    }
  }

  return {
    chargeUC,
    displayHalfDeg,
    halfDeg,
    fullDeg,
    charged,
    positive,
    setChargeUC,
    reset,
    tick,
    formatAngle,
    formatChargeUC,
  }
})
