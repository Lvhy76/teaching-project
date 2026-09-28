/** 电场强度与电场线（点电荷组态）。 */

import { K_COULOMB } from '@/utils/coulomb'

export type FieldConfigId = 'single' | 'same' | 'opposite'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface FieldCharge {
  x: number
  y: number
  z: number
  q: number
}

export interface FieldConfig {
  id: FieldConfigId
  label: string
  hint: string
  charges: FieldCharge[]
}

export const fieldConfigOptions: FieldConfig[] = [
  {
    id: 'single',
    label: '点电荷',
    hint: '电场线从正电荷出发（或汇入负电荷）',
    charges: [{ x: 0, y: 0, z: 0, q: 2e-6 }],
  },
  {
    id: 'same',
    label: '等量同种电荷',
    hint: '两正电荷：电场线互相排斥',
    charges: [
      { x: -0.08, y: 0, z: 0, q: 2e-6 },
      { x: 0.08, y: 0, z: 0, q: 2e-6 },
    ],
  },
  {
    id: 'opposite',
    label: '等量异种电荷',
    hint: '电偶极：电场线由正指向负',
    charges: [
      { x: -0.08, y: 0, z: 0, q: 2e-6 },
      { x: 0.08, y: 0, z: 0, q: -2e-6 },
    ],
  },
]

export function configById(id: FieldConfigId): FieldConfig {
  return fieldConfigOptions.find((c) => c.id === id) ?? fieldConfigOptions[0]!
}

export function addVec(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function scaleVec(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s }
}

export function length(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z)
}

export function normalize(a: Vec3): Vec3 {
  const L = length(a)
  if (L < 1e-15) return { x: 0, y: 0, z: 0 }
  return { x: a.x / L, y: a.y / L, z: a.z / L }
}

/** 空间一点处的合场强 E（N/C） */
export function electricFieldAt(point: Vec3, charges: FieldCharge[]): Vec3 {
  let ex = 0
  let ey = 0
  let ez = 0
  for (const c of charges) {
    const dx = point.x - c.x
    const dy = point.y - c.y
    const dz = point.z - c.z
    const r2 = dx * dx + dy * dy + dz * dz
    const r = Math.sqrt(r2)
    if (r < 0.012) continue
    const mag = (K_COULOMB * c.q) / r2
    ex += (mag * dx) / r
    ey += (mag * dy) / r
    ez += (mag * dz) / r
  }
  return { x: ex, y: ey, z: ez }
}

/** F = q E */
export function forceFromField(q: number, e: Vec3): Vec3 {
  return scaleVec(e, q)
}

export type AxisProbeAxis = 'join' | 'midplane'

export interface ChargeAxisFrame {
  a: FieldCharge
  b: FieldCharge
  ux: number
  uy: number
  px: number
  py: number
  mx: number
  my: number
  len: number
}

export interface AxisForceComponent {
  fx: number
  fy: number
  mag: number
  label: string
  color: string
}

/** 两电荷连线 / 中垂线几何 */
export function getChargeAxisFrame(charges: FieldCharge[]): ChargeAxisFrame | null {
  if (charges.length !== 2) return null
  const a = charges[0]!
  const b = charges[1]!
  const ax = b.x - a.x
  const ay = b.y - a.y
  const len = Math.hypot(ax, ay)
  if (len < 1e-9) return null
  const ux = ax / len
  const uy = ay / len
  return {
    a,
    b,
    ux,
    uy,
    px: -uy,
    py: ux,
    mx: (a.x + b.x) / 2,
    my: (a.y + b.y) / 2,
    len,
  }
}

