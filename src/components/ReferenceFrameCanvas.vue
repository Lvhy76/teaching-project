<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  CAR_HALF_LENGTH,
  PLANE_OFFSET,
  positionInFrame,
  type FrameId,
} from '@/utils/referenceFrame'

const props = defineProps<{
  frame: FrameId
  time: number
  duration: number
  vCar: number
  vWalk: number
  vPlane: number
  vCarRel: number
  vPerson: number
  vPlaneRel: number
  showParticle: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function scene() {
  return { vCar: props.vCar, vWalk: props.vWalk, vPlane: props.vPlane }
}

function drawCar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  halfLength: number,
  selected: boolean,
) {
  const width = halfLength * 2 * scale
  const height = 34
  const left = x - width / 2
  const top = y - height
  context.fillStyle = '#1d4ed8'
  context.beginPath()
  context.moveTo(left + 6, top)
  context.lineTo(left + width - 6, top)
  context.quadraticCurveTo(left + width, top, left + width, top + 6)
  context.lineTo(left + width, top + height)
  context.lineTo(left, top + height)
  context.lineTo(left, top + 6)
  context.quadraticCurveTo(left, top, left + 6, top)
  context.closePath()
  context.fill()
  context.fillStyle = '#bfdbfe'
  context.fillRect(left + width * 0.18, top + 8, width * 0.22, 12)
  context.fillRect(left + width * 0.48, top + 8, width * 0.28, 12)
  context.fillStyle = '#0f172a'
  context.beginPath()
  context.arc(left + 16, y - 4, 6, 0, Math.PI * 2)
  context.arc(left + width - 16, y - 4, 6, 0, Math.PI * 2)
  context.fill()
  if (selected) {
    context.strokeStyle = '#b45309'
    context.lineWidth = 2
    context.strokeRect(left - 6, top - 6, width + 12, height + 14)
  }
}

function drawPlane(context: CanvasRenderingContext2D, x: number, y: number, selected: boolean) {
  context.fillStyle = '#0f766e'
  context.beginPath()
  context.moveTo(x - 38, y)
  context.lineTo(x + 42, y)
  context.lineTo(x + 28, y - 8)
  context.lineTo(x - 18, y - 8)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(x - 4, y - 6)
  context.lineTo(x + 18, y - 22)
  context.lineTo(x + 10, y - 6)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(x - 22, y)
  context.lineTo(x - 34, y + 10)
  context.lineTo(x - 12, y)
  context.closePath()
  context.fill()
  if (selected) {
    context.strokeStyle = '#b45309'
    context.lineWidth = 2
    context.strokeRect(x - 44, y - 26, 92, 42)
  }
}

