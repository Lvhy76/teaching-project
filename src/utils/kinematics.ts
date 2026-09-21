export interface KinematicsParams {
  x0: number
  v0: number
  acceleration: number
}

/** v = v0 + a t */
export function velocityAt(params: KinematicsParams, time: number): number {
  return params.v0 + params.acceleration * time
}

/** x = x0 + v0 t + ½ a t² */
export function positionAt(params: KinematicsParams, time: number): number {
  return params.x0 + params.v0 * time + 0.5 * params.acceleration * time * time
}