/** 轴上试探电荷位置。join: t∈[0,1]；midplane: t 为沿中垂线的有符号位移（米） */
export function axisProbePosition(
  charges: FieldCharge[],
  axis: AxisProbeAxis,
  t: number,
): Vec3 | null {
  const frame = getChargeAxisFrame(charges)
  if (!frame) return null
  if (axis === 'join') {
    const tt = Math.min(0.82, Math.max(0.18, t))
    return {
      x: frame.a.x + (frame.b.x - frame.a.x) * tt,
      y: frame.a.y + (frame.b.y - frame.a.y) * tt,
      z: 0,
    }
  }
  const s = Math.min(0.12, Math.max(-0.12, t))
  return {
    x: frame.mx + frame.px * s,
    y: frame.my + frame.py * s,
    z: 0,
  }
}

/** 将世界坐标投影到连线段或中垂线（取较近者）；靠近交点时吸附到中点 */
export function projectOntoChargeAxes(
  charges: FieldCharge[],
  x: number,
  y: number,
): { axis: AxisProbeAxis; t: number; x: number; y: number } | null {
  const frame = getChargeAxisFrame(charges)
  if (!frame) return null

  const dx = x - frame.a.x
  const dy = y - frame.a.y
  let joinT = (dx * frame.ux + dy * frame.uy) / frame.len
  joinT = Math.min(0.82, Math.max(0.18, joinT))
  const joinX = frame.a.x + (frame.b.x - frame.a.x) * joinT
  const joinY = frame.a.y + (frame.b.y - frame.a.y) * joinT
  const joinDist = Math.hypot(x - joinX, y - joinY)

  let midT = (x - frame.mx) * frame.px + (y - frame.my) * frame.py
  midT = Math.min(0.12, Math.max(-0.12, midT))
  const midX = frame.mx + frame.px * midT
  const midY = frame.my + frame.py * midT
  const midDist = Math.hypot(x - midX, y - midY)

  const preferJoin = joinDist <= midDist
  let axis: AxisProbeAxis = preferJoin ? 'join' : 'midplane'
  let t = preferJoin ? joinT : midT
  let px = preferJoin ? joinX : midX
  let py = preferJoin ? joinY : midY

  // 靠近连线与中垂线交点时吸附到中点，便于对准
  const snapRadius = 0.016
  const distToCenter = Math.hypot(px - frame.mx, py - frame.my)
  if (distToCenter < snapRadius) {
    axis = preferJoin ? 'join' : 'midplane'
    t = preferJoin ? 0.5 : 0
    px = frame.mx
    py = frame.my
  }

  return { axis, t, x: px, y: py }
}

/** 正试探电荷在一点所受各源电荷分力与合力 */
export function forcesOnPositiveTest(
  point: Vec3,
  charges: FieldCharge[],
  qTest: number,
): { components: AxisForceComponent[]; netFx: number; netFy: number; netMag: number } {
  const components: AxisForceComponent[] = []
  let netFx = 0
  let netFy = 0
  charges.forEach((c, index) => {
    const dx = point.x - c.x
    const dy = point.y - c.y
    const r2 = dx * dx + dy * dy
    const r = Math.sqrt(r2)
    if (r < 0.016) return
    // F = k q_test q / r²，方向沿径向（同号相斥：q_test>0 时与 q 同号则背离源）
    const mag = (K_COULOMB * qTest * c.q) / r2
    const fx = (mag * dx) / r
    const fy = (mag * dy) / r
    netFx += fx
    netFy += fy
    components.push({
      fx,
      fy,
      mag: Math.hypot(fx, fy),
      label: `F${index + 1}`,
      color: c.q >= 0 ? '#f87171' : '#60a5fa',
    })
  })
  return {
    components,
    netFx,
    netFy,
    netMag: Math.hypot(netFx, netFy),
  }
}

/**
 * 轴上试探力的固定参考尺度（不随拖动点变化）。
 * 取中等位置的 |F合|，避免近电荷处极大分力把箭头压得过短。
 */
