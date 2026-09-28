<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { positionAt, type KinematicsParams } from '@/utils/accelerationLesson'

const props = defineProps<{
  params: KinematicsParams
  time: number
  duration: number
  velocity: number
  changeLabel: string
  relationText: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function range(): { min: number; max: number } {
  let min = props.params.x0
  let max = props.params.x0
  for (let index = 0; index <= 40; index += 1) {
    const value = positionAt(props.params, (props.duration * index) / 40)
    min = Math.min(min, value)
    max = Math.max(max, value)
  }
  if (max - min < 1) {
    min -= 0.5
    max += 0.5
  }
  const pad = (max - min) * 0.14
  return { min: min - pad, max: max + pad }
}

function drawArrow(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  scale: number,
  color: string,
  label: string,
) {
  if (Math.abs(value) < 0.05) {
    context.fillStyle = color
    context.font = '12px sans-serif'
    context.textAlign = 'center'
    context.fillText(`${label}=0`, x, y - 4)
    return
  }
  const length = Math.sign(value) * Math.min(90, Math.max(22, Math.abs(value) * scale))
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(x, y)
  context.lineTo(x + length, y)
  context.stroke()
  context.beginPath()
  context.moveTo(x + length, y)
  context.lineTo(x + length - Math.sign(length) * 10, y - 5)
  context.lineTo(x + length - Math.sign(length) * 10, y + 5)
  context.closePath()
  context.fill()
  context.font = '12px sans-serif'
  context.textAlign = 'center'
  context.fillText(label, x + length / 2, y - 10)
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

  const bounds = range()
  const left = 28
  const right = width - 28
  const ground = height * 0.72
  const toX = (x: number) =>
    left + ((x - bounds.min) / (bounds.max - bounds.min)) * (right - left)

  context.strokeStyle = '#94a3b8'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(left, ground)
  context.lineTo(right, ground)
  context.stroke()

  const currentX = toX(positionAt(props.params, props.time))
  const cartWidth = 52
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

  drawArrow(context, currentX, cartTop - 18, props.velocity, 12, '#dc2626', 'v')
  drawArrow(context, currentX, cartTop - 48, props.params.acceleration, 28, '#ea580c', 'a')

  context.fillStyle = '#0f172a'
  context.textAlign = 'left'
  context.font = '12px sans-serif'
  context.fillText(props.relationText, 12, 22)
  context.fillStyle = '#1d4ed8'
  context.fillText(props.changeLabel, 12, 42)
  context.fillStyle = '#64748b'
  context.fillText('红箭头：速度 v；橙箭头：加速度 a', 12, height - 12)
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
    props.velocity,
    props.changeLabel,
    props.relationText,
  ],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="stage" aria-label="加速度与速度方向" />
</template>

<style scoped>
.stage {
  display: block;
  width: 100%;
  height: 260px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
