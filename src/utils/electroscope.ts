/** 验电器：箔片张角随电荷量变化（课堂示意模型）。 */

/**
 * 简化平衡模型：同号电荷相斥使箔片张开，重力使其下垂。
 * 张角（相对竖直方向的半角）随 |Q| 单调增大并趋于饱和：
 * θ = θ_max · |Q| / (|Q| + Q₀)
 */
export const THETA_MAX_DEG = 55
/** 半张角达到约一半最大张角时的 |Q|（μC） */
export const Q_HALF_UC = 3

export function halfAngleDeg(chargeUC: number): number {
  const absQ = Math.abs(chargeUC)
  if (absQ < 1e-9) return 0
  return (THETA_MAX_DEG * absQ) / (absQ + Q_HALF_UC)
}

/** 两箔片之间的全张角 */
export function fullAngleDeg(chargeUC: number): number {
  return halfAngleDeg(chargeUC) * 2
}

export function formatChargeUC(value: number): string {
  if (Math.abs(value) < 0.05) return '0 μC（不带电）'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)} μC`
}

export function formatAngle(deg: number): string {
  return `${deg.toFixed(1)}°`
}
