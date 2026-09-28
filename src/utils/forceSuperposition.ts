/** 静电力叠加：多个点电荷对试探电荷的矢量合成。 */

import { K_COULOMB, formatChargeUC, formatForce } from '@/utils/coulomb'

export interface Vec2 {
  x: number
  y: number
}

export interface PointCharge {
  id: string
  label: string
  x: number
  y: number
  /** 电荷量（C） */
  q: number
  color: string
}

export interface ForceVector {
  fromId: string
  label: string
  fx: number
  fy: number
  magnitude: number
  color: string
}

export const SUPERPOSITION_BOUNDS = {
  minX: -0.24,
  maxX: 0.24,
  minY: -0.24,
  maxY: 0.24,
}

/** 源电荷默认排布在以原点为圆心的圆周上 */
export const SOURCE_ORBIT_R = 0.14

export const SOURCE_COLORS = ['#ea580c', '#16a34a', '#7c3aed']

export function defaultSourcePositions(count: number): { x: number; y: number; qUC: number }[] {
  const n = Math.min(3, Math.max(2, count))
  const qUCList = [3, 2, -2]
  // 2 个：左右对称；3 个：等分圆周，第一个在正上方
  const angles =
    n === 2
      ? [Math.PI, 0]
      : [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 3, -Math.PI / 2 + (4 * Math.PI) / 3]
  return angles.map((ang, i) => ({
    x: SOURCE_ORBIT_R * Math.cos(ang),
    y: SOURCE_ORBIT_R * Math.sin(ang),
    qUC: qUCList[i] ?? 2,
  }))
}

/**
 * 源电荷 source 对试探电荷 test 的库仑力（作用在 test 上）：
 * F = k q_test q_source / r² · r̂，r̂ 由 source 指向 test。
 */
export function forceOnTest(test: PointCharge, source: PointCharge): { fx: number; fy: number } {
  const dx = test.x - source.x
  const dy = test.y - source.y
  const r2 = dx * dx + dy * dy
  const r = Math.sqrt(r2)
  if (r < 0.025 || Math.abs(test.q) < 1e-20 || Math.abs(source.q) < 1e-20) {
    return { fx: 0, fy: 0 }
  }
  const mag = (K_COULOMB * test.q * source.q) / r2
  return { fx: (mag * dx) / r, fy: (mag * dy) / r }
}

export function componentForces(test: PointCharge, sources: PointCharge[]): ForceVector[] {
  return sources.map((source, index) => {
    const { fx, fy } = forceOnTest(test, source)
    return {
      fromId: source.id,
      label: `F${index + 1}`,
      fx,
      fy,
      magnitude: Math.hypot(fx, fy),
      color: source.color,
    }
  })
}

export function resultantForce(components: ForceVector[]): { fx: number; fy: number; magnitude: number } {
  let fx = 0
  let fy = 0
  for (const f of components) {
    fx += f.fx
    fy += f.fy
  }
  return { fx, fy, magnitude: Math.hypot(fx, fy) }
}

export function formatForceAngle(fx: number, fy: number): string {
  if (Math.hypot(fx, fy) < 1e-12) return '—'
  let deg = (Math.atan2(fy, fx) * 180) / Math.PI
  if (deg < 0) deg += 360
  return `${deg.toFixed(0)}°`
}

export function clampPosition(x: number, y: number): Vec2 {
  const { minX, maxX, minY, maxY } = SUPERPOSITION_BOUNDS
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  }
}

/** 避免两电荷重叠过近 */
export function separateFrom(
  pos: Vec2,
  others: { x: number; y: number }[],
  minDist = 0.04,
): Vec2 {
  let { x, y } = pos
  for (const other of others) {
    const dx = x - other.x
    const dy = y - other.y
    const d = Math.hypot(dx, dy)
    if (d < minDist && d > 1e-9) {
      const s = minDist / d
      x = other.x + dx * s
      y = other.y + dy * s
    } else if (d < 1e-9) {
      x = other.x + minDist
    }
  }
  return clampPosition(x, y)
}

export { formatChargeUC, formatForce }
