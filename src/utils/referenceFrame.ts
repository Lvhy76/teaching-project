export type FrameId = 'ground' | 'car' | 'plane'

export interface FrameOption {
  id: FrameId
  label: string
  hint: string
}

export const frameOptions: FrameOption[] = [
  { id: 'ground', label: '地面', hint: '树木和路面相对静止' },
  { id: 'car', label: '汽车', hint: '车厢相对静止，地面向后掠过' },
  { id: 'plane', label: '飞机', hint: '飞机相对静止，地面和汽车都向后运动' },
]

export const SEAT_OFFSET = -3.2
export const PLANE_OFFSET = 8
export const CAR_HALF_LENGTH = 5

export interface SceneVelocities {
  vCar: number
  vWalk: number
  vPlane: number
}

export interface FramePositions {
  person: number
  car: number
  plane: number
}

export function frameVelocity(frame: FrameId, scene: SceneVelocities): number {
  if (frame === 'car') return scene.vCar
  if (frame === 'plane') return scene.vPlane
  return 0
}

export function personGroundVelocity(scene: SceneVelocities): number {
  return scene.vCar + scene.vWalk
}

export function relativeVelocity(groundVelocity: number, frameVelocityValue: number): number {
  return groundVelocity - frameVelocityValue
}

export function carPosition(vCar: number, time: number): number {
  return vCar * time
}

export function personPosition(scene: SceneVelocities, time: number, seatOffset: number): number {
  return carPosition(scene.vCar, time) + seatOffset + scene.vWalk * time
}

export function planePosition(vPlane: number, time: number, planeOffset: number): number {
  return planeOffset + vPlane * time
}

/** 把地面坐标换到所选参考系，参考系原点的坐标恒为 0。 */
export function positionInFrame(
  frame: FrameId,
  scene: SceneVelocities,
  time: number,
): FramePositions {
  const person = personPosition(scene, time, SEAT_OFFSET)
  const car = carPosition(scene.vCar, time)
  const plane = planePosition(scene.vPlane, time, PLANE_OFFSET)
  const origin = frame === 'car' ? car : frame === 'plane' ? plane : 0
  return {
    person: person - origin,
    car: car - origin,
    plane: plane - origin,
  }
}
