<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { positionAt, TURN_TIME } from '@/utils/timeDisplacement'

const props = defineProps<{
  time: number
  duration: number
  t1: number
  t2: number
  x1: number
  x2: number
  displacement: number
  pathLength: number
  inInterval: boolean
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

  const left = 40
  const right = width - 40
  const trackY = height * 0.68
  const xMin = -0.5
  const xMax = Math.max(8.5, Math.abs(positionAt(TURN_TIME)) + 0.5)
  const toX = (x: number) => left + ((x - xMin) / (xMax - xMin)) * (right - left)

  context.strokeStyle = '#94a3b8'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(left, trackY)
  context.lineTo(right, trackY)
  context.stroke()

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'center'
  for (const mark of [0, 4, 8]) {
    const x = toX(mark)
    context.beginPath()
    context.moveTo(x, trackY - 6)
    context.lineTo(x, trackY + 6)
    context.stroke()
    context.fillText(`${mark} m`, x, trackY + 22)
  }
  context.fillText('x', (left + right) / 2, trackY + 38)

  const turnX = toX(positionAt(TURN_TIME))
  context.fillStyle = '#f59e0b'
  context.fillRect(turnX - 2, trackY - 28, 4, 18)
  context.font = '11px sans-serif'
  context.fillText('折返', turnX, trackY - 34)

  const low = Math.min(props.t1, props.t2)
  const high = Math.max(props.t1, props.t2)
  const samples = 60
  context.strokeStyle = '#ea580c'
  context.lineWidth = 4
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  for (let index = 0; index <= samples; index += 1) {
    const sampleTime = low + ((high - low) * index) / samples
    const progress = index / samples
    const x = toX(positionAt(sampleTime))
    const y = trackY - 14 - progress * 36
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.stroke()

  const startX = toX(props.x1)
  const endX = toX(props.x2)
  context.strokeStyle = '#2563eb'
  context.fillStyle = '#2563eb'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(startX, trackY - 56)
  context.lineTo(endX, trackY - 56)
  context.stroke()
  if (Math.abs(endX - startX) > 8) {
    const dir = Math.sign(endX - startX) || 1
    context.beginPath()
    context.moveTo(endX, trackY - 56)
    context.lineTo(endX - dir * 10, trackY - 62)
    context.lineTo(endX - dir * 10, trackY - 50)
    context.closePath()
    context.fill()
  } else {
    context.beginPath()
    context.arc((startX + endX) / 2, trackY - 56, 4, 0, Math.PI * 2)
    context.fill()
  }
  context.font = '12px sans-serif'
  context.textAlign = 'center'
  context.fillText('位移 Δx', (startX + endX) / 2 || startX, trackY - 66)

  context.fillStyle = '#dc2626'
  context.beginPath()
  context.arc(startX, trackY, 5, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.arc(endX, trackY, 5, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#991b1b'
  context.fillText('t₁', startX, trackY + 36)
  context.fillText('t₂', endX, trackY + 36)

  const nowX = toX(positionAt(props.time))
  context.fillStyle = props.inInterval ? '#1d4ed8' : '#334155'
  context.fillRect(nowX - 14, trackY - 22, 28, 16)
  context.fillStyle = '#0f172a'
  context.beginPath()
  context.arc(nowX - 8, trackY + 2, 4, 0, Math.PI * 2)
  context.arc(nowX + 8, trackY + 2, 4, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#0f172a'
  context.textAlign = 'left'
  context.font = '12px sans-serif'
  context.fillText('橙色曲线：所选时间内走过的路程（随时间展开，避免往返重叠）', 12, 20)
  context.fillText('蓝色箭头：从 t₁ 位置指向 t₂ 位置的位移', 12, 38)
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
    props.time,
    props.duration,
    props.t1,
    props.t2,
    props.x1,
    props.x2,
    props.displacement,
    props.pathLength,
    props.inInterval,
  ],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="stage" aria-label="位移与路程对比" />
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
