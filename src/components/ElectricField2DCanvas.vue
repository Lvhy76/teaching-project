<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  FIELD_2D_BOUNDS,
  length,
  projectOntoChargeAxes,
  type AxisForceComponent,
  type AxisProbeAxis,
  type FieldCharge,
  type FieldConfigId,
  type Vec3,
} from '@/utils/electricField'

const props = defineProps<{
  charges: FieldCharge[]
  fieldLines: Vec3[][]
  probe: Vec3
  eAtProbe: Vec3
  fAtProbe: Vec3
  showForce: boolean
  configId: FieldConfigId
  showAxisGuides: boolean
  showAxisFieldE: boolean
  axisProbePos: Vec3 | null
  axisForces: {
    components: AxisForceComponent[]
    netFx: number
    netFy: number
    netMag: number
  }
  axisForceScaleMag: number
  eAtAxisProbe: Vec3
  formatF: (value: number) => string
}>()

const emit = defineEmits<{
  'update:axis-probe': [axis: AxisProbeAxis, t: number]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null
let draggingAxisProbe = false

function worldToScreen(x: number, y: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = FIELD_2D_BOUNDS
  const scale = Math.min(
    (width - 48) / (maxX - minX),
    (height - 48) / (maxY - minY),
  )
  return {
    sx: width / 2 + x * scale,
    sy: height / 2 - y * scale,
    scale,
  }
}

function screenToWorld(sx: number, sy: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = FIELD_2D_BOUNDS
  const scale = Math.min(
    (width - 48) / (maxX - minX),
    (height - 48) / (maxY - minY),
  )
  return {
    x: (sx - width / 2) / scale,
    y: (height / 2 - sy) / scale,
  }
}

function drawArrow(
  context: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  vx: number,
  vy: number,
  pixelLen: number,
  color: string,
  label?: string,
  lineWidth = 2.5,
  head = 9,
) {
  const mag = Math.hypot(vx, vy)
  if (mag < 1e-12 || pixelLen < 2) return
  const ux = vx / mag
  const uy = vy / mag
  const x1 = x0 + ux * pixelLen
  const y1 = y0 - uy * pixelLen

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
  context.lineTo(x1 - head * Math.cos(ang - 0.4), y1 - head * Math.sin(ang - 0.4))
  context.lineTo(x1 - head * Math.cos(ang + 0.4), y1 - head * Math.sin(ang + 0.4))
  context.closePath()
  context.fill()

  if (label) {
    context.font = 'bold 11px sans-serif'
    context.textAlign = 'left'
    context.textBaseline = 'middle'
    context.fillText(label, x1 + 5, y1)
  }
}

function forceArrowLen(mag: number, scaleMag: number): number {
  if (scaleMag < 1e-18 || mag < 1e-18) return 0
  // 以中等位置 |F合| 为 1，课堂可见：典型处约 80–100px
  const ratio = Math.min(1.8, mag / scaleMag)
  return 28 + 72 * ratio
}

function drawCharge(
  context: CanvasRenderingContext2D,
  charge: FieldCharge,
  width: number,
  height: number,
) {
  const p = worldToScreen(charge.x, charge.y, width, height)
  const positive = charge.q >= 0
  const r = 16

  context.fillStyle = positive ? '#dc2626' : '#2563eb'
  context.beginPath()
  context.arc(p.sx, p.sy, r, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#ffffff'
  context.font = 'bold 18px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(positive ? '+' : '−', p.sx, p.sy + 1)
}

function drawAxisGuides(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  if (props.configId !== 'same' && props.configId !== 'opposite') return
  if (props.charges.length !== 2) return
  if (!props.showAxisGuides) return

  const a = props.charges[0]!
  const b = props.charges[1]!
  const ax = b.x - a.x
  const ay = b.y - a.y
  const len = Math.hypot(ax, ay)
  if (len < 1e-9) return

  const ux = ax / len
  const uy = ay / len
  const px = -uy
  const py = ux
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2

  const span = 0.26
  const midA = { x: mx - px * span * 0.75, y: my - py * span * 0.75 }
  const midB = { x: mx + px * span * 0.75, y: my + py * span * 0.75 }

  const pJoinA = worldToScreen(a.x, a.y, width, height)
  const pJoinB = worldToScreen(b.x, b.y, width, height)
  const pMidA = worldToScreen(midA.x, midA.y, width, height)
  const pMidB = worldToScreen(midB.x, midB.y, width, height)

  context.save()
  context.setLineDash([7, 5])
  context.lineWidth = 1.2

  context.strokeStyle = 'rgba(248, 250, 252, 0.45)'
  context.beginPath()
  context.moveTo(pJoinA.sx, pJoinA.sy)
  context.lineTo(pJoinB.sx, pJoinB.sy)
  context.stroke()

  context.strokeStyle = 'rgba(167, 243, 208, 0.5)'
  context.beginPath()
  context.moveTo(pMidA.sx, pMidA.sy)
  context.lineTo(pMidB.sx, pMidB.sy)
  context.stroke()

  context.restore()
}

function drawAxisTestCharge(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  if (props.configId !== 'same' && props.configId !== 'opposite') return
  if (!props.showAxisFieldE || !props.axisProbePos) return

  const pos = props.axisProbePos
  const p = worldToScreen(pos.x, pos.y, width, height)
  const forces = props.axisForces
  const scaleMag = Math.max(props.axisForceScaleMag, 1e-18)

  // 分力
  for (const f of forces.components) {
    drawArrow(
      context,
      p.sx,
      p.sy,
      f.fx,
      f.fy,
      forceArrowLen(f.mag, scaleMag) * 0.75,
      f.color,
      f.label,
      2,
      7,
    )
  }

  // 合力：长度表示大小，方向即场强方向
  if (forces.netMag > scaleMag * 0.008) {
    drawArrow(
      context,
      p.sx,
      p.sy,
      forces.netFx,
      forces.netFy,
      forceArrowLen(forces.netMag, scaleMag),
      '#f8fafc',
      `F合 ${props.formatF(forces.netMag)}`,
      3.2,
      9,
    )
  } else {
    context.strokeStyle = '#f8fafc'
    context.lineWidth = 1.6
    context.beginPath()
    context.arc(p.sx, p.sy, 10, 0, Math.PI * 2)
    context.stroke()
    context.fillStyle = '#f8fafc'
    context.font = 'bold 11px sans-serif'
    context.textAlign = 'left'
    context.textBaseline = 'middle'
    context.fillText('F合≈0', p.sx + 12, p.sy)
  }

  // 正试探电荷
  context.fillStyle = '#fbbf24'
  context.strokeStyle = '#fef3c7'
  context.lineWidth = 2
  context.beginPath()
  context.arc(p.sx, p.sy, 11, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.fillStyle = '#78350f'
  context.font = 'bold 14px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('+', p.sx, p.sy + 1)
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

  context.fillStyle = '#0f172a'
  context.fillRect(0, 0, width, height)

  drawAxisGuides(context, width, height)

  context.lineWidth = 1.4
  context.strokeStyle = 'rgba(125, 211, 252, 0.75)'
  for (const line of props.fieldLines) {
    if (line.length < 2) continue
    context.beginPath()
    for (let i = 0; i < line.length; i += 1) {
      const pt = line[i]!
      const p = worldToScreen(pt.x, pt.y, width, height)
      if (i === 0) context.moveTo(p.sx, p.sy)
      else context.lineTo(p.sx, p.sy)
    }
    context.stroke()
  }

  for (const charge of props.charges) {
    drawCharge(context, charge, width, height)
  }

  drawAxisTestCharge(context, width, height)

  // 自由探测点（非轴上场强模式时的对照）
  if (!props.showAxisFieldE || (props.configId !== 'same' && props.configId !== 'opposite')) {
    const probe = worldToScreen(props.probe.x, props.probe.y, width, height)
    context.fillStyle = '#fbbf24'
    context.beginPath()
    context.arc(probe.sx, probe.sy, 7, 0, Math.PI * 2)
    context.fill()
    drawArrow(context, probe.sx, probe.sy, props.eAtProbe.x, props.eAtProbe.y, 56, '#38bdf8', 'E')
    if (props.showForce) {
      const eMag = length(props.eAtProbe)
      const fMag = length(props.fAtProbe)
      const qAbs = eMag > 1e-12 ? fMag / eMag : 0
      const qRatio = Math.min(1, qAbs / 3e-6)
      const fLen = 28 + 70 * qRatio
      drawArrow(context, probe.sx, probe.sy, props.fAtProbe.x, props.fAtProbe.y, fLen, '#fb923c', 'F')
    }
  }

  context.fillStyle = 'rgba(226, 232, 240, 0.85)'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.textBaseline = 'top'
  if (
    props.showAxisFieldE &&
    (props.configId === 'same' || props.configId === 'opposite')
  ) {
    context.fillText('拖动黄色 + ：正试探电荷 · 彩箭头分力 · 白箭头 F合（长度∝大小，方向=E）', 12, 10)
  } else {
    context.fillText('黄点：探测点 · 蓝箭头 E · 橙箭头 F', 12, 10)
  }
}

function canvasPoint(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return {
    sx: event.clientX - rect.left,
    sy: event.clientY - rect.top,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  }
}

function hitAxisProbe(sx: number, sy: number, width: number, height: number) {
  if (!props.axisProbePos || !props.showAxisFieldE) return false
  if (props.configId !== 'same' && props.configId !== 'opposite') return false
  const p = worldToScreen(props.axisProbePos.x, props.axisProbePos.y, width, height)
  return Math.hypot(sx - p.sx, sy - p.sy) <= 18
}

function moveAxisProbe(sx: number, sy: number, width: number, height: number) {
  const world = screenToWorld(sx, sy, width, height)
  const projected = projectOntoChargeAxes(props.charges, world.x, world.y)
  if (!projected) return
  emit('update:axis-probe', projected.axis, projected.t)
}

function onPointerDown(event: PointerEvent) {
  const pt = canvasPoint(event)
  if (!pt) return
  if (!hitAxisProbe(pt.sx, pt.sy, pt.width, pt.height)) return
  draggingAxisProbe = true
  canvasRef.value?.setPointerCapture(event.pointerId)
  moveAxisProbe(pt.sx, pt.sy, pt.width, pt.height)
}

function onPointerMove(event: PointerEvent) {
  if (!draggingAxisProbe) return
  const pt = canvasPoint(event)
  if (!pt) return
  moveAxisProbe(pt.sx, pt.sy, pt.width, pt.height)
}

function onPointerUp(event: PointerEvent) {
  if (!draggingAxisProbe) return
  draggingAxisProbe = false
  try {
    canvasRef.value?.releasePointerCapture(event.pointerId)
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  draw()
  const canvas = canvasRef.value
  if (canvas) {
    observer = new ResizeObserver(() => draw())
    observer.observe(canvas)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
  }
})

watch(
  () => [
    props.fieldLines,
    props.charges,
    props.probe,
    props.eAtProbe,
    props.fAtProbe,
    props.showForce,
    props.configId,
    props.showAxisGuides,
    props.showAxisFieldE,
    props.axisProbePos,
    props.axisForces,
    props.axisForceScaleMag,
    props.eAtAxisProbe,
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
    aria-label="电场线二维示意（可拖动轴上试探电荷）"
  ></canvas>
</template>

<style scoped>
.canvas {
  display: block;
  width: 100%;
  height: min(56vh, 460px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #0f172a;
  touch-action: none;
  cursor: grab;
}

.canvas:active {
  cursor: grabbing;
}
</style>
