export type ChargingMode = 'friction' | 'contact' | 'induction'

export interface ChargingOption {
  id: ChargingMode
  label: string
  hint: string
}

export const chargingOptions: ChargingOption[] = [
  { id: 'friction', label: '摩擦起电', hint: '两种物体相互摩擦，电子发生转移' },
  { id: 'contact', label: '接触起电', hint: '带电体与导体接触，电荷重新分配' },
  { id: 'induction', label: '感应起电', hint: '带电体靠近导体，电荷先分离再转移' },
]

export interface ChargeBody {
  id: string
  label: string
  /** 净电荷（正为 +, 负为 -） */
  charge: number
  /** 用于感应起电：左右两侧局部电荷 */
  leftCharge?: number
  rightCharge?: number
}

export interface ChargingStep {
  title: string
  note: string
  bodies: ChargeBody[]
  /** 可选：箭头说明电子转移方向 */
  transfer?: { from: string; to: string; label: string }
}

/** 摩擦起电：玻璃棒与丝绸。电子从玻璃转移到丝绸。 */
export function frictionSteps(): ChargingStep[] {
  return [
    {
      title: '初始状态',
      note: '玻璃棒与丝绸都不带电，正负电荷数量相等。',
      bodies: [
        { id: 'glass', label: '玻璃棒', charge: 0 },
        { id: 'silk', label: '丝绸', charge: 0 },
      ],
    },
    {
      title: '相互摩擦',
      note: '摩擦使电子从玻璃棒转移到丝绸上。',
      bodies: [
        { id: 'glass', label: '玻璃棒', charge: 0 },
        { id: 'silk', label: '丝绸', charge: 0 },
      ],
      transfer: { from: 'glass', to: 'silk', label: '电子 e⁻' },
    },
    {
      title: '起电结果',
      note: '玻璃棒失去电子带正电，丝绸得到电子带负电。总电荷守恒。',
      bodies: [
        { id: 'glass', label: '玻璃棒', charge: 4 },
        { id: 'silk', label: '丝绸', charge: -4 },
      ],
    },
  ]
}

/** 接触起电：带正电导体与不带电导体接触后分开。 */
export function contactSteps(): ChargingStep[] {
  return [
    {
      title: '初始状态',
      note: '左侧导体带正电，右侧导体不带电。',
      bodies: [
        { id: 'A', label: '导体 A', charge: 6 },
        { id: 'B', label: '导体 B', charge: 0 },
      ],
    },
    {
      title: '相互接触',
      note: '接触后成为一个整体，正电荷重新分配到两端。',
      bodies: [
        { id: 'A', label: '导体 A', charge: 3 },
        { id: 'B', label: '导体 B', charge: 3 },
      ],
      transfer: { from: 'A', to: 'B', label: '电荷分流' },
    },
    {
      title: '分开后',
      note: '两导体都带同种正电荷，电荷量大致均分（相同导体）。',
      bodies: [
        { id: 'A', label: '导体 A', charge: 3 },
        { id: 'B', label: '导体 B', charge: 3 },
      ],
    },
  ]
}

/** 感应起电：带正电棒靠近导体，接地后断开再移走棒。 */
export function inductionSteps(): ChargingStep[] {
  return [
    {
      title: '初始状态',
      note: '导体不带电；旁侧有带正电的棒。',
      bodies: [
        { id: 'rod', label: '带电棒', charge: 5 },
        { id: 'cond', label: '导体', charge: 0, leftCharge: 0, rightCharge: 0 },
      ],
    },
    {
      title: '靠近（未接触）',
      note: '棒上正电荷吸引导体中的电子，近端出现负电荷，远端出现正电荷。',
      bodies: [
        { id: 'rod', label: '带电棒', charge: 5 },
        { id: 'cond', label: '导体', charge: 0, leftCharge: -4, rightCharge: 4 },
      ],
      transfer: { from: 'cond', to: 'rod', label: '电子被吸引' },
    },
    {
      title: '远端接地',
      note: '接地后，远端正电荷被来自大地的电子中和（或正电荷流入大地）。',
      bodies: [
        { id: 'rod', label: '带电棒', charge: 5 },
        { id: 'cond', label: '导体', charge: -4, leftCharge: -4, rightCharge: 0 },
      ],
      transfer: { from: 'earth', to: 'cond', label: '电子流入' },
    },
    {
      title: '断开接地并移走棒',
      note: '导体上留下净负电荷，完成感应起电。棒本身电荷不变。',
      bodies: [
        { id: 'rod', label: '带电棒', charge: 5 },
        { id: 'cond', label: '导体', charge: -4, leftCharge: -4, rightCharge: 0 },
      ],
    },
  ]
}

export function stepsForMode(mode: ChargingMode): ChargingStep[] {
  if (mode === 'friction') return frictionSteps()
  if (mode === 'contact') return contactSteps()
  return inductionSteps()
}
