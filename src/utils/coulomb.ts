/** 库仑定律：两点电荷间的静电力。 */

export const K_COULOMB = 9e9

export interface CoulombResult {
  /** 力的大小 F = k|Q1 Q2|/r²（N） */
  magnitude: number
  /** 同号相斥 true，异号相吸 false */
  repulsive: boolean
  /** Q1=0 或 Q2=0 或 r 过小 */
  valid: boolean
}

/** F = k |Q1 Q2| / r²；方向由电荷符号决定 */
export function coulombForce(q1: number, q2: number, r: number): CoulombResult {
  if (r < 1e-6 || (Math.abs(q1) < 1e-20 && Math.abs(q2) < 1e-20)) {
    return { magnitude: 0, repulsive: false, valid: false }
  }
  if (Math.abs(q1) < 1e-20 || Math.abs(q2) < 1e-20) {
    return { magnitude: 0, repulsive: false, valid: true }
  }
  const magnitude = (K_COULOMB * Math.abs(q1 * q2)) / (r * r)
  const repulsive = q1 * q2 > 0
  return { magnitude, repulsive, valid: true }
}

export function formatChargeUC(valueUC: number): string {
  if (Math.abs(valueUC) < 0.05) return '0 μC'
  const sign = valueUC > 0 ? '+' : ''
  return `${sign}${valueUC.toFixed(1)} μC`
}

export function formatDistance(meters: number): string {
  if (meters >= 1) return `${meters.toFixed(2)} m`
  return `${(meters * 100).toFixed(1)} cm`
}

export function formatForce(newtons: number): string {
  if (!Number.isFinite(newtons) || newtons < 0) return '—'
  if (newtons < 1e-12) return '0 N'
  if (newtons >= 1e3) return `${(newtons / 1e3).toFixed(2)} kN`
  if (newtons >= 1) return `${newtons.toFixed(2)} N`
  if (newtons >= 1e-3) return `${(newtons * 1e3).toFixed(2)} mN`
  return `${newtons.toExponential(2)} N`
}

export function forceDirectionLabel(repulsive: boolean, q1: number, q2: number): string {
  if (Math.abs(q1) < 1e-20 || Math.abs(q2) < 1e-20) return '无力（有电荷为零）'
  return repulsive ? '排斥（同号）' : '吸引（异号）'
}