export function axisForceReferenceMag(charges: FieldCharge[], qTest: number): number {
  const samples: number[] = []
  for (const t of [0.32, 0.4, 0.5, 0.6, 0.68]) {
    const pos = axisProbePosition(charges, 'join', t)
    if (!pos) continue
    samples.push(forcesOnPositiveTest(pos, charges, qTest).netMag)
  }
  for (const t of [-0.07, -0.045, 0.045, 0.07]) {
    const pos = axisProbePosition(charges, 'midplane', t)
    if (!pos) continue
    samples.push(forcesOnPositiveTest(pos, charges, qTest).netMag)
  }
  const positive = samples.filter((v) => v > 1e-15)
  if (positive.length === 0) return 1e-12
  // 用中位数，进一步避免个别较大点拉高比例尺
  positive.sort((a, b) => a - b)
  return positive[Math.floor(positive.length / 2)]! || 1e-12
}

function distToNearestCharge(p: Vec3, charges: FieldCharge[]): number {
  let min = Infinity
  for (const c of charges) {
    min = Math.min(min, Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z))
  }
  return min
}

function fibonacciSphere(n: number, radius: number): Vec3[] {
  const pts: Vec3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    pts.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius,
    })
  }
  return pts
}

/**
 * 从种子点沿 ±E 积分得到电场线折线。
 * 正电荷附近沿 +E 出发；负电荷附近沿 −E（即朝电荷汇入）。
 */
export function traceFieldLine(
  start: Vec3,
  charges: FieldCharge[],
  forward: boolean,
  maxSteps = 90,
  step = 0.008,
): Vec3[] {
  const path: Vec3[] = [{ ...start }]
  let p = { ...start }
  for (let i = 0; i < maxSteps; i += 1) {
    const e = electricFieldAt(p, charges)
    const L = length(e)
    if (L < 1e-3) break
    const dir = normalize(e)
    const s = forward ? step : -step
    p = {
      x: p.x + dir.x * s,
      y: p.y + dir.y * s,
      z: p.z + dir.z * s,
    }
    if (Math.hypot(p.x, p.y, p.z) > 0.32) break
    if (distToNearestCharge(p, charges) < 0.014) {
      path.push(p)
      break
    }
    path.push(p)
  }
  return path
}

/** 为当前组态生成一组 3D 电场线 */
export function buildFieldLines(charges: FieldCharge[], configId: FieldConfigId): Vec3[][] {
  const lines: Vec3[][] = []
  const seedsPerCharge = configId === 'single' ? 28 : 18

  for (const charge of charges) {
    const seeds = fibonacciSphere(seedsPerCharge, 0.028)
    for (const seed of seeds) {
      const start = {
        x: charge.x + seed.x,
        y: charge.y + seed.y,
        z: charge.z + seed.z,
      }
      if (charge.q > 0) {
        lines.push(traceFieldLine(start, charges, true))
      } else if (charge.q < 0) {
        lines.push(traceFieldLine(start, charges, false))
      }
    }
  }

  if (configId === 'opposite') {
    const positive = charges.find((c) => c.q > 0)
    const seedX = positive ? positive.x + 0.03 * Math.sign(positive.x || 1) : -0.05
    for (let i = 0; i < 12; i += 1) {
      const ang = (i / 12) * Math.PI * 2
      const start = {
        x: seedX,
        y: Math.cos(ang) * 0.04,
        z: Math.sin(ang) * 0.04,
      }
      lines.push(traceFieldLine(start, charges, true))
    }
  }

  return lines
}

