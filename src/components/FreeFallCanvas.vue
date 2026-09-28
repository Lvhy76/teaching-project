<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { heightAboveGround } from '@/utils/freeFall'

const props = defineProps<{
  height: number
  g: number
  v0: number
  time: number
  duration: number
  velocity: number
  showTwin: boolean
  landed: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function drawBall(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  label: string,
) {
  context.fillStyle = color
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#0f172a'
  context.font = '11px sans-serif'
  context.textAlign = 'center'
  context.fillText(label, x, y - radius - 8)
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

  const sky = context.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, '#dbeafe')
  sky.addColorStop(1, '#f8fafc')
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)

  const top = 36
  const ground = height - 36
  const scale = (ground - top) / Math.max(props.height, 1)
  const toY = (altitude: number) => ground - altitude * scale

  context.fillStyle = '#86efac'
  context.fillRect(0, ground, width, height - ground)
  context.strokeStyle = '#64748b'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(0, ground)
  context.lineTo(width, ground)
  context.stroke()

  context.strokeStyle = '#94a3b8'
  context.setLineDash([4, 6])
  context.beginPath()
  context.moveTo(width * 0.18, top)
  context.lineTo(width * 0.18, ground)
  context.stroke()
  context.setLineDash([])

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'right'
  context.fillText(`${props.height.toFixed(1)} m`, width * 0.18 - 8, top + 4)
  context.fillText('0 m', width * 0.18 - 8, ground - 4)

  const altitude = heightAboveGround(props.height, props.g, props.time, props.v0)
  const ballY = toY(altitude)
  const leftX = width * 0.42
  const rightX = width * 0.62

  drawBall(context, leftX, ballY, 14, '#1d4ed8', '球 A')
  if (props.showTwin) {
    drawBall(context, rightX, ballY, 20, '#c2410c', '球 B（更重）')
  }

  if (!props.landed && props.velocity > 0.2) {
    const arrow = Math.min(50, props.velocity * 3)
    context.strokeStyle = '#dc2626'
    context.fillStyle = '#dc2626'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(leftX, ballY + 18)
    context.lineTo(leftX, ballY + 18 + arrow)
    context.stroke()
    context.beginPath()
    context.moveTo(leftX, ballY + 18 + arrow)
    context.lineTo(leftX - 5, ballY + 18 + arrow - 10)
    context.lineTo(leftX + 5, ballY + 18 + arrow - 10)
    context.closePath()
    context.fill()
  }

  context.fillStyle = '#0f172a'
  context.textAlign = 'left'
  context.font = '12px sans-serif'
  context.fillText(
    props.showTwin ? '忽略空气阻力时，质量不同的两球同时落地' : '自由落体：只受重力，初速度为 0',
    12,
    20,
  )
  if (props.landed) {
    context.fillStyle = '#c2410c'
    context.fillText('已落地', 12, 40)
  }
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
    props.height,
    props.g,
    props.v0,
    props.time,
    props.duration,
    props.velocity,
    props.showTwin,
    props.landed,
  ],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="stage" aria-label="自由落体动画" />
</template>

<style scoped>
.stage {
  display: block;
  width: 100%;
  height: 320px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
