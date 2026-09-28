<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  ACCEL_FIELD,
  DEFLECT_FIELD,
  MOTION_BOUNDS,
  type MotionMode,
  type ParticleState,
  type Vec2,
} from '@/utils/particleMotion'

const props = defineProps<{
  mode: MotionMode
  state: ParticleState
  trail: Vec2[]
  previewPath: Vec2[]
  fieldE: number
  showPreview: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function worldToScreen(x: number, y: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = MOTION_BOUNDS
  const padX = 36
  const padY = 28
  const sx = padX + ((x - minX) / (maxX - minX)) * (width - padX * 2)
  const sy = height - padY - ((y - minY) / (maxY - minY)) * (height - padY * 2)
  return { sx, sy }
}

function drawPolyline(
  context: CanvasRenderingContext2D,
  points: Vec2[],
  width: number,
  height: number,
  color: string,
  lineWidth: number,
  dashed = false,
) {
  if (points.length < 2) return
  context.strokeStyle = color
  context.lineWidth = lineWidth
  context.setLineDash(dashed ? [5, 4] : [])
  context.beginPath()
  const first = worldToScreen(points[0]!.x, points[0]!.y, width, height)
  context.moveTo(first.sx, first.sy)
  for (let i = 1; i < points.length; i += 1) {
    const p = worldToScreen(points[i]!.x, points[i]!.y, width, height)
    context.lineTo(p.sx, p.sy)
  }
  context.stroke()
  context.setLineDash([])
}

function drawArrow(
  context: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
) {
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(x0, y0)
  context.lineTo(x1, y1)
  context.stroke()
  const ang = Math.atan2(y1 - y0, x1 - x0)
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x1 - 8 * Math.cos(ang - 0.4), y1 - 8 * Math.sin(ang - 0.4))
  context.lineTo(x1 - 8 * Math.cos(ang + 0.4), y1 - 8 * Math.sin(ang + 0.4))
  context.closePath()
  context.fill()
}

function drawAccelField(context: CanvasRenderingContext2D, width: number, height: number) {
  const tl = worldToScreen(ACCEL_FIELD.xLeft, ACCEL_FIELD.yTop, width, height)
  const br = worldToScreen(ACCEL_FIELD.xRight, ACCEL_FIELD.yBottom, width, height)
  context.fillStyle = 'rgba(219, 234, 254, 0.55)'
  context.fillRect(tl.sx, tl.sy, br.sx - tl.sx, br.sy - tl.sy)

  context.fillStyle = '#64748b'
  context.fillRect(tl.sx - 10, tl.sy, 10, br.sy - tl.sy)
  context.fillRect(br.sx, tl.sy, 10, br.sy - tl.sy)
  context.fillStyle = '#0f172a'
  context.font = 'bold 13px sans-serif'
  context.textAlign = 'center'
  context.fillText(props.fieldE >= 0 ? '+' : '−', tl.sx - 5, tl.sy - 8)
  context.fillText(props.fieldE >= 0 ? '−' : '+', br.sx + 5, tl.sy - 8)

  const dir = props.fieldE >= 0 ? 1 : -1
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x0 = ACCEL_FIELD.xLeft + 0.04 + col * 0.07
      const y0 = ACCEL_FIELD.yBottom + 0.03 + row * 0.06
      const p0 = worldToScreen(x0, y0, width, height)
      const p1 = worldToScreen(x0 + dir * 0.04, y0, width, height)
      drawArrow(context, p0.sx, p0.sy, p1.sx, p1.sy, 'rgba(37, 99, 235, 0.45)')
    }
  }

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.fillText('匀强电场 E →（加速）', 14, 20)
}