/** 在 xy 平面内沿 ±E 积分电场线 */
export function traceFieldLine2D(
  start: Vec3,
  charges: FieldCharge[],
  forward: boolean,
  options?: {
    maxSteps?: number
    step?: number
    /** 同种电荷：接近两电荷中垂线时停止 */
    stopNearMidplane?: boolean
  },
): Vec3[] {
  const maxSteps = options?.maxSteps ?? 140
  const step = options?.step ?? 0.006
  const stopNearMidplane = options?.stopNearMidplane ?? false

  const path: Vec3[] = [{ x: start.x, y: start.y, z: 0 }]
  let p = { x: start.x, y: start.y, z: 0 }

  let mid: { mx: number; my: number; ux: number; uy: number } | null = null
  let startDist = 0
  if (stopNearMidplane && charges.length === 2) {
    const a = charges[0]!
    const b = charges[1]!
    const ax = b.x - a.x
    const ay = b.y - a.y
    const aLen = Math.hypot(ax, ay) || 1
    mid = {
      mx: (a.x + b.x) / 2,
      my: (a.y + b.y) / 2,
      ux: ax / aLen,
      uy: ay / aLen,
    }
    startDist = (start.x - mid.mx) * mid.ux + (start.y - mid.my) * mid.uy
  }

  for (let i = 0; i < maxSteps; i += 1) {
    const e = electricFieldAt(p, charges)
    const L = Math.hypot(e.x, e.y)
    if (L < 80) break
    const s = (forward ? step : -step) / L
    p = {
      x: p.x + e.x * s,
      y: p.y + e.y * s,
      z: 0,
    }
    if (Math.hypot(p.x, p.y) > 0.3) break
    if (distToNearestCharge(p, charges) < 0.014) {
      path.push(p)
      break
    }
    // 同种：画到中垂线附近即停（不跨过），保留横向位置
    if (mid && Math.abs(startDist) > 1e-6) {
      const pDist = (p.x - mid.mx) * mid.ux + (p.y - mid.my) * mid.uy
      if (pDist * startDist <= 0 || Math.abs(pDist) < 0.012) {
        const edge = 0.012 * Math.sign(startDist)
        const perpX = p.x - mid.mx - mid.ux * pDist
        const perpY = p.y - mid.my - mid.uy * pDist
        path.push({
          x: mid.mx + mid.ux * edge + perpX,
          y: mid.my + mid.uy * edge + perpY,
          z: 0,
        })
        break
      }
    }
    path.push(p)
  }
  return path
}

/** 种子方向是否几乎沿着两电荷连线指向对方（会产生连线中段的水平线） */
function seedAlongJoiningTowardSibling(
  charge: FieldCharge,
  seedDx: number,
  seedDy: number,
  charges: FieldCharge[],
  maxAngleDeg = 28,
): boolean {
  if (charges.length !== 2) return false
  const other = charges.find((c) => c !== charge)
  if (!other) return false
  const ox = other.x - charge.x
  const oy = other.y - charge.y
  const oLen = Math.hypot(ox, oy)
  if (oLen < 1e-9) return false
  const cos = (seedDx * ox + seedDy * oy) / oLen
  return cos > Math.cos((maxAngleDeg * Math.PI) / 180)
}

/** 路径是否几乎贴着两电荷连线横穿中缝（不要的水平段） */
function lineHugsJoiningAxis(line: Vec3[], charges: FieldCharge[]): boolean {
  if (charges.length !== 2 || line.length < 2) return false
  const a = charges[0]!
  const b = charges[1]!
  const ax = b.x - a.x
  const ay = b.y - a.y
  const aLen = Math.hypot(ax, ay) || 1
  const ux = ax / aLen
  const uy = ay / aLen
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2

  let sawNearMid = false
  let maxPerp = 0
  for (const p of line) {
    const along = (p.x - mx) * ux + (p.y - my) * uy
    if (Math.abs(along) > 0.04) continue
    sawNearMid = true
    const perpX = p.x - mx - ux * along
    const perpY = p.y - my - uy * along
    maxPerp = Math.max(maxPerp, Math.hypot(perpX, perpY))
  }
  return sawNearMid && maxPerp < 0.018
}

