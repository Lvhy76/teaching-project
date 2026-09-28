/** 匀强电场中电场力做功与路径无关。 */

export type PathId = 'straight' | 'elbow-h' | 'elbow-v' | 'arc' | 'zigzag'

export interface Vec2 {
  x: number
  y: number
}

export interface PathOption {
  id: PathId
  label: string
  hint: string
  color: string
}

/** 仿真坐标：单位 m；匀强电场水平向右 */
export const POINT_A: Vec2 = { x: 0.12, y: 0.28 }
export const POINT_B: Vec2 = { x: 0.58, y: 0.1 }
export const FIELD_BOUNDS = { minX: 0, maxX: 0.7, minY: 0, maxY: 0.4 }

export const pathOptions: PathOption[] = [
  { id: 'straight', label: '直线', hint: 'A 直接到 B', color: '#1d4ed8' },
  { id: 'elbow-h', label: '折线（先水平）', hint: '先沿 x 再沿 y', color: '#ea580c' },
  { id: 'elbow-v', label: '折线（先竖直）', hint: '先沿 y 再沿 x', color: '#16a34a' },
  { id: 'arc', label: '圆弧', hint: '绕上方弧线', color: '#7c3aed' },
  { id: 'zigzag', label: '折线迂回', hint: '多段折线绕行', color: '#db2777' },
]

export function pathMeta(id: PathId): PathOption {
  return pathOptions.find((item) => item.id === id) ?? pathOptions[0]!
}

/** 生成路径折点（含起终点）；圆弧用若干段近似 */
export function pathWaypoints(id: PathId, a: Vec2 = POINT_A, b: Vec2 = POINT_B): Vec2[] {
  switch (id) {
    case 'straight':
      return [a, b]
    case 'elbow-h':
      return [a, { x: b.x, y: a.y }, b]
    case 'elbow-v':
      return [a, { x: a.x, y: b.y }, b]
    case 'arc': {
      // 二次贝塞尔：控制点抬高，形成明显绕行弧
      const control: Vec2 = {
        x: (a.x + b.x) / 2,
        y: Math.max(a.y, b.y) + 0.14,
      }
      const steps = 40
      const pts: Vec2[] = []
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps
        const u = 1 - t
        pts.push({
          x: u * u * a.x + 2 * u * t * control.x + t * t * b.x,
          y: u * u * a.y + 2 * u * t * control.y + t * t * b.y,
        })
      }
      return pts
    }
    case 'zigzag': {
      const x1 = a.x + (b.x - a.x) * 0.28
      const x2 = a.x + (b.x - a.x) * 0.55
      const x3 = a.x + (b.x - a.x) * 0.78
      const yHigh = Math.max(a.y, b.y) + 0.08
      const yLow = Math.min(a.y, b.y) - 0.02
      return [
        a,
        { x: x1, y: yHigh },
        { x: x2, y: yLow },
        { x: x3, y: yHigh },
        b,
      ]
    }
    default:
      return [a, b]
  }
}

export function segmentLength(p: Vec2, q: Vec2): number {
  return Math.hypot(q.x - p.x, q.y - p.y)
}

export function pathLength(points: Vec2[]): number {
  let sum = 0
  for (let i = 1; i < points.length; i += 1) {
    sum += segmentLength(points[i - 1]!, points[i]!)
  }
  return sum
}

/** 按弧长比例 t∈[0,1] 取路径上的点 */
export function pointOnPath(points: Vec2[], t: number): Vec2 {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1 || t <= 0) return { ...points[0]! }
  if (t >= 1) return { ...points[points.length - 1]! }

  const total = pathLength(points)
  if (total < 1e-12) return { ...points[0]! }
  let remain = total * t
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]!
    const b = points[i]!
    const len = segmentLength(a, b)
    if (remain <= len || i === points.length - 1) {
      const u = len < 1e-12 ? 0 : remain / len
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }
    }
    remain -= len
  }
  return { ...points[points.length - 1]! }
}

/**
 * 匀强电场 E = (Ex, 0) 时，电场力做功 W = q Ex Δx，
 * 只与始末位置的水平位移有关。
 */
export function workUniform(q: number, ex: number, from: Vec2, to: Vec2): number {
  return q * ex * (to.x - from.x)
}

/** 沿路径累积做功（匀强水平电场）：∫ q Ex dx = q Ex (x(t)−xA) */
export function workAlongProgress(
  q: number,
  ex: number,
  points: Vec2[],
  t: number,
): number {
  const p = pointOnPath(points, t)
  const a = points[0] ?? POINT_A
  return workUniform(q, ex, a, p)
}

export function formatWork(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1) return `${sign}${abs.toFixed(3)} J`
  if (abs >= 1e-3) return `${sign}${(abs * 1e3).toFixed(2)} mJ`
  if (abs >= 1e-6) return `${sign}${(abs * 1e6).toFixed(2)} μJ`
  if (abs < 1e-18) return '0 J'
  return `${value.toExponential(2)} J`
}

export function formatLength(meters: number): string {
  return `${(meters * 100).toFixed(1)} cm`
}
