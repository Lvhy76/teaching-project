<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { velocityAt, type KinematicsParams } from '@/utils/accelerationLesson'

const props = defineProps<{
  params: KinematicsParams
  time: number
  duration: number
  t1: number
  t2: number
  v1: number
  v2: number
  aAvg: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function chooseTicks(min: number, max: number): number[] {
  const span = max - min || 1
  const raw = span / 4
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const residual = raw / magnitude
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10
  const step = nice * magnitude
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let value = start; value <= max + step * 0.001; value += step) {
    ticks.push(Number(value.toFixed(6)))
  }
  return ticks
}

function formatTick(value: number): string {
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

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

  const steps = 80
  const series: Array<{ t: number; y: number }> = []
  let minY = 0
  let maxY = 0
  for (let index = 0; index <= steps; index += 1) {
    const t = (props.duration * index) / steps
    const y = velocityAt(props.params, t)
    series.push({ t, y })
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  minY = Math.min(minY, props.v1, props.v2, 0)
  maxY = Math.max(maxY, props.v1, props.v2, 0)
  if (maxY - minY < 1) {
    minY -= 0.5
    maxY += 0.5
  }
  const yPad = (maxY - minY) * 0.14
  minY -= yPad
  maxY += yPad

  const plot = { left: 46, right: width - 14, top: 18, bottom: height - 30 }
  const arrowTip = plot.right
  const arrowBase = arrowTip - 12
  const axisEnd = arrowBase - 24
  const toX = (time: number) =>
    plot.left + (time / props.duration) * (axisEnd - plot.left)
  const toY = (value: number) =>
    plot.bottom - ((value - minY) / (maxY - minY)) * (plot.bottom - plot.top)
  const axisY = Math.min(plot.bottom, Math.max(plot.top, toY(0)))

  context.strokeStyle = '#e2e8f0'
  context.lineWidth = 1
  context.font = '11px sans-serif'
  context.fillStyle = '#64748b'
  context.textAlign = 'right'
  for (const tick of chooseTicks(minY, maxY)) {
    if (Math.abs(tick) < 1e-6) continue
    const y = toY(tick)
    context.beginPath()
    context.moveTo(plot.left, y)
    context.lineTo(axisEnd, y)
    context.stroke()
    context.fillText(formatTick(tick), plot.left - 6, y + 4)
  }

  context.strokeStyle = '#334155'
  context.fillStyle = '#334155'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(plot.left, plot.top + 8)
  context.lineTo(plot.left, plot.bottom)
  context.stroke()
  context.beginPath()
  context.moveTo(plot.left, plot.top + 8)
  context.lineTo(plot.left - 3.5, plot.top + 15)
  context.lineTo(plot.left + 3.5, plot.top + 15)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(plot.left, axisY)
  context.lineTo(arrowBase, axisY)
  context.stroke()
  context.beginPath()
  context.moveTo(arrowTip, axisY)
  context.lineTo(arrowBase, axisY - 3.5)
  context.lineTo(arrowBase, axisY + 3.5)
  context.closePath()
  context.fill()
  context.textAlign = 'right'
  context.fillText('t/s', arrowBase - 2, axisY - 6)
  context.textAlign = 'left'
  context.fillText('v/(m/s)', plot.left + 8, plot.top + 10)

  const first = series[0]
  if (first) {
    context.beginPath()
    context.strokeStyle = '#2563eb'
    context.lineWidth = 2
    context.moveTo(toX(first.t), toY(first.y))
    for (const point of series.slice(1)) {
      context.lineTo(toX(point.t), toY(point.y))
    }
    context.stroke()
  }

  const x1 = toX(props.t1)
  const x2 = toX(props.t2)
  const y1 = toY(props.v1)
  const y2 = toY(props.v2)

  context.fillStyle = 'rgba(234, 88, 12, 0.12)'
  context.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1))

  context.strokeStyle = '#ea580c'
  context.lineWidth = 2
  context.setLineDash([5, 4])
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y1)
  context.lineTo(x2, y2)
  context.stroke()
  context.setLineDash([])

  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()

  context.fillStyle = '#ea580c'
  context.beginPath()
  context.arc(x1, y1, 4, 0, Math.PI * 2)
  context.arc(x2, y2, 4, 0, Math.PI * 2)
  context.fill()

  context.font = '11px sans-serif'
  context.textAlign = 'left'
  context.fillText('Δv', x2 + 6, (y1 + y2) / 2 + 4)
  context.fillText(`斜率 a = Δv/Δt = ${props.aAvg.toFixed(2)}`, Math.min(x1, x2) + 8, Math.min(y1, y2) - 8)

  const nowX = toX(props.time)
  const nowY = toY(velocityAt(props.params, props.time))
  context.strokeStyle = '#64748b'
  context.setLineDash([3, 3])
  context.beginPath()
  context.moveTo(nowX, plot.top)
  context.lineTo(nowX, plot.bottom)
  context.stroke()
  context.setLineDash([])
  context.fillStyle = '#1d4ed8'
  context.beginPath()
  context.arc(nowX, nowY, 4, 0, Math.PI * 2)
  context.fill()
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
  () => [
    props.params.v0,
    props.params.acceleration,
    props.time,
    props.duration,
    props.t1,
    props.t2,
    props.v1,
    props.v2,
    props.aAvg,
  ],
  () => draw(),
)
</script>

<template>
  <figure class="graph">
    <figcaption>v-t 图像：Δv 与斜率 a</figcaption>
    <canvas ref="canvasRef" aria-label="加速度 v-t 图像" />
  </figure>
</template>

<style scoped>
.graph {
  margin: 0;
}

figcaption {
  margin-bottom: 0.4rem;
  font-weight: 600;
}

canvas {
  display: block;
  width: 100%;
  height: 260px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
