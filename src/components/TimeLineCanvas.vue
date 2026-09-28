<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  time: number
  duration: number
  t1: number
  t2: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function draw() {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return

  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.floor(width * ratio))
  canvas.height = Math.max(1, Math.floor(height * ratio))
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)

  context.fillStyle = '#f8fafc'
  context.fillRect(0, 0, width, height)

  const left = 36
  const right = width - 28
  const axisY = height * 0.55
  const toX = (time: number) => left + (time / props.duration) * (right - left)

  context.strokeStyle = '#334155'
  context.fillStyle = '#334155'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(left, axisY)
  context.lineTo(right - 10, axisY)
  context.stroke()
  context.beginPath()
  context.moveTo(right - 2, axisY)
  context.lineTo(right - 12, axisY - 4)
  context.lineTo(right - 12, axisY + 4)
  context.closePath()
  context.fill()

  context.font = '12px sans-serif'
  context.textAlign = 'center'
  context.fillText('t / s', right - 8, axisY - 12)
  for (let tick = 0; tick <= props.duration; tick += 2) {
    const x = toX(tick)
    context.beginPath()
    context.moveTo(x, axisY - 4)
    context.lineTo(x, axisY + 4)
    context.stroke()
    context.fillStyle = '#64748b'
    context.fillText(String(tick), x, axisY + 18)
    context.fillStyle = '#334155'
  }

  const low = Math.min(props.t1, props.t2)
  const high = Math.max(props.t1, props.t2)
  const xLow = toX(low)
  const xHigh = toX(high)

  context.fillStyle = 'rgba(37, 99, 235, 0.18)'
  context.fillRect(xLow, axisY - 18, Math.max(2, xHigh - xLow), 36)

  context.strokeStyle = '#2563eb'
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(xLow, axisY)
  context.lineTo(xHigh, axisY)
  context.stroke()

  context.fillStyle = '#1d4ed8'
  context.font = '12px sans-serif'
  context.textAlign = 'center'
  context.fillText('时间间隔 Δt（段）', (xLow + xHigh) / 2, axisY - 28)

  function drawMoment(time: number, label: string, above: boolean) {
    const x = toX(time)
    context.fillStyle = '#dc2626'
    context.beginPath()
    context.arc(x, axisY, 6, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#991b1b'
    context.font = '12px sans-serif'
    context.fillText(label, x, above ? axisY - 34 : axisY + 34)
  }

  drawMoment(props.t1, `t₁ ${props.t1.toFixed(1)}s`, true)
  drawMoment(props.t2, `t₂ ${props.t2.toFixed(1)}s`, false)

  const nowX = toX(props.time)
  context.strokeStyle = '#0f172a'
  context.setLineDash([4, 4])
  context.beginPath()
  context.moveTo(nowX, 12)
  context.lineTo(nowX, height - 12)
  context.stroke()
  context.setLineDash([])
  context.fillStyle = '#0f172a'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.fillText(`当前 t=${props.time.toFixed(1)}s`, Math.min(nowX + 6, right - 90), 20)
}

onMounted(() => {
  draw()
  const canvas = canvasRef.value
  if (!canvas) return
  observer = new ResizeObserver(() => draw())
  observer.observe(canvas)
})

onUnmounted(() => {
  observer?.disconnect()
})

watch(
  () => [props.time, props.duration, props.t1, props.t2],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="stage" aria-label="时刻与时间间隔" />
</template>

<style scoped>
.stage {
  display: block;
  width: 100%;
  height: 180px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
