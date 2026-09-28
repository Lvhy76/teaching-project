<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  halfAngleDeg: number
  chargeUC: number
  charged: boolean
  positive: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function drawLeaf(
  context: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  angleFromVertical: number,
  length: number,
  width: number,
  side: 1 | -1,
) {
  // angleFromVertical：相对竖直向下的偏转角；side 控制左右
  const ang = Math.PI / 2 + side * ((angleFromVertical * Math.PI) / 180)
  const tipX = pivotX + Math.cos(ang) * length
  const tipY = pivotY + Math.sin(ang) * length
  const nx = -Math.sin(ang)
  const ny = Math.cos(ang)

  context.fillStyle = '#d4a017'
  context.strokeStyle = '#a16207'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(pivotX + nx * width * 0.5, pivotY + ny * width * 0.5)
  context.lineTo(tipX + nx * width * 0.35, tipY + ny * width * 0.35)
  context.lineTo(tipX - nx * width * 0.35, tipY - ny * width * 0.35)
  context.lineTo(pivotX - nx * width * 0.5, pivotY - ny * width * 0.5)
  context.closePath()
  context.fill()
  context.stroke()

  if (props.charged) {
    const mx = (pivotX + tipX) / 2
    const my = (pivotY + tipY) / 2
    context.fillStyle = props.positive ? '#dc2626' : '#2563eb'
    context.font = 'bold 13px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(props.positive ? '+' : '−', mx + side * 12, my)
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

  const cx = width * 0.5
  const jarTop = height * 0.22
  const jarBottom = height * 0.9
  const jarW = Math.min(width * 0.42, 220)
  const jarLeft = cx - jarW / 2
  const jarRight = cx + jarW / 2

  // 玻璃瓶
  context.fillStyle = 'rgba(186, 230, 253, 0.35)'
  context.strokeStyle = '#7dd3fc'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(jarLeft, jarTop)
  context.lineTo(jarLeft, jarBottom - 16)
  context.quadraticCurveTo(jarLeft, jarBottom, jarLeft + 16, jarBottom)
  context.lineTo(jarRight - 16, jarBottom)
  context.quadraticCurveTo(jarRight, jarBottom, jarRight, jarBottom - 16)
  context.lineTo(jarRight, jarTop)
  context.closePath()
  context.fill()
  context.stroke()

  // 瓶口塞
  context.fillStyle = '#78716c'
  context.fillRect(cx - 28, jarTop - 14, 56, 18)

  // 金属杆
  const knobY = jarTop - 48
  const rodBottom = jarTop + height * 0.28
  context.strokeStyle = '#94a3b8'
  context.lineWidth = 6
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(cx, knobY + 18)
  context.lineTo(cx, rodBottom)
  context.stroke()

  // 金属球（接触端）
  context.fillStyle = props.charged ? (props.positive ? '#fca5a5' : '#93c5fd') : '#cbd5e1'
  context.strokeStyle = '#64748b'
  context.lineWidth = 2
  context.beginPath()
  context.arc(cx, knobY, 18, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  if (props.charged) {
    context.fillStyle = props.positive ? '#dc2626' : '#2563eb'
    context.font = 'bold 16px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(props.positive ? '+' : '−', cx, knobY)
  }

  // 铰链 / 箔片枢轴
  const pivotY = rodBottom
  context.fillStyle = '#64748b'
  context.beginPath()
  context.arc(cx, pivotY, 5, 0, Math.PI * 2)
  context.fill()

  const leafLen = height * 0.28
  const leafW = 14
  drawLeaf(context, cx, pivotY, props.halfAngleDeg, leafLen, leafW, -1)
  drawLeaf(context, cx, pivotY, props.halfAngleDeg, leafLen, leafW, 1)

  // 张角弧线标注
  if (props.halfAngleDeg > 1) {
    const arcR = leafLen * 0.55
    context.strokeStyle = '#ea580c'
    context.lineWidth = 1.5
    context.beginPath()
    const a0 = Math.PI / 2 - ((props.halfAngleDeg * Math.PI) / 180)
    const a1 = Math.PI / 2 + ((props.halfAngleDeg * Math.PI) / 180)
    context.arc(cx, pivotY, arcR, a0, a1)
    context.stroke()
    context.fillStyle = '#ea580c'
    context.font = '12px sans-serif'
    context.textAlign = 'center'
    context.fillText(`2θ ≈ ${(props.halfAngleDeg * 2).toFixed(0)}°`, cx, pivotY + arcR + 18)
  }

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.fillText('金箔验电器：同号电荷相斥 → 箔片张开', 14, 22)
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
  () => [props.halfAngleDeg, props.chargeUC, props.charged, props.positive],
  () => draw(),
)
</script>

<template>
  <canvas ref="canvasRef" class="canvas" role="img" aria-label="验电器箔片张角示意" />
</template>

<style scoped>
.canvas {
  display: block;
  width: 100%;
  height: min(58vh, 480px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
