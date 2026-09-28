/** 点电荷电势与电势能（国际单位，k = 9×10⁹）。 */

export const K_COULOMB = 9e9

export interface PointCharge {
  x: number
  y: number
  q: number
}

/** 电势 φ = k Q / r（相对无穷远为零） */
export function potentialAt(source: PointCharge, x: number, y: number): number {
  const dx = x - source.x
  const dy = y - source.y
  const r = Math.hypot(dx, dy)
  if (r < 1e-4) return source.q >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
  return (K_COULOMB * source.q) / r
}

/** 电势能 Ep = q φ = k Q q / r */
export function potentialEnergy(source: PointCharge, test: PointCharge): number {
  const phi = potentialAt(source, test.x, test.y)
  if (!Number.isFinite(phi)) return phi
  return test.q * phi
}

export function distance(a: PointCharge, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function formatScientific(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return value > 0 ? '+∞' : '−∞'
  if (Math.abs(value) < 1e-18) return '0'
  return value.toExponential(digits)
}

export function formatPhi(value: number): string {
  if (!Number.isFinite(value)) return value > 0 ? '+∞' : '−∞'
  if (Math.abs(value) >= 1e4 || (Math.abs(value) > 0 && Math.abs(value) < 1e-2)) {
    return `${value.toExponential(2)} V`
  }
  return `${value.toFixed(1)} V`
}

export function formatEnergy(value: number): string {
  if (!Number.isFinite(value)) return value > 0 ? '+∞' : '−∞'
  const abs = Math.abs(value)
  if (abs >= 1e-3) return `${value.toExponential(2)} J`
  if (abs >= 1e-6) return `${(value * 1e3).toExponential(2)} mJ`
  if (abs >= 1e-9) return `${(value * 1e6).toExponential(2)} μJ`
  return `${value.toExponential(2)} J`
}