function drawDeflectField(context: CanvasRenderingContext2D, width: number, height: number) {
  const tl = worldToScreen(DEFLECT_FIELD.x0, DEFLECT_FIELD.yTop, width, height)
  const br = worldToScreen(DEFLECT_FIELD.x0 + DEFLECT_FIELD.length, DEFLECT_FIELD.yBottom, width, height)
  context.fillStyle = 'rgba(219, 234, 254, 0.55)'
  context.fillRect(tl.sx, tl.sy, br.sx - tl.sx, br.sy - tl.sy)

  // 上下极板
  context.fillStyle = '#64748b'
  context.fillRect(tl.sx, tl.sy - 8, br.sx - tl.sx, 8)
  context.fillRect(tl.sx, br.sy, br.sx - tl.sx, 8)
  context.fillStyle = '#0f172a'
  context.font = 'bold 13px sans-serif'
  context.textAlign = 'center'
  const midX = (tl.sx + br.sx) / 2
  context.fillText(props.fieldE >= 0 ? '+' : '−', midX, tl.sy - 12)
  context.fillText(props.fieldE >= 0 ? '−' : '+', midX, br.sy + 18)

  const dir = props.fieldE >= 0 ? -1 : 1 // 向下为屏幕 +sy
  for (let col = 0; col < 5; col += 1) {
    for (let row = 0; row < 2; row += 1) {
      const x0 = DEFLECT_FIELD.x0 + 0.03 + col * 0.04
      const y0 = 0.04 - row * 0.08
      const p0 = worldToScreen(x0, y0, width, height)
      const p1 = worldToScreen(x0, y0 + dir * 0.035, width, height)
      drawArrow(context, p0.sx, p0.sy, p1.sx, p1.sy, 'rgba(37, 99, 235, 0.45)')
    }
  }

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.fillText('匀强电场 E ↓（偏转，类平抛）', 14, 20)
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

  if (props.mode === 'accelerate') drawAccelField(context, width, height)
  else drawDeflectField(context, width, height)

  // 坐标轴
  const origin = worldToScreen(0, 0, width, height)
  context.strokeStyle = '#cbd5e1'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(20, origin.sy)
  context.lineTo(width - 20, origin.sy)
  context.stroke()

  if (props.showPreview) {
    drawPolyline(context, props.previewPath, width, height, 'rgba(148, 163, 184, 0.7)', 1.5, true)
  }
  drawPolyline(context, props.trail, width, height, '#ea580c', 2.5)

  // 粒子
  const p = worldToScreen(props.state.x, props.state.y, width, height)
  context.fillStyle = '#dc2626'
  context.beginPath()
  context.arc(p.sx, p.sy, 9, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#fff'
  context.font = 'bold 11px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('q', p.sx, p.sy)

  // 速度箭头
  const vScale = 2.2
  const tip = worldToScreen(
    props.state.x + props.state.vx * 0.01 * vScale,
    props.state.y + props.state.vy * 0.01 * vScale,
    width,
    height,
  )
  if (Math.hypot(props.state.vx, props.state.vy) > 0.05) {
    drawArrow(context, p.sx, p.sy, tip.sx, tip.sy, '#dc2626')
  }

  // 分量（偏转模式）
  if (props.mode === 'deflect' && Math.abs(props.state.vy) > 0.05) {
    const vxTip = worldToScreen(props.state.x + props.state.vx * 0.01 * vScale, props.state.y, width, height)
    const vyTip = worldToScreen(props.state.x, props.state.y + props.state.vy * 0.01 * vScale, width, height)
    context.setLineDash([3, 3])
    context.strokeStyle = '#2563eb'
    context.beginPath()
    context.moveTo(p.sx, p.sy)
    context.lineTo(vxTip.sx, vxTip.sy)
    context.stroke()
    context.strokeStyle = '#16a34a'
    context.beginPath()
    context.moveTo(p.sx, p.sy)
    context.lineTo(vyTip.sx, vyTip.sy)
    context.stroke()
    context.setLineDash([])
  }

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  const status = props.state.done
    ? '已结束'
    : props.state.inField
      ? '电场中'
      : props.state.exited
        ? '已出电场（匀速）'
        : '运动中'
  context.fillText(`轨迹追踪 · ${status}`, 14, height - 12)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  observer = new ResizeObserver(() => draw())
  observer.observe(canvas)
  draw()
})

onUnmounted(() => {
  observer?.disconnect()
})

watch(
  () => [props.mode, props.state, props.trail, props.previewPath, props.showPreview, props.fieldE],
  () => draw(),
  { deep: true },
)
</script>

<template>
  <canvas ref="canvasRef" class="canvas" role="img" aria-label="带电粒子运动轨迹" />
</template>

<style scoped>
.canvas {
  display: block;
  width: 100%;
  height: min(52vh, 420px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
