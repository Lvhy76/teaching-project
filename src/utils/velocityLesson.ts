import { positionAt, velocityAt, type KinematicsParams } from '@/utils/kinematics'

export type { KinematicsParams }

export const VELOCITY_DURATION = 6

export const defaultVelocityParams: KinematicsParams = {
  x0: 0,
  v0: 1,
  acceleration: 1.2,
}

/** 平均速度：Δx / Δt */
export function averageVelocity(params: KinematicsParams, tA: number, tB: number): number {
  const dt = tB - tA
  if (Math.abs(dt) < 1e-9) return velocityAt(params, tA)
  return (positionAt(params, tB) - positionAt(params, tA)) / dt
}

export function instantaneousVelocity(params: KinematicsParams, time: number): number {
  return velocityAt(params, time)
}

export function formatSigned(value: number, digits = 2): string {
  const rounded = Math.abs(value) < 5 * 10 ** -(digits + 1) ? 0 : value
  const text = Math.abs(rounded).toFixed(digits)
  if (rounded > 0) return `+${text}`
  if (rounded < 0) return `-${text}`
  return text
}

export { positionAt, velocityAt }
