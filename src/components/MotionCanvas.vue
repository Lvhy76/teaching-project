<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { positionAt, type KinematicsParams } from '@/utils/kinematics'

const props = defineProps<{
  params: KinematicsParams
  time: number
  duration: number
  velocity: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function positionRange(): { min: number; max: number } {
  const start = props.params.x0
  let reach = 0.5
  const steps = 40
  for (let index = 0; index <= steps; index += 1) {
    const value = positionAt(props.params, (props.duration * index) / steps)
    reach = Math.max(reach, Math.abs(value - start))
  }
  const span = reach * 1.2
  return { min: start - span, max: start + span }
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

  const range = positionRange()
  const left = 28
  const right = width - 28
  const toX = (position: number) =>
    left + ((position - range.min) / (range.max - range.min)) * (right - left)
  const ground = height * 0.68

  context.strokeStyle = '#94a3b8'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(left, ground)
  context.lineTo(right, ground)
  context.stroke()

  const startX = toX(props.params.x0)
  context.strokeStyle = '#64748b'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(startX, ground - 10)
  context.lineTo(startX, ground + 10)
  context.stroke()

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'center'
  context.fillText(`${range.min.toFixed(1)} m`, left, ground + 22)
  context.fillText(`${props.params.x0.toFixed(1)} m`, startX, ground + 22)
  context.fillText(`${range.max.toFixed(1)} m`, right, ground + 22)

  const currentX = toX(positionAt(props.params, props.time))
  const cartWidth = 54
  const cartHeight = 28
  const cartLeft = currentX - cartWidth / 2
  const cartTop = ground - cartHeight - 8

  context.fillStyle = '#1d4ed8'
  context.fillRect(cartLeft, cartTop, cartWidth, cartHeight)
  context.fillStyle = '#0f172a'
  context.beginPath()
  context.arc(cartLeft + 14, ground - 6, 5, 0, Math.PI * 2)
  context.arc(cartLeft + cartWidth - 14, ground - 6, 5, 0, Math.PI * 2)
  context.fill()

  const arrow = Math.max(-70, Math.min(70, props.velocity * 8))
  if (Math.abs(arrow) > 4) {
    context.strokeStyle = '#dc2626'
    context.fillStyle = '#dc2626'
    context.lineWidth = 2
    const y = cartTop - 16
    context.beginPath()
    context.moveTo(currentX, y)
    context.lineTo(currentX + arrow, y)
    context.stroke()
    context.beginPath()
    context.moveTo(currentX + arrow, y)
    context.lineTo(currentX + arrow - Math.sign(arrow) * 8, y - 4)
    context.lineTo(currentX + arrow - Math.sign(arrow) * 8, y + 4)
    context.closePath()
    context.fill()
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
  () => [props.params.v0, props.params.acceleration, props.params.x0, props.time, props.duration, props.velocity],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="stage" aria-label="匀变速直线运动动画" />
</template>

<style scoped>
.stage {
  display: block;
  width: 100%;
  height: 280px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
