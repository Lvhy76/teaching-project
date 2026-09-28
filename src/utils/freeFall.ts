/** 自由落体：取竖直向下为正，初速度为 0。 */

export const DEFAULT_G = 9.8
export const DEFAULT_HEIGHT = 20

export function fallTime(height: number, g: number, v0 = 0): number {
  if (g <= 0) return 0
  // y = v0 t + ½ g t² = height
  if (Math.abs(v0) < 1e-9) return Math.sqrt((2 * height) / g)
  const discriminant = v0 * v0 + 2 * g * height
  if (discriminant < 0) return 0
  return (-v0 + Math.sqrt(discriminant)) / g
}

/** 下落位移（向下为正） */
export function fallenDistance(g: number, time: number, v0 = 0): number {
  return v0 * time + 0.5 * g * time * time
}

export function velocityDown(g: number, time: number, v0 = 0): number {
  return v0 + g * time
}

export function heightAboveGround(
  releaseHeight: number,
  g: number,
  time: number,
  v0 = 0,
): number {
  return Math.max(0, releaseHeight - fallenDistance(g, time, v0))
}

export function formatValue(value: number, digits = 2): string {
  return value.toFixed(digits)
}
