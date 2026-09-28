import { positionAt, velocityAt, type KinematicsParams } from '@/utils/kinematics'

export type { KinematicsParams }

export const ACCELERATION_DURATION = 6

export const defaultAccelerationParams: KinematicsParams = {
  x0: 0,
  v0: 4,
  acceleration: -1.2,
}

/** 平均加速度：Δv / Δt */
export function averageAcceleration(params: KinematicsParams, tA: number, tB: number): number {
  const dt = tB - tA
  if (Math.abs(dt) < 1e-9) return params.acceleration
  return (velocityAt(params, tB) - velocityAt(params, tA)) / dt
}

export type SpeedChangeKind = 'speeding-up' | 'slowing-down' | 'constant' | 'turning'

/**
 * 根据速度与加速度的方向关系，判断速率如何变化。
 * - 同号：加速（速率增大）
 * - 异号：减速（速率减小）；若将越过 0，会发生速度反向
 * - a≈0：速率几乎不变
 */
export function speedChangeKind(velocity: number, acceleration: number): SpeedChangeKind {
  if (Math.abs(acceleration) < 1e-6) return 'constant'
  if (Math.abs(velocity) < 1e-6) return acceleration === 0 ? 'constant' : 'speeding-up'
  if (velocity * acceleration > 0) return 'speeding-up'
  return 'slowing-down'
}

export function speedChangeLabel(kind: SpeedChangeKind): string {
  if (kind === 'speeding-up') return '加速（速率增大）'
  if (kind === 'slowing-down') return '减速（速率减小）'
  if (kind === 'turning') return '速度即将反向'
  return '匀速（速率不变）'
}

export function directionRelation(velocity: number, acceleration: number): string {
  if (Math.abs(acceleration) < 1e-6) return '加速度为 0，速度方向保持不变'
  if (Math.abs(velocity) < 1e-6) return '此刻速度为 0，加速度决定下一瞬间的速度方向'
  if (velocity * acceleration > 0) return '速度与加速度同向 → 加速'
  return '速度与加速度反向 → 减速'
}

export function formatSigned(value: number, digits = 2): string {
  const rounded = Math.abs(value) < 5 * 10 ** -(digits + 1) ? 0 : value
  const text = Math.abs(rounded).toFixed(digits)
  if (rounded > 0) return `+${text}`
  if (rounded < 0) return `-${text}`
  return text
}

export { positionAt, velocityAt }