function drawPerson(context: CanvasRenderingContext2D, x: number, y: number, asParticle: boolean) {
  if (asParticle) {
    context.fillStyle = '#dc2626'
    context.beginPath()
    context.arc(x, y - 14, 8, 0, Math.PI * 2)
    context.fill()
    context.font = '12px sans-serif'
    context.textAlign = 'center'
    context.fillText('质点', x, y - 28)
    return
  }

  context.strokeStyle = '#b45309'
  context.fillStyle = '#b45309'
  context.lineWidth = 2.5
  context.beginPath()
  context.arc(x, y - 26, 5, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.moveTo(x, y - 21)
  context.lineTo(x, y - 8)
  context.moveTo(x, y - 18)
  context.lineTo(x - 7, y - 12)
  context.moveTo(x, y - 18)
  context.lineTo(x + 7, y - 12)
  context.moveTo(x, y - 8)
  context.lineTo(x - 6, y)
  context.moveTo(x, y - 8)
  context.lineTo(x + 6, y)
  context.stroke()
}

function drawArrow(context: CanvasRenderingContext2D, x: number, y: number, vx: number) {
  if (Math.abs(vx) < 0.15) return
  const length = Math.sign(vx) * Math.min(64, Math.max(16, Math.abs(vx) * 2.4))
  context.strokeStyle = '#dc2626'
  context.fillStyle = '#dc2626'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(x, y)
  context.lineTo(x + length, y)
  context.stroke()
  context.beginPath()
  context.moveTo(x + length, y)
  context.lineTo(x + length - Math.sign(length) * 8, y - 4)
  context.lineTo(x + length - Math.sign(length) * 8, y + 4)
  context.closePath()
  context.fill()
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
  sky.addColorStop(0.55, '#f8fafc')
  sky.addColorStop(1, '#e2e8f0')
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)

  const ground = height * 0.78
  const at = (time: number) => positionInFrame(props.frame, scene(), time)
  const start = at(0)
  const end = at(props.duration)
  const now = at(props.time)

  let scale = 8
  let toX = (frameX: number) => width / 2 + frameX * scale
  if (props.frame === 'ground') {
    const samples = [start.person, start.car, start.plane, end.person, end.car, end.plane]
    const min = Math.min(...samples) - CAR_HALF_LENGTH - 4
    const max = Math.max(...samples) + CAR_HALF_LENGTH + 4
    scale = (width - 48) / Math.max(max - min, 1)
    toX = (frameX: number) => 24 + (frameX - min) * scale
  } else if (props.frame === 'car') {
    scale = Math.min(16, (width * 0.22) / (CAR_HALF_LENGTH + 1))
  } else {
    const reach = Math.max(18, Math.abs(end.car), Math.abs(end.person), Math.abs(start.car))
    scale = Math.min(12, (width * 0.36) / reach)
  }

  context.fillStyle = '#86efac'
  context.fillRect(0, ground - 18, width, 18)
  context.fillStyle = '#64748b'
  context.fillRect(0, ground, width, height - ground)

  context.strokeStyle = props.frame === 'ground' ? '#f8fafc' : '#cbd5e1'
  context.setLineDash([10, 12])
  context.beginPath()
  context.moveTo(0, ground + 10)
  context.lineTo(width, ground + 10)
  context.stroke()
  context.setLineDash([])

  const spacing = 18
  const originWorld = props.frame === 'car'
    ? props.vCar * props.time
    : props.frame === 'plane'
      ? PLANE_OFFSET + props.vPlane * props.time
      : 0
  const halfView = width / scale + spacing * 2
  const worldStart = Math.floor((originWorld - halfView) / spacing) * spacing
  context.fillStyle = props.frame === 'ground' ? '#166534' : '#15803d'
  for (let worldX = worldStart; worldX <= originWorld + halfView; worldX += spacing) {
    const screenX = toX(worldX - originWorld)
    if (screenX < -30 || screenX > width + 30) continue
    context.fillRect(screenX - 3, ground - 46, 6, 28)
    context.beginPath()
    context.arc(screenX, ground - 52, 12, 0, Math.PI * 2)
    context.fill()
  }

  context.strokeStyle = '#dc2626'
  context.lineWidth = 2
  context.beginPath()
  const steps = 40
  for (let index = 0; index <= steps; index += 1) {
    const sampleTime = (props.time * index) / steps
    const x = toX(at(sampleTime).person)
    const y = ground - 16
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.stroke()

  const planeX = toX(now.plane)
  const planeY = height * 0.28
  drawPlane(context, planeX, planeY, props.frame === 'plane')
  drawArrow(context, planeX, planeY - 28, props.vPlaneRel)

  const carX = toX(now.car)
  drawCar(context, carX, ground, scale, CAR_HALF_LENGTH, props.frame === 'car')
  drawArrow(context, carX, ground - 58, props.vCarRel)

  const personX = toX(now.person)
  drawPerson(context, personX, ground, props.showParticle)
  drawArrow(context, personX, ground - 46, props.vPerson)

  context.font = '12px sans-serif'
  context.textAlign = 'center'
  context.fillStyle = '#0f766e'
  context.fillText(props.frame === 'plane' ? '飞机 · 参考系' : '飞机', planeX, planeY + 22)
  context.fillStyle = '#1e3a8a'
  context.fillText(props.frame === 'car' ? '汽车 · 参考系' : '汽车', carX, ground + 28)
  if (props.frame === 'ground') {
    context.fillStyle = '#166534'
    context.textAlign = 'left'
    context.fillText('地面 · 参考系', 12, height - 12)
  }

  context.fillStyle = '#1e3a8a'
  context.textAlign = 'left'
  context.font = '12px sans-serif'
  const labels: Record<FrameId, string> = {
    ground: '当前参考系：地面。红点轨迹沿路面伸长，树木不动。',
    car: '当前参考系：汽车。车厢不动，红点只在车内移动，树木向后。',
    plane: '当前参考系：飞机。飞机不动，红点和汽车都向后运动。',
  }
  context.fillText(labels[props.frame], 12, 22)
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
    props.frame,
    props.time,
    props.duration,
    props.vCar,
    props.vWalk,
    props.vPlane,
    props.vCarRel,
    props.vPerson,
    props.vPlaneRel,
    props.showParticle,
  ],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="stage" aria-label="质点与参考系动画" />
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
