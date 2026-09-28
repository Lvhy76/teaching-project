/** 带电粒子在匀强电场中的加速与偏转（类平抛）。 */

export type MotionMode = 'accelerate' | 'deflect'

export interface Vec2 {
  x: number
  y: number
}

export interface ParticleState {
  x: number
  y: number
  vx: number
  vy: number
  ax: number
  ay: number
  inField: boolean
  exited: boolean
  done: boolean
}

export const motionModeOptions: { id: MotionMode; label: string; hint: string }[] = [
  { id: 'accelerate', label: '加速', hint: '初速与电场同向，匀加速直线运动' },
  { id: 'deflect', label: '偏转（类平抛）', hint: '初速垂直电场，抛物线轨迹' },
]

/** 仿真坐标系（m） */
export const MOTION_BOUNDS = {
  minX: -0.02,
  maxX: 0.42,
  minY: -0.14,
  maxY: 0.14,
}

/** 偏转场区：水平平行板之间 */
export const DEFLECT_FIELD = {
  x0: 0.06,
  length: 0.22,
  yTop: 0.1,
  yBottom: -0.1,
}

/** 加速场区：竖直平行板之间 */
export const ACCEL_FIELD = {
  xLeft: 0.04,
  xRight: 0.36,
  yTop: 0.1,
  yBottom: -0.1,
}

export function acceleration(q: number, m: number, e: number): number {
  if (m <= 0) return 0
  return (q * e) / m
}

/**
 * 加速模式：E 水平向右，粒子从左侧进入，a = qE/m 沿 x。
 * 出界或碰到右板则结束。
 */
export function stateAccelerate(
  t: number,
  q: number,
  m: number,
  e: number,
  v0: number,
): ParticleState {
  const a = acceleration(q, m, e)
  const x0 = ACCEL_FIELD.xLeft + 0.01
  const y0 = 0
  const x = x0 + v0 * t + 0.5 * a * t * t
  const vx = v0 + a * t
  const hitRight = x >= ACCEL_FIELD.xRight - 0.01
  const hitTop = false
  const hitBottom = false
  const done = hitRight || hitTop || hitBottom || t > 8
  return {
    x: done && hitRight ? ACCEL_FIELD.xRight - 0.01 : x,
    y: y0,
    vx: done && hitRight ? Math.max(0, vx) : vx,
    vy: 0,
    ax: a,
    ay: 0,
    inField: x >= ACCEL_FIELD.xLeft && x <= ACCEL_FIELD.xRight,
    exited: hitRight,
    done,
  }
}

/**
 * 偏转模式：E 竖直向下（Ey = −|E| 表示向下，正电荷受力向下），
 * 初速水平向右。场区内类平抛；出电场后匀速直线运动。
 */
export function stateDeflect(
  t: number,
  q: number,
  m: number,
  e: number,
  v0: number,
): ParticleState {
  const aMag = acceleration(q, m, Math.abs(e))
  // E 向下为正约定：e>0 表示场强方向向下；正电荷 ay 向下为负（屏幕 y 向上）
  const fieldDown = e >= 0
  const ayInField = (q >= 0) === fieldDown ? -aMag : aMag

  const xEnter = DEFLECT_FIELD.x0
  const y0 = 0
  const tField = DEFLECT_FIELD.length / Math.max(v0, 1e-9)

  let x: number
  let y: number
  let vx = v0
  let vy: number
  let ax = 0
  let ay = 0
  let inField = false
  let exited = false

  if (t <= tField) {
    inField = true
    ax = 0
    ay = ayInField
    x = xEnter + v0 * t
    y = y0 + 0.5 * ayInField * t * t
    vy = ayInField * t
  } else {
    exited = true
    const yExit = y0 + 0.5 * ayInField * tField * tField
    const vyExit = ayInField * tField
    const dt = t - tField
    x = xEnter + DEFLECT_FIELD.length + v0 * dt
    y = yExit + vyExit * dt
    vy = vyExit
  }

  // 只有还在极板水平范围内才判碰板；出电场后自由飞出
  const underPlates = x >= DEFLECT_FIELD.x0 && x <= DEFLECT_FIELD.x0 + DEFLECT_FIELD.length
  const hitPlate =
    underPlates &&
    (y >= DEFLECT_FIELD.yTop - 0.005 || y <= DEFLECT_FIELD.yBottom + 0.005)
  const outRight = x >= MOTION_BOUNDS.maxX - 0.01
  const outVertical = y > MOTION_BOUNDS.maxY || y < MOTION_BOUNDS.minY
  const done = hitPlate || outRight || outVertical || t > 8

  if (hitPlate) {
    y = Math.min(DEFLECT_FIELD.yTop - 0.005, Math.max(DEFLECT_FIELD.yBottom + 0.005, y))
  }

  return { x, y, vx, vy, ax, ay, inField, exited, done }
}

export function stateAt(
  mode: MotionMode,
  t: number,
  q: number,
  m: number,
  e: number,
  v0: number,
): ParticleState {
  return mode === 'accelerate'
    ? stateAccelerate(t, q, m, e, v0)
    : stateDeflect(t, q, m, e, v0)
}

/** 采样轨迹点（用于预览虚线全轨迹） */
export function sampleTrajectory(
  mode: MotionMode,
  q: number,
  m: number,
  e: number,
  v0: number,
  steps = 80,
): Vec2[] {
  const pts: Vec2[] = []
  let t = 0
  const dt = 0.002
  for (let i = 0; i < steps * 20; i += 1) {
    const s = stateAt(mode, t, q, m, e, v0)
    pts.push({ x: s.x, y: s.y })
    if (s.done) break
    t += dt
  }
  return pts
}

export function formatAccel(a: number): string {
  const abs = Math.abs(a)
  const sign = a < 0 ? '-' : ''
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(2)} km/s²`
  return `${sign}${abs.toFixed(1)} m/s²`
}

export function formatSpeed(v: number): string {
  return `${v.toFixed(2)} m/s`
}

export function formatAngle(rad: number): string {
  if (!Number.isFinite(rad)) return '—'
  return `${((rad * 180) / Math.PI).toFixed(1)}°`
}

/** 出射偏转角：tanθ = vy/vx */
export function deflectAngle(vx: number, vy: number): number {
  if (Math.abs(vx) < 1e-12) return Math.sign(vy) * (Math.PI / 2)
  return Math.atan(vy / vx)
}