/** 为当前组态生成一组二维（xy 平面）电场线 */
export function buildFieldLines2D(charges: FieldCharge[], configId: FieldConfigId): Vec3[][] {
  const lines: Vec3[][] = []

  // 异种：正电荷四周都出线；负电荷只在背离正电荷的一侧布种，
  // 避免“正→负”连线被画两遍，同时保证负电荷外侧仍有电场线汇入
  if (configId === 'opposite') {
    const seedCount = 12
    const seedR = 0.028

    for (const charge of charges) {
      if (charge.q === 0) continue
      const other = charges.find((c) => c !== charge)
      const toOther =
        other != null
          ? {
              x: other.x - charge.x,
              y: other.y - charge.y,
            }
          : null
      const toOtherLen = toOther ? Math.hypot(toOther.x, toOther.y) : 0

      for (let i = 0; i < seedCount; i += 1) {
        const ang = ((i + 0.5) / seedCount) * Math.PI * 2
        const dx = Math.cos(ang)
        const dy = Math.sin(ang)

        // 负电荷：只保留背离正电荷的后侧锥内种子；
        // 上下两侧若也布种，会与正电荷顶/底线成对重叠
        if (charge.q < 0 && toOther && toOtherLen > 1e-9) {
          const cos = (dx * toOther.x + dy * toOther.y) / toOtherLen
          if (cos > -0.55) continue
        }

        const start = {
          x: charge.x + dx * seedR,
          y: charge.y + dy * seedR,
          z: 0,
        }
        const line = traceFieldLine2D(start, charges, charge.q > 0, {
          maxSteps: 160,
          step: 0.005,
        })
        if (line.length >= 4) lines.push(line)
      }
    }
    return lines
  }

  const seedsPerCharge = configId === 'single' ? 16 : 16

  for (const charge of charges) {
    for (let i = 0; i < seedsPerCharge; i += 1) {
      const ang = (i / seedsPerCharge) * Math.PI * 2
      const dx = Math.cos(ang)
      const dy = Math.sin(ang)

      // 同种：只去掉几乎正对另一电荷的水平种子，保留斜向接近中垂线的线
      if (configId === 'same' && seedAlongJoiningTowardSibling(charge, dx, dy, charges)) {
        continue
      }

      const start = {
        x: charge.x + dx * 0.028,
        y: charge.y + dy * 0.028,
        z: 0,
      }
      if (charge.q === 0) continue

      const line = traceFieldLine2D(start, charges, charge.q > 0, {
        stopNearMidplane: configId === 'same',
      })
      if (line.length < 4) continue
      if (configId === 'same' && lineHugsJoiningAxis(line, charges)) continue
      lines.push(line)
    }
  }

  return lines
}

/** 二维画布世界范围（米） */
export const FIELD_2D_BOUNDS = {
  minX: -0.28,
  maxX: 0.28,
  minY: -0.2,
  maxY: 0.2,
} as const

export function cloneCharges(charges: FieldCharge[]): FieldCharge[] {
  return charges.map((c) => ({ ...c }))
}

export function formatSourceCharge(q: number): string {
  const uc = q * 1e6
  if (Math.abs(uc) < 0.05) return '0 μC'
  const sign = uc > 0 ? '+' : ''
  return `${sign}${uc.toFixed(1)} μC`
}

export function formatE(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs < 1e-6) return '0 N/C'
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}×10⁶ N/C`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}×10³ N/C`
  return `${sign}${abs.toFixed(1)} N/C`
}

export function formatF(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs < 1e-12) return '0 N'
  if (abs >= 1) return `${sign}${abs.toFixed(3)} N`
  if (abs >= 1e-3) return `${sign}${(abs * 1e3).toFixed(2)} mN`
  return `${sign}${abs.toExponential(2)} N`
}

/** 简易欧拉角旋转 */
export function rotatePoint(p: Vec3, rotX: number, rotY: number): Vec3 {
  const cosY = Math.cos(rotY)
  const sinY = Math.sin(rotY)
  const x1 = p.x * cosY + p.z * sinY
  const z1 = -p.x * sinY + p.z * cosY
  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)
  const y2 = p.y * cosX - z1 * sinX
  const z2 = p.y * sinX + z1 * cosX
  return { x: x1, y: y2, z: z2 }
}
