<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { COULOMB_BOUNDS } from '@/stores/coulomb'

const props = defineProps<{
  x1: number
  x2: number
  q1UC: number
  q2UC: number
  forceMagnitude: number
  repulsive: boolean
  valid: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function worldToScreen(x: number, y: number, width: number, height: number) {
  const { minX, maxX, minY, maxY } = COULOMB_BOUNDS
  const padX = 40
  const padY = 36
  const sx = padX + ((x - minX) / (maxX - minX)) * (width - padX * 2)
  const sy = height - padY - ((y - minY) / (maxY - minY)) * (height - padY * 2)
  return { sx, sy }
}

function chargeColor(qUC: number): string {
  if (Math.abs(qUC) < 0.05) return '#94a3b8'
  return qUC > 0 ? '#dc2626' : '#2563eb'
}

function chargeLabel(qUC: number): string {
  if (Math.abs(qUC) < 0.05) return '0'
  return qUC > 0 ? '+' : '−'
}

function drawArrow(
  context: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  label?: string,
) {
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(x0, y0)
  context.lineTo(x1, y1)
  context.stroke()
  const ang = Math.atan2(y1 - y0, x1 - x0)
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x1 - 10 * Math.cos(ang - 0.4), y1 - 10 * Math.sin(ang - 0.4))
  context.lineTo(x1 - 10 * Math.cos(ang + 0.4), y1 - 10 * Math.sin(ang + 0.4))
  context.closePath()
  context.fill()
  if (label) {
    context.font = 'bold 13px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'bottom'
    context.fillText(label, (x0 + x1) / 2, Math.min(y0, y1) - 8)
  }
}

function drawCharge(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  qUC: number,
  name: string,
) {
  const p = worldToScreen(x, y, width, height)
  const r = 22
  context.fillStyle = chargeColor(qUC)
  context.beginPath()
  context.arc(p.sx, p.sy, r, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#fff'
  context.font = 'bold 18px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(chargeLabel(qUC), p.sx, p.sy)
  context.fillStyle = '#0f172a'
  context.font = 'bold 13px sans-serif'
  context.textBaseline = 'alphabetic'
  context.fillText(name, p.sx, p.sy - r - 8)
  return p
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

  // 水平参考线
  const mid = worldToScreen(0, 0, width, height)
  context.strokeStyle = '#e2e8f0'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(24, mid.sy)
  context.lineTo(width - 24, mid.sy)
  context.stroke()

  // 间距标注
  const p1 = worldToScreen(props.x1, 0, width, height)
  const p2 = worldToScreen(props.x2, 0, width, height)
  const bracketY = mid.sy + 48
  context.strokeStyle = '#64748b'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(p1.sx, bracketY - 6)
  context.lineTo(p1.sx, bracketY)
  context.lineTo(p2.sx, bracketY)
  context.lineTo(p2.sx, bracketY - 6)
  context.stroke()
  context.fillStyle = '#334155'
  context.font = '13px sans-serif'
  context.textAlign = 'center'
  context.fillText(`r = ${((props.x2 - props.x1) * 100).toFixed(1)} cm`, (p1.sx + p2.sx) / 2, bracketY + 16)

  drawCharge(context, props.x1, 0, width, height, props.q1UC, 'Q₁')
  drawCharge(context, props.x2, 0, width, height, props.q2UC, 'Q₂')

  // 力箭头：长度随 F 示意缩放（有上限）
  const hasForce =
    props.valid &&
    props.forceMagnitude > 0 &&
    Math.abs(props.q1UC) >= 0.05 &&
    Math.abs(props.q2UC) >= 0.05

  if (hasForce) {
    const gap = Math.abs(p2.sx - p1.sx)
    const maxLen = Math.min(70, gap * 0.35)
    // 用对数压缩，避免 F 变化时箭头忽长忽短过猛
    const t = Math.min(1, Math.log10(props.forceMagnitude + 1) / 3)
    const len = 24 + maxLen * t
    const yOff = -36
    const color = props.repulsive ? '#ea580c' : '#16a34a'

    if (props.repulsive) {
      // 相斥：箭头背离
      drawArrow(context, p1.sx - 26, p1.sy + yOff, p1.sx - 26 - len, p1.sy + yOff, color, 'F₁₂')
      drawArrow(context, p2.sx + 26, p2.sy + yOff, p2.sx + 26 + len, p2.sy + yOff, color, 'F₂₁')
    } else {
      // 相吸：箭头相对
      drawArrow(context, p1.sx + 26, p1.sy + yOff, p1.sx + 26 + len, p1.sy + yOff, color, 'F₁₂')
      drawArrow(context, p2.sx - 26, p2.sy + yOff, p2.sx - 26 - len, p2.sy + yOff, color, 'F₂₁')
    }

    context.fillStyle = color
    context.font = '12px sans-serif'
    context.textAlign = 'center'
    context.fillText(
      props.repulsive ? '同号相斥' : '异号相吸',
      mid.sx,
      mid.sy - 72,
    )
  }

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.fillText('F = k|Q₁Q₂|/r²，k = 9×10⁹ N·m²/C²', 14, 22)
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
  () => [props.x1, props.x2, props.q1UC, props.q2UC, props.forceMagnitude, props.repulsive, props.valid],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="canvas" role="img" aria-label="库仑定律两点电荷受力示意" />
</template>

<style scoped>
.canvas {
  display: block;
  width: 100%;
  height: min(48vh, 400px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
