<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  PD_BOUNDS,
  EQUIPOTENTIAL_RADII,
  UNIFORM_EQUIPOTENTIAL_X,
  potentialAt,
  uniformPotential,
  type FieldMode,
  type PointCharge,
  type ProbeId,
  type ProbePoint,
} from '@/utils/potentialDifference'

const props = defineProps<{
  fieldMode: FieldMode
  source: PointCharge
  fieldE: number
  pointA: ProbePoint
  pointB: ProbePoint
  activeProbe: ProbeId
  phiA: number
  phiB: number
}>()

const emit = defineEmits<{
  move: [x: number, y: number]
  'select-probe': [id: ProbeId]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null
let dragging = false

function worldToScreen(x: number, y: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = PD_BOUNDS
  const sx = ((x - minX) / (maxX - minX)) * width
  const sy = height - ((y - minY) / (maxY - minY)) * height
  return { sx, sy }
}

function screenToWorld(sx: number, sy: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = PD_BOUNDS
  const x = minX + (sx / width) * (maxX - minX)
  const y = minY + ((height - sy) / height) * (maxY - minY)
  return { x, y }
}

function formatKv(phi: number): string {
  if (!Number.isFinite(phi)) return '∞'
  const abs = Math.abs(phi)
  const sign = phi < 0 ? '-' : ''
  if (abs >= 1e3) return `${sign}${(abs / 1000).toFixed(0)} kV`
  return `${sign}${abs.toFixed(0)} V`
}

function hitProbe(sx: number, sy: number, width: number, height: number): ProbeId | null {
  const a = worldToScreen(props.pointA.x, props.pointA.y, width, height)
  const b = worldToScreen(props.pointB.x, props.pointB.y, width, height)
  const da = Math.hypot(sx - a.sx, sy - a.sy)
  const db = Math.hypot(sx - b.sx, sy - b.sy)
  const hitR = 16
  if (da <= hitR && da <= db) return 'A'
  if (db <= hitR) return 'B'
  return null
}

function drawCircleEquipotential(
  context: CanvasRenderingContext2D,
  origin: { sx: number; sy: number },
  radiusPx: number,
  color: string,
  lineWidth: number,
  label?: string,
) {
  context.strokeStyle = color
  context.lineWidth = lineWidth
  context.beginPath()
  context.arc(origin.sx, origin.sy, radiusPx, 0, Math.PI * 2)
  context.stroke()
  if (label) {
    context.fillStyle = color
    context.font = '11px sans-serif'
    context.textAlign = 'left'
    context.textBaseline = 'bottom'
    context.fillText(label, origin.sx + radiusPx + 4, origin.sy - 2)
  }
}

function drawVerticalEquipotential(
  context: CanvasRenderingContext2D,
  x: number,
  width: number,
  height: number,
  color: string,
  lineWidth: number,
  label?: string,
) {
  const top = worldToScreen(x, PD_BOUNDS.maxY, width, height)
  const bottom = worldToScreen(x, PD_BOUNDS.minY, width, height)
  context.strokeStyle = color
  context.lineWidth = lineWidth
  context.beginPath()
  context.moveTo(top.sx, top.sy)
  context.lineTo(bottom.sx, bottom.sy)
  context.stroke()
  if (label) {
    context.fillStyle = color
    context.font = '11px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillText(label, top.sx, 8)
  }
}

function drawProbe(
  context: CanvasRenderingContext2D,
  point: ProbePoint,
  width: number,
  height: number,
  label: ProbeId,
  active: boolean,
  color: string,
) {
  const p = worldToScreen(point.x, point.y, width, height)
  context.fillStyle = color
  context.beginPath()
  context.arc(p.sx, p.sy, active ? 12 : 10, 0, Math.PI * 2)
  context.fill()
  if (active) {
    context.strokeStyle = color
    context.lineWidth = 2
    context.beginPath()
    context.arc(p.sx, p.sy, 16, 0, Math.PI * 2)
    context.stroke()
  }
  context.fillStyle = '#fff'
  context.font = 'bold 12px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(label, p.sx, p.sy)
}

function drawPointField(context: CanvasRenderingContext2D, width: number, height: number) {
  const origin = worldToScreen(0, 0, width, height)
  const scaleX = width / (PD_BOUNDS.maxX - PD_BOUNDS.minX)

  for (const r of EQUIPOTENTIAL_RADII) {
    const phi = potentialAt(props.source, r, 0)
    drawCircleEquipotential(
      context,
      origin,
      r * scaleX,
      'rgba(37, 99, 235, 0.22)',
      1,
      Number.isFinite(phi) ? `φ≈${formatKv(phi)}` : undefined,
    )
  }

  const rA = Math.hypot(props.pointA.x, props.pointA.y)
  const rB = Math.hypot(props.pointB.x, props.pointB.y)
  drawCircleEquipotential(
    context,
    origin,
    rA * scaleX,
    'rgba(220, 38, 38, 0.85)',
    2.5,
    `过A · ${formatKv(props.phiA)}`,
  )
  drawCircleEquipotential(
    context,
    origin,
    rB * scaleX,
    'rgba(22, 163, 74, 0.85)',
    2.5,
    `过B · ${formatKv(props.phiB)}`,
  )

  context.strokeStyle = 'rgba(148, 163, 184, 0.45)'
  context.lineWidth = 1
  for (let i = 0; i < 8; i += 1) {
    const ang = (i / 8) * Math.PI * 2
    const p0 = worldToScreen(0.05 * Math.cos(ang), 0.05 * Math.sin(ang), width, height)
    const p1 = worldToScreen(0.09 * Math.cos(ang), 0.09 * Math.sin(ang), width, height)
    const outward = props.source.q >= 0
    const from = outward ? p0 : p1
    const to = outward ? p1 : p0
    context.beginPath()
    context.moveTo(from.sx, from.sy)
    context.lineTo(to.sx, to.sy)
    context.stroke()
  }

  context.fillStyle = props.source.q >= 0 ? '#dc2626' : '#2563eb'
  context.beginPath()
  context.arc(origin.sx, origin.sy, 15, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#fff'
  context.font = 'bold 13px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(props.source.q >= 0 ? 'Q+' : 'Q−', origin.sx, origin.sy)
}

function drawUniformField(context: CanvasRenderingContext2D, width: number, height: number) {
  const left = worldToScreen(PD_BOUNDS.minX + 0.02, PD_BOUNDS.maxY - 0.02, width, height)
  const right = worldToScreen(PD_BOUNDS.maxX - 0.02, PD_BOUNDS.minY + 0.02, width, height)
  context.fillStyle = 'rgba(219, 234, 254, 0.4)'
  context.fillRect(left.sx, left.sy, right.sx - left.sx, right.sy - left.sy)

  // 平行板示意
  context.fillStyle = '#64748b'
  context.fillRect(left.sx - 8, left.sy, 8, right.sy - left.sy)
  context.fillRect(right.sx, left.sy, 8, right.sy - left.sy)
  context.fillStyle = '#0f172a'
  context.font = 'bold 12px sans-serif'
  context.textAlign = 'center'
  context.fillText(props.fieldE >= 0 ? '+' : '−', left.sx - 4, left.sy - 8)
  context.fillText(props.fieldE >= 0 ? '−' : '+', right.sx + 4, left.sy - 8)

  for (const x of UNIFORM_EQUIPOTENTIAL_X) {
    const phi = uniformPotential(props.fieldE, x)
    drawVerticalEquipotential(
      context,
      x,
      width,
      height,
      'rgba(37, 99, 235, 0.28)',
      1,
      `φ≈${formatKv(phi)}`,
    )
  }

  drawVerticalEquipotential(
    context,
    props.pointA.x,
    width,
    height,
    'rgba(220, 38, 38, 0.9)',
    2.5,
    `过A · ${formatKv(props.phiA)}`,
  )
  drawVerticalEquipotential(
    context,
    props.pointB.x,
    width,
    height,
    'rgba(22, 163, 74, 0.9)',
    2.5,
    `过B · ${formatKv(props.phiB)}`,
  )

  // 电场箭头
  context.strokeStyle = 'rgba(37, 99, 235, 0.45)'
  context.fillStyle = 'rgba(37, 99, 235, 0.55)'
  context.lineWidth = 1.5
  const dir = props.fieldE >= 0 ? 1 : -1
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x0 = PD_BOUNDS.minX + 0.08 + col * 0.14
      const y0 = PD_BOUNDS.minY + 0.06 + row * 0.1
      const x1 = x0 + dir * 0.06
      const p0 = worldToScreen(x0, y0, width, height)
      const p1 = worldToScreen(x1, y0, width, height)
      context.beginPath()
      context.moveTo(p0.sx, p0.sy)
      context.lineTo(p1.sx, p1.sy)
      context.stroke()
      context.beginPath()
      context.moveTo(p1.sx, p1.sy)
      context.lineTo(p1.sx - dir * 6, p1.sy - 4)
      context.lineTo(p1.sx - dir * 6, p1.sy + 4)
      context.closePath()
      context.fill()
    }
  }
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

  if (props.fieldMode === 'uniform') drawUniformField(context, width, height)
  else drawPointField(context, width, height)

  const origin = worldToScreen(0, 0, width, height)
  context.strokeStyle = '#94a3b8'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(16, origin.sy)
  context.lineTo(width - 16, origin.sy)
  context.moveTo(origin.sx, 16)
  context.lineTo(origin.sx, height - 16)
  context.stroke()

  const aScreen = worldToScreen(props.pointA.x, props.pointA.y, width, height)
  const bScreen = worldToScreen(props.pointB.x, props.pointB.y, width, height)
  context.strokeStyle = '#94a3b8'
  context.setLineDash([5, 4])
  context.beginPath()
  context.moveTo(aScreen.sx, aScreen.sy)
  context.lineTo(bScreen.sx, bScreen.sy)
  context.stroke()
  context.setLineDash([])

  drawProbe(context, props.pointA, width, height, 'A', props.activeProbe === 'A', '#dc2626')
  drawProbe(context, props.pointB, width, height, 'B', props.activeProbe === 'B', '#16a34a')

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  const tip =
    props.fieldMode === 'uniform'
      ? '等势面：竖直线（φ = −Ex）· 电场水平 · 拖动 A/B'
      : '等势面：同心圆（φ = kQ/r）· 电场线径向 · 拖动 A/B'
  context.fillText(tip, 12, height - 12)
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
  const hit = hitProbe(pos.sx, pos.sy, pos.width, pos.height)
  if (hit) {
    emit('select-probe', hit)
    dragging = true
    canvasRef.value?.setPointerCapture(event.pointerId)
    return
  }
  dragging = true
  canvasRef.value?.setPointerCapture(event.pointerId)
  const world = screenToWorld(pos.sx, pos.sy, pos.width, pos.height)
  emit('move', world.x, world.y)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging) return
  const pos = pointerPos(event)
  if (!pos) return
  const world = screenToWorld(pos.sx, pos.sy, pos.width, pos.height)
  emit('move', world.x, world.y)
}

function onPointerUp(event: PointerEvent) {
  dragging = false
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
    props.fieldMode,
    props.source,
    props.fieldE,
    props.pointA,
    props.pointB,
    props.activeProbe,
    props.phiA,
    props.phiB,
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
    aria-label="等势面与电势差点 A、B"
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
  cursor: crosshair;
}
</style>
