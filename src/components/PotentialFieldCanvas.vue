<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { FIELD_BOUNDS } from '@/stores/electricPotential'
import { potentialAt, type PointCharge } from '@/utils/electricPotential'

const props = defineProps<{
  source: PointCharge
  test: PointCharge
  phi: number
  energy: number
}>()

const emit = defineEmits<{
  move: [x: number, y: number]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null
let dragging = false

function worldToScreen(x: number, y: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = FIELD_BOUNDS
  const sx = ((x - minX) / (maxX - minX)) * width
  const sy = height - ((y - minY) / (maxY - minY)) * height
  return { sx, sy }
}

function screenToWorld(sx: number, sy: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = FIELD_BOUNDS
  const x = minX + (sx / width) * (maxX - minX)
  const y = minY + ((height - sy) / height) * (maxY - minY)
  return { x, y }
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

  const origin = worldToScreen(0, 0, width, height)

  // 等势线（圆）
  const levels = [0.08, 0.12, 0.16, 0.22, 0.28]
  context.strokeStyle = 'rgba(37, 99, 235, 0.25)'
  context.lineWidth = 1
  for (const r of levels) {
    const p = worldToScreen(r, 0, width, height)
    const radius = Math.abs(p.sx - origin.sx)
    context.beginPath()
    context.arc(origin.sx, origin.sy, radius, 0, Math.PI * 2)
    context.stroke()
    const phi = potentialAt(props.source, r, 0)
    if (Number.isFinite(phi)) {
      context.fillStyle = 'rgba(37, 99, 235, 0.65)'
      context.font = '11px sans-serif'
      context.textAlign = 'left'
      context.fillText(`φ≈${(phi / 1000).toFixed(0)} kV`, origin.sx + radius + 4, origin.sy - 4)
    }
  }

  // 坐标轴
  context.strokeStyle = '#94a3b8'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(20, origin.sy)
  context.lineTo(width - 20, origin.sy)
  context.moveTo(origin.sx, 20)
  context.lineTo(origin.sx, height - 20)
  context.stroke()

  // 源电荷 Q
  context.fillStyle = props.source.q >= 0 ? '#dc2626' : '#2563eb'
  context.beginPath()
  context.arc(origin.sx, origin.sy, 16, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#fff'
  context.font = 'bold 14px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(props.source.q >= 0 ? 'Q+' : 'Q−', origin.sx, origin.sy)

  // 连线
  const testScreen = worldToScreen(props.test.x, props.test.y, width, height)
  context.strokeStyle = '#cbd5e1'
  context.setLineDash([4, 4])
  context.beginPath()
  context.moveTo(origin.sx, origin.sy)
  context.lineTo(testScreen.sx, testScreen.sy)
  context.stroke()
  context.setLineDash([])

  // 试探电荷 q
  context.fillStyle = props.test.q >= 0 ? '#ea580c' : '#0ea5e9'
  context.beginPath()
  context.arc(testScreen.sx, testScreen.sy, 14, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = dragging ? '#1d4ed8' : '#fff'
  context.lineWidth = 2
  context.stroke()
  context.fillStyle = '#fff'
  context.font = 'bold 12px sans-serif'
  context.fillText(props.test.q >= 0 ? 'q+' : 'q−', testScreen.sx, testScreen.sy)

  context.fillStyle = '#0f172a'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  context.fillText('拖动橙色试探电荷，观察 Ep 与 φ 的变化', 12, 22)
  context.fillStyle = '#64748b'
  context.fillText('蓝色虚圆：等势线示意（取源电荷为正时）', 12, 40)
}

function pointerPos(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return {
    sx: event.clientX - rect.left,
    sy: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  }
}

function hitTest(sx: number, sy: number, width: number, height: number) {
  const p = worldToScreen(props.test.x, props.test.y, width, height)
  return Math.hypot(sx - p.sx, sy - p.sy) <= 18
}

function onPointerDown(event: PointerEvent) {
  const pos = pointerPos(event)
  if (!pos) return
  if (!hitTest(pos.sx, pos.sy, pos.width, pos.height)) return
  dragging = true
  canvasRef.value?.setPointerCapture(event.pointerId)
  draw()
}

function onPointerMove(event: PointerEvent) {
  if (!dragging) return
  const pos = pointerPos(event)
  if (!pos) return
  const world = screenToWorld(pos.sx, pos.sy, pos.width, pos.height)
  emit('move', world.x, world.y)
}

function onPointerUp(event: PointerEvent) {
  if (!dragging) return
  dragging = false
  canvasRef.value?.releasePointerCapture(event.pointerId)
  draw()
}

onMounted(() => {
  draw()
  const canvas = canvasRef.value
  if (!canvas) return
  observer = new ResizeObserver(() => draw())
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
})

onUnmounted(() => {
  observer?.disconnect()
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.removeEventListener('pointerdown', onPointerDown)
  canvas.removeEventListener('pointermove', onPointerMove)
  canvas.removeEventListener('pointerup', onPointerUp)
  canvas.removeEventListener('pointercancel', onPointerUp)
})

watch(
  () => [props.source.q, props.test.x, props.test.y, props.test.q, props.phi, props.energy],
  () => draw(),
)
</script>

<template>
  <canvas
    ref="canvasRef"
    class="stage"
    aria-label="拖拽试探电荷观察电势与电势能"
  />
</template>

<style scoped>
.stage {
  display: block;
  width: 100%;
  height: 340px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
  touch-action: none;
  cursor: grab;
}

.stage:active {
  cursor: grabbing;
}
</style>
