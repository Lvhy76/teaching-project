/** 往返运动：先向右再向左，便于对比位移与路程。 */

export const TURN_TIME = 4
export const SPEED = 2
export const TOTAL_DURATION = 8

export function velocityAt(time: number): number {
  if (time < 0) return SPEED
  if (time < TURN_TIME) return SPEED
  if (time <= TOTAL_DURATION) return -SPEED
  return 0
}

export function positionAt(time: number): number {
  const t = Math.min(Math.max(time, 0), TOTAL_DURATION)
  if (t <= TURN_TIME) return SPEED * t
  return SPEED * TURN_TIME - SPEED * (t - TURN_TIME)
}

/** 从 tA 到 tB 的位移（带方向） */
export function displacementBetween(tA: number, tB: number): number {
  return positionAt(tB) - positionAt(tA)
}

/** 从 tA 到 tB 的路程（路径长度） */
export function pathLengthBetween(tA: number, tB: number): number {
  const start = Math.min(tA, tB)
  const end = Math.max(tA, tB)
  if (end - start < 1e-9) return 0

  const steps = Math.max(24, Math.ceil((end - start) * 20))
  let length = 0
  let prev = positionAt(start)
  for (let index = 1; index <= steps; index += 1) {
    const time = start + ((end - start) * index) / steps
    const next = positionAt(time)
    length += Math.abs(next - prev)
    prev = next
  }
  return length
}

export function formatSigned(value: number, digits = 1): string {
  const rounded = Math.abs(value) < 5 * 10 ** -(digits + 1) ? 0 : value
  const text = Math.abs(rounded).toFixed(digits)
  if (rounded > 0) return `+${text}`
  if (rounded < 0) return `-${text}`
  return text
}
