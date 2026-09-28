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
  if (!canvas) return
  const maybeCtx = canvas.getContext('2d')
  if (!maybeCtx) return
  const ctx: CanvasRenderingContext2D = maybeCtx

  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.floor(width * ratio))
  canvas.height = Math.max(1, Math.floor(height * ratio))
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, width, height)

  const left = 36
  const right = width - 28
  const axisY = height * 0.55
  const toX = (time: number) => left + (time / props.duration) * (right - left)

  ctx.strokeStyle = '#334155'
  ctx.fillStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(left, axisY)
  ctx.lineTo(right - 10, axisY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(right - 2, axisY)
  ctx.lineTo(right - 12, axisY - 4)
  ctx.lineTo(right - 12, axisY + 4)
  ctx.closePath()
  ctx.fill()

  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('t / s', right - 8, axisY - 12)
  for (let tick = 0; tick <= props.duration; tick += 2) {
    const x = toX(tick)
    ctx.beginPath()
    ctx.moveTo(x, axisY - 4)
    ctx.lineTo(x, axisY + 4)
    ctx.stroke()
    ctx.fillStyle = '#64748b'
    ctx.fillText(String(tick), x, axisY + 18)
    ctx.fillStyle = '#334155'
  }

  const low = Math.min(props.t1, props.t2)
  const high = Math.max(props.t1, props.t2)
  const xLow = toX(low)
  const xHigh = toX(high)

  ctx.fillStyle = 'rgba(37, 99, 235, 0.18)'
  ctx.fillRect(xLow, axisY - 18, Math.max(2, xHigh - xLow), 36)

  ctx.strokeStyle = '#2563eb'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(xLow, axisY)
  ctx.lineTo(xHigh, axisY)
  ctx.stroke()

  ctx.fillStyle = '#1d4ed8'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('时间间隔 Δt（段）', (xLow + xHigh) / 2, axisY - 28)

  function drawMoment(time: number, label: string, above: boolean) {
    const x = toX(time)
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, axisY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#991b1b'
    ctx.font = '12px sans-serif'
    ctx.fillText(label, x, above ? axisY - 34 : axisY + 34)
  }

  drawMoment(props.t1, `t₁ ${props.t1.toFixed(1)}s`, true)
  drawMoment(props.t2, `t₂ ${props.t2.toFixed(1)}s`, false)

  const nowX = toX(props.time)
  ctx.strokeStyle = '#0f172a'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(nowX, 12)
  ctx.lineTo(nowX, height - 12)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#0f172a'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`当前 t=${props.time.toFixed(1)}s`, Math.min(nowX + 6, right - 90), 20)
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
