/** 电势差、等势面与电场力做功（点电荷 / 匀强电场）。 */

import { potentialAt as pointPotentialAt, type PointCharge } from '@/utils/electricPotential'

export type ProbeId = 'A' | 'B'
export type FieldMode = 'point' | 'uniform'

export interface ProbePoint {
  x: number
  y: number
}

export const PD_BOUNDS = {
  minX: -0.35,
  maxX: 0.35,
  minY: -0.22,
  maxY: 0.22,
}

/** 课堂示意用的等势线半径（m，点电荷） */
export const EQUIPOTENTIAL_RADII = [0.07, 0.1, 0.14, 0.18, 0.24, 0.3]

/** 匀强场等势线的 x 位置（m） */
export const UNIFORM_EQUIPOTENTIAL_X = [-0.28, -0.18, -0.08, 0.02, 0.12, 0.22, 0.3]

export const fieldModeOptions: { id: FieldMode; label: string; hint: string }[] = [
  { id: 'point', label: '点电荷电场', hint: '等势面为同心圆' },
  { id: 'uniform', label: '匀强电场', hint: '等势面为平行平面' },
]

export function clampInBounds(x: number, y: number, bounds = PD_BOUNDS): ProbePoint {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, y)),
  }
}

export function clampAwayFromOrigin(
  x: number,
  y: number,
  minR = 0.045,
  bounds = PD_BOUNDS,
): ProbePoint {
  let { x: nx, y: ny } = clampInBounds(x, y, bounds)
  const r = Math.hypot(nx, ny)
  if (r < minR) {
    const scale = minR / Math.max(r, 1e-9)
    nx *= scale
    ny *= scale
  }
  return { x: nx, y: ny }
}

export function clampProbe(mode: FieldMode, x: number, y: number): ProbePoint {
  return mode === 'point' ? clampAwayFromOrigin(x, y) : clampInBounds(x, y)
}

/**
 * 匀强电场：E 水平向右（Ex>0）时，取 φ = −Ex·x（x=0 处 φ=0），
 * 电势沿电场方向降低。
 */
export function uniformPotential(ex: number, x: number): number {
  return -ex * x
}

export function potentialAtMode(
  mode: FieldMode,
  source: PointCharge,
  ex: number,
  x: number,
  y: number,
): number {
  if (mode === 'uniform') return uniformPotential(ex, x)
  return pointPotentialAt(source, x, y)
}

/** U_AB = φ_A − φ_B */
export function potentialDifference(phiA: number, phiB: number): number {
  if (!Number.isFinite(phiA) || !Number.isFinite(phiB)) {
    if (phiA === phiB) return Number.NaN
    if (!Number.isFinite(phiA)) return phiA
    return -phiB
  }
  return phiA - phiB
}

/** W_AB = q U_AB */
export function workFromVoltage(q: number, uAB: number): number {
  if (!Number.isFinite(uAB)) return uAB
  return q * uAB
}

/** ΔEp = Ep_B − Ep_A = −W_AB */
export function deltaPotentialEnergy(epA: number, epB: number): number {
  if (!Number.isFinite(epA) || !Number.isFinite(epB)) return Number.NaN
  return epB - epA
}

export function radiusOf(point: ProbePoint): number {
  return Math.hypot(point.x, point.y)
}

/** 点电荷：同一等势面 = 同半径；匀强场：同一等势面 = 同 x */
export function moveToSameEquipotential(
  mode: FieldMode,
  point: ProbePoint,
  reference: ProbePoint,
): ProbePoint {
  if (mode === 'uniform') {
    return clampProbe(mode, reference.x, point.y)
  }
  const rRef = radiusOf(reference)
  const ang = Math.atan2(point.y, point.x)
  return clampProbe(mode, rRef * Math.cos(ang), rRef * Math.sin(ang))
}

export function onSameEquipotential(mode: FieldMode, a: ProbePoint, b: ProbePoint): boolean {
  if (mode === 'uniform') return Math.abs(a.x - b.x) < 0.004
  return Math.abs(radiusOf(a) - radiusOf(b)) < 0.004
}

export function formatVoltage(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1e-9) return '0 V'
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)} MV`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)} kV`
  if (abs >= 1) return `${sign}${abs.toFixed(1)} V`
  return `${sign}${(abs * 1e3).toFixed(1)} mV`
}

export function formatWork(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1e-18) return '0 J'
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1) return `${sign}${abs.toFixed(3)} J`
  if (abs >= 1e-3) return `${sign}${(abs * 1e3).toFixed(2)} mJ`
  if (abs >= 1e-6) return `${sign}${(abs * 1e6).toFixed(2)} μJ`
  return `${sign}${(abs * 1e9).toFixed(2)} nJ`
}

export function formatPhiLocal(value: number): string {
  return formatVoltage(value)
}

export { pointPotentialAt as potentialAt }
export type { PointCharge }
