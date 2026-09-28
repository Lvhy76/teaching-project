<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  SUPERPOSITION_BOUNDS,
  type ForceVector,
  type PointCharge,
} from '@/utils/forceSuperposition'

const props = defineProps<{
  test: PointCharge
  sources: PointCharge[]
  components: ForceVector[]
  netFx: number
  netFy: number
  netMagnitude: number
  activeId: string
}>()

const emit = defineEmits<{
  move: [id: string, x: number, y: number]
  select: [id: string]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null
let draggingId: string | null = null

function worldToScreen(x: number, y: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = SUPERPOSITION_BOUNDS
  // 等比例缩放，保证世界原点（圆心）落在画布正中心
  const scale = Math.min(
    (width - 72) / (maxX - minX),
    (height - 72) / (maxY - minY),
  )
  return { sx: width / 2 + x * scale, sy: height / 2 - y * scale }
}

function screenToWorld(sx: number, sy: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = SUPERPOSITION_BOUNDS
  const scale = Math.min(
    (width - 72) / (maxX - minX),
    (height - 72) / (maxY - minY),
  )
  return { x: (sx - width / 2) / scale, y: (height / 2 - sy) / scale }
}

function forceScale(magnitude: number): number {
  if (magnitude < 1e-12) return 0
  // 对数压缩，像素长度约 48–160，便于课堂看清方向
  return 48 + Math.min(112, Math.log10(magnitude + 1) * 42)
}

function drawArrow(
  context: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  fx: number,
  fy: number,
  color: string,
  lineWidth: number,
  label?: string,
) {
  const mag = Math.hypot(fx, fy)
  if (mag < 1e-12) return
  const len = forceScale(mag)
  const ux = fx / mag
  const uy = fy / mag
  // 屏幕 y 向下，世界 y 向上 → 翻转 fy
  const x1 = x0 + ux * len
  const y1 = y0 - uy * len

  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = lineWidth
  context.beginPath()
  context.moveTo(x0, y0)
  context.lineTo(x1, y1)
  context.stroke()
  const ang = Math.atan2(y1 - y0, x1 - x0)
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x1 - 9 * Math.cos(ang - 0.4), y1 - 9 * Math.sin(ang - 0.4))
  context.lineTo(x1 - 9 * Math.cos(ang + 0.4), y1 - 9 * Math.sin(ang + 0.4))
  context.closePath()
  context.fill()

  if (label) {
    context.font = 'bold 12px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'bottom'
    context.fillText(label, x0 + ux * len * 0.55, y0 - uy * len * 0.55 - 6)
  }
}

function drawCharge(
  context: CanvasRenderingContext2D,
  charge: PointCharge,
  width: number,
  height: number,
  active: boolean,
) {
  const p = worldToScreen(charge.x, charge.y, width, height)
  const r = charge.id === 'q' ? 18 : 16
  const fill =
    Math.abs(charge.q) < 1e-20
      ? '#94a3b8'
      : charge.q > 0
        ? '#dc2626'
        : '#2563eb'
  context.fillStyle = fill
  context.beginPath()
  context.arc(p.sx, p.sy, r, 0, Math.PI * 2)
  context.fill()
  if (active) {
    context.strokeStyle = charge.color
    context.lineWidth = 3
    context.beginPath()
    context.arc(p.sx, p.sy, r + 5, 0, Math.PI * 2)
    context.stroke()
  }
  context.fillStyle = '#fff'
  context.font = 'bold 13px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const mark = Math.abs(charge.q) < 1e-20 ? '0' : charge.q > 0 ? '+' : '−'
  context.fillText(mark, p.sx, p.sy)
  context.fillStyle = '#0f172a'
  context.font = 'bold 12px sans-serif'
  context.textBaseline = 'alphabetic'
  context.fillText(charge.label, p.sx, p.sy - r - 6)
  return p
}

function hitTest(sx: number, sy: number, width: number, height: number): string | null {
  const candidates: { id: string; x: number; y: number }[] = [
    { id: 'test', x: props.test.x, y: props.test.y },
    ...props.sources.map((s) => ({ id: s.id, x: s.x, y: s.y })),
  ]
  let best: string | null = null
  let bestD = 22
  for (const c of candidates) {
    const p = worldToScreen(c.x, c.y, width, height)
    const d = Math.hypot(sx - p.sx, sy - p.sy)
    if (d <= bestD) {
      bestD = d
      best = c.id
    }
  }
  return best
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

  // 网格
  context.strokeStyle = '#e2e8f0'
  context.lineWidth = 1
  const origin = worldToScreen(0, 0, width, height)
  context.beginPath()
  context.moveTo(20, origin.sy)
  context.lineTo(width - 20, origin.sy)
  context.moveTo(origin.sx, 20)
  context.lineTo(origin.sx, height - 20)
  context.stroke()

  // 源电荷 → 试探电荷虚线
  const testScreen = worldToScreen(props.test.x, props.test.y, width, height)
  for (const source of props.sources) {
    const s = worldToScreen(source.x, source.y, width, height)
    context.strokeStyle = `${source.color}55`
    context.setLineDash([4, 4])
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(s.sx, s.sy)
    context.lineTo(testScreen.sx, testScreen.sy)
    context.stroke()
    context.setLineDash([])
  }

  for (const source of props.sources) {
    drawCharge(context, source, width, height, props.activeId === source.id)
  }
  drawCharge(context, props.test, width, height, props.activeId === 'test')

  // 分力（细）
  for (const f of props.components) {
    drawArrow(context, testScreen.sx, testScreen.sy, f.fx, f.fy, f.color, 2, f.label)
  }
  // 合力（粗）
  if (props.netMagnitude > 1e-12) {
    drawArrow(
      context,
      testScreen.sx,
      testScreen.sy,
      props.netFx,
      props.netFy,
      '#0f172a',
      3.5,
      'F合',
    )
  }

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.fillText('试探电荷 q 在圆心；拖动电荷 · 彩色为分力，黑色为合力', 14, 22)
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

function onPointerDown(event: PointerEvent) {
  const pos = pointerPos(event)
  if (!pos) return
  const hit = hitTest(pos.sx, pos.sy, pos.width, pos.height)
  if (!hit) return
  draggingId = hit
  emit('select', hit)
  canvasRef.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!draggingId) return
  const pos = pointerPos(event)
  if (!pos) return
  const world = screenToWorld(pos.sx, pos.sy, pos.width, pos.height)
  emit('move', draggingId, world.x, world.y)
}

function onPointerUp(event: PointerEvent) {
  draggingId = null
  try {
    canvasRef.value?.releasePointerCapture(event.pointerId)
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  observer = new ResizeObserver(() => draw())
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  draw()
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
  () => [
    props.test,
    props.sources,
    props.components,
    props.netFx,
    props.netFy,
    props.netMagnitude,
    props.activeId,
  ],
  () => draw(),
  { deep: true },
)
</script>

<template>
  <canvas
    ref="canvasRef"
    class="canvas"
    role="img"
    aria-label="多点电荷静电力叠加示意"
  />
</template>

<style scoped>
.canvas {
  display: block;
  width: 100%;
  height: min(54vh, 440px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
  touch-action: none;
  cursor: grab;
}
</style>
