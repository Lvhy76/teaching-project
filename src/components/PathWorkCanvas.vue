<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  FIELD_BOUNDS,
  pathMeta,
  pathOptions,
  pathWaypoints,
  pointOnPath,
  type PathId,
  type Vec2,
} from '@/utils/pathWork'

const props = defineProps<{
  pathId: PathId
  points: Vec2[]
  position: Vec2
  progress: number
  fieldE: number
  showAllPaths: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function worldToScreen(x: number, y: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = FIELD_BOUNDS
  const pad = 28
  const sx = pad + ((x - minX) / (maxX - minX)) * (width - pad * 2)
  const sy = height - pad - ((y - minY) / (maxY - minY)) * (height - pad * 2)
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
  context.setLineDash(dashed ? [5, 5] : [])
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

function traveledPoints(points: Vec2[], progress: number): Vec2[] {
  if (progress <= 0 || points.length === 0) return points[0] ? [points[0]] : []
  const samples = Math.max(2, Math.ceil(progress * 48))
  const result: Vec2[] = []
  for (let i = 0; i <= samples; i += 1) {
    result.push(pointOnPath(points, (progress * i) / samples))
  }
  return result
}

function drawFieldArrows(context: CanvasRenderingContext2D, width: number, height: number) {
  const { minX, maxX, minY, maxY } = FIELD_BOUNDS
  context.strokeStyle = 'rgba(37, 99, 235, 0.35)'
  context.fillStyle = 'rgba(37, 99, 235, 0.45)'
  context.lineWidth = 1.5
  const rows = 4
  const cols = 5
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x0 = minX + ((c + 0.2) / cols) * (maxX - minX)
      const y0 = minY + ((r + 0.5) / rows) * (maxY - minY)
      const x1 = x0 + (maxX - minX) * 0.1
      const p0 = worldToScreen(x0, y0, width, height)
      const p1 = worldToScreen(x1, y0, width, height)
      context.beginPath()
      context.moveTo(p0.sx, p0.sy)
      context.lineTo(p1.sx, p1.sy)
      context.stroke()
      context.beginPath()
      context.moveTo(p1.sx, p1.sy)
      context.lineTo(p1.sx - 7, p1.sy - 4)
      context.lineTo(p1.sx - 7, p1.sy + 4)
      context.closePath()
      context.fill()
    }
  }
}

function drawEndpoint(
  context: CanvasRenderingContext2D,
  point: Vec2,
  width: number,
  height: number,
  label: string,
) {
  const p = worldToScreen(point.x, point.y, width, height)
  context.fillStyle = '#0f172a'
  context.beginPath()
  context.arc(p.sx, p.sy, 8, 0, Math.PI * 2)
  context.fill()
  context.font = 'bold 13px sans-serif'
  context.textAlign = 'center'
  context.fillText(label, p.sx, p.sy - 14)
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

  const left = worldToScreen(FIELD_BOUNDS.minX + 0.02, FIELD_BOUNDS.maxY - 0.02, width, height)
  const right = worldToScreen(FIELD_BOUNDS.maxX - 0.02, FIELD_BOUNDS.minY + 0.02, width, height)
  context.fillStyle = 'rgba(219, 234, 254, 0.45)'
  context.fillRect(left.sx, left.sy, right.sx - left.sx, right.sy - left.sy)

  drawFieldArrows(context, width, height)

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  context.fillText('匀强电场 E →', 16, 22)

  if (props.showAllPaths) {
    for (const option of pathOptions) {
      if (option.id === props.pathId) continue
      drawPolyline(
        context,
        pathWaypoints(option.id),
        width,
        height,
        `${option.color}55`,
        2,
        true,
      )
    }
  }

  const active = pathMeta(props.pathId)
  drawPolyline(context, props.points, width, height, active.color, 3)
  if (props.progress > 0.001) {
    drawPolyline(context, traveledPoints(props.points, props.progress), width, height, active.color, 5)
  }

  const a = props.points[0]!
  const b = props.points[props.points.length - 1]!
  drawEndpoint(context, a, width, height, 'A')
  drawEndpoint(context, b, width, height, 'B')

  const charge = worldToScreen(props.position.x, props.position.y, width, height)
  context.fillStyle = '#dc2626'
  context.beginPath()
  context.arc(charge.sx, charge.sy, 11, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#fff'
  context.font = 'bold 12px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('q', charge.sx, charge.sy)

  if (props.fieldE !== 0) {
    const dir = props.fieldE > 0 ? 1 : -1
    context.strokeStyle = '#dc2626'
    context.fillStyle = '#dc2626'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(charge.sx, charge.sy - 22)
    context.lineTo(charge.sx + dir * 28, charge.sy - 22)
    context.stroke()
    context.beginPath()
    context.moveTo(charge.sx + dir * 28, charge.sy - 22)
    context.lineTo(charge.sx + dir * 20, charge.sy - 27)
    context.lineTo(charge.sx + dir * 20, charge.sy - 17)
    context.closePath()
    context.fill()
    context.font = '11px sans-serif'
    context.textBaseline = 'alphabetic'
    context.fillText('F', charge.sx + dir * 18, charge.sy - 32)
  }
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
  () => [props.pathId, props.points, props.position, props.progress, props.showAllPaths, props.fieldE],
  () => draw(),
  { deep: true },
)
</script>

<template>
  <canvas ref="canvasRef" class="canvas" role="img" aria-label="多路径电场力做功示意" />
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
