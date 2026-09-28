<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { ChargingMode, ChargingStep } from '@/utils/charging'

const props = defineProps<{
  mode: ChargingMode
  step: ChargingStep
  stepIndex: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function chargeColor(charge: number): string {
  if (charge > 0) return '#dc2626'
  if (charge < 0) return '#2563eb'
  return '#64748b'
}

function drawPlusMinus(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  sign: 1 | -1,
  color: string,
) {
  context.strokeStyle = color
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(x - 5, y)
  context.lineTo(x + 5, y)
  if (sign > 0) {
    context.moveTo(x, y - 5)
    context.lineTo(x, y + 5)
  }
  context.stroke()
}

function drawChargesOnBody(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  charge: number,
  leftCharge?: number,
  rightCharge?: number,
) {
  const drawGroup = (count: number, x0: number, x1: number) => {
    const n = Math.min(8, Math.abs(count))
    if (n === 0) return
    const sign: 1 | -1 = count > 0 ? 1 : -1
    const color = chargeColor(count)
    for (let i = 0; i < n; i += 1) {
      const t = n === 1 ? 0.5 : i / (n - 1)
      const x = x0 + (x1 - x0) * t
      const y = cy + ((i % 2 === 0 ? -1 : 1) * height) * 0.18
      context.fillStyle = color
      context.beginPath()
      context.arc(x, y, 7, 0, Math.PI * 2)
      context.fill()
      drawPlusMinus(context, x, y, sign, '#fff')
    }
  }

  if (leftCharge !== undefined && rightCharge !== undefined) {
    drawGroup(leftCharge, cx - width * 0.38, cx - width * 0.08)
    drawGroup(rightCharge, cx + width * 0.08, cx + width * 0.38)
    return
  }

  const n = Math.min(8, Math.abs(charge))
  if (n === 0) {
    context.fillStyle = '#94a3b8'
    context.font = '12px sans-serif'
    context.textAlign = 'center'
    context.fillText('不带电', cx, cy + 4)
    return
  }
  drawGroup(charge, cx - width * 0.32, cx + width * 0.32)
}

function bodyLayout(mode: ChargingMode, width: number, height: number) {
  const midY = height * 0.52
  if (mode === 'induction') {
    return {
      rod: { x: width * 0.22, y: midY, w: 70, h: 120 },
      cond: { x: width * 0.62, y: midY, w: 180, h: 90 },
      earth: { x: width * 0.88, y: height * 0.82, w: 60, h: 28 },
    }
  }
  return {
    left: { x: width * 0.3, y: midY, w: 120, h: 70 },
    right: { x: width * 0.7, y: midY, w: 120, h: 70 },
  }
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + w, y, x + w, y + h, radius)
  context.arcTo(x + w, y + h, x, y + h, radius)
  context.arcTo(x, y + h, x, y, radius)
  context.arcTo(x, y, x + w, y, radius)
  context.closePath()
}

function drawBody(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  rounded: boolean,
) {
  context.fillStyle = '#e2e8f0'
  context.strokeStyle = '#334155'
  context.lineWidth = 2
  const radius = rounded ? Math.min(w, h) / 2 : 12
  roundedRect(context, x - w / 2, y - h / 2, w, h, radius)
  context.fill()
  context.stroke()
  context.fillStyle = '#0f172a'
  context.font = '13px sans-serif'
  context.textAlign = 'center'
  context.fillText(label, x, y + h / 2 + 22)
}

function drawTransferArrow(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
) {
  context.strokeStyle = '#ea580c'
  context.fillStyle = '#ea580c'
  context.lineWidth = 2.5
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()
  const angle = Math.atan2(y2 - y1, x2 - x1)
  context.beginPath()
  context.moveTo(x2, y2)
  context.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4))
  context.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4))
  context.closePath()
  context.fill()
  context.font = '12px sans-serif'
  context.textAlign = 'center'
  context.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 10)
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

  context.fillStyle = '#0f172a'
  context.font = '14px sans-serif'
  context.textAlign = 'left'
  context.fillText(props.step.title, 14, 26)
  context.fillStyle = '#475569'
  context.font = '12px sans-serif'
  context.fillText(props.step.note, 14, 48)

  const layout = bodyLayout(props.mode, width, height)
  const bodies = props.step.bodies

  if (props.mode === 'induction') {
    const rod = bodies.find((b) => b.id === 'rod')
    const cond = bodies.find((b) => b.id === 'cond')
    if (rod) {
      drawBody(context, layout.rod!.x, layout.rod!.y, layout.rod!.w, layout.rod!.h, rod.label, true)
      drawChargesOnBody(context, layout.rod!.x, layout.rod!.y, layout.rod!.w, layout.rod!.h, rod.charge)
    }
    if (cond) {
      drawBody(context, layout.cond!.x, layout.cond!.y, layout.cond!.w, layout.cond!.h, cond.label, false)
      drawChargesOnBody(
        context,
        layout.cond!.x,
        layout.cond!.y,
        layout.cond!.w,
        layout.cond!.h,
        cond.charge,
        cond.leftCharge,
        cond.rightCharge,
      )
    }
    if (props.step.transfer?.from === 'earth' || props.stepIndex === 2) {
      context.fillStyle = '#334155'
      context.fillRect(layout.earth!.x - 30, layout.earth!.y - 8, 60, 16)
      context.font = '12px sans-serif'
      context.textAlign = 'center'
      context.fillText('大地', layout.earth!.x, layout.earth!.y + 28)
      context.strokeStyle = '#64748b'
      context.beginPath()
      context.moveTo(layout.cond!.x + layout.cond!.w / 2, layout.cond!.y + layout.cond!.h / 2)
      context.lineTo(layout.earth!.x, layout.earth!.y - 8)
      context.stroke()
    }
    if (props.step.transfer) {
      if (props.step.transfer.from === 'earth') {
        drawTransferArrow(
          context,
          layout.earth!.x,
          layout.earth!.y - 12,
          layout.cond!.x + 20,
          layout.cond!.y + 30,
          props.step.transfer.label,
        )
      } else {
        drawTransferArrow(
          context,
          layout.cond!.x - 40,
          layout.cond!.y,
          layout.rod!.x + 30,
          layout.rod!.y,
          props.step.transfer.label,
        )
      }
    }
  } else {
    const left = bodies[0]
    const right = bodies[1]
    if (left) {
      const shape = props.mode === 'friction' && left.id === 'glass'
      drawBody(context, layout.left!.x, layout.left!.y, layout.left!.w, layout.left!.h, left.label, !!shape)
      drawChargesOnBody(context, layout.left!.x, layout.left!.y, layout.left!.w, layout.left!.h, left.charge)
    }
    if (right) {
      drawBody(context, layout.right!.x, layout.right!.y, layout.right!.w, layout.right!.h, right.label, false)
      drawChargesOnBody(context, layout.right!.x, layout.right!.y, layout.right!.w, layout.right!.h, right.charge)
    }
    if (props.step.transfer) {
      drawTransferArrow(
        context,
        layout.left!.x + 40,
        layout.left!.y - 10,
        layout.right!.x - 40,
        layout.right!.y - 10,
        props.step.transfer.label,
      )
    }
  }

  context.fillStyle = '#64748b'
  context.font = '12px sans-serif'
  context.textAlign = 'left'
  context.fillText('红色 ⊕：正电荷　　蓝色 ⊖：负电荷 / 电子', 14, height - 14)
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
  () => [props.mode, props.stepIndex, props.step.title, props.step.note],
  () => draw(),
  { deep: true },
)
</script>

<template>
  <canvas ref="canvasRef" class="stage" aria-label="起电方式电荷分布" />
</template>

<style scoped>
.stage {
  display: block;
  width: 100%;
  height: 340px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}
</style>
