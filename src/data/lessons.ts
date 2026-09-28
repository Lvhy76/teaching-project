import kinematicsCover from '@/assets/topics/kinematics.jpg'
import electromagnetismCover from '@/assets/topics/electromagnetism.jpg'

import electrostaticsCover from '@/assets/subtopics/electrostatics.jpg'
import fieldEnergyCover from '@/assets/subtopics/field-energy.jpg'
import currentCover from '@/assets/subtopics/current.jpg'
import magnetismCover from '@/assets/subtopics/magnetism.jpg'
import inductionCover from '@/assets/subtopics/induction.jpg'
import acCover from '@/assets/subtopics/ac.jpg'

import referenceFrameCover from '@/assets/lessons/kinematics/reference-frame.jpg'
import timeDisplacementCover from '@/assets/lessons/kinematics/time-displacement.jpg'
import velocityCover from '@/assets/lessons/kinematics/velocity.jpg'
import accelerationCover from '@/assets/lessons/kinematics/acceleration.jpg'
import uniformAccelerationCover from '@/assets/lessons/kinematics/uniform-acceleration.jpg'
import freeFallCover from '@/assets/lessons/kinematics/free-fall.jpg'

import chargingCover from '@/assets/lessons/electrostatics/charging.jpg'
import electroscopeCover from '@/assets/lessons/electrostatics/electroscope.jpg'
import coulombCover from '@/assets/lessons/electrostatics/coulomb.jpg'
import forceSuperpositionCover from '@/assets/lessons/electrostatics/force-superposition.jpg'
import electricFieldCover from '@/assets/lessons/electrostatics/electric-field.jpg'
import shieldingCover from '@/assets/lessons/electrostatics/shielding.jpg'
import pointDischargeCover from '@/assets/lessons/electrostatics/point-discharge.jpg'

import potentialCover from '@/assets/lessons/field-energy/potential.jpg'
import pathWorkCover from '@/assets/lessons/field-energy/path-work.jpg'
import potentialDifferenceCover from '@/assets/lessons/field-energy/potential-difference.jpg'
import particleMotionCover from '@/assets/lessons/field-energy/particle-motion.jpg'

export interface Lesson {
  title: string
  summary: string
  cover: string
  /** 已实现模块的路由；未实现时可省略 */
  to?: string
  comingSoon?: boolean
}

export interface SubTopic {
  title: string
  to: string
  summary: string
  cover: string
  lessons: Lesson[]
}

export interface Topic {
  title: string
  to: string
  summary: string
  cover: string
  lessons?: Lesson[]
  subtopics?: SubTopic[]
}

export const kinematicsTopic: Topic = {
  title: '运动学专题',
  to: '/kinematics',
  summary: '先选定参考系，再用位置、速度和加速度描述质点的运动。',
  cover: kinematicsCover,
  lessons: [
    {
      title: '质点与参考系',
      summary: '把物体看成质点，切换地面、汽车、飞机参考系，观察同一运动的不同描述。',
      to: '/kinematics/reference-frame',
      cover: referenceFrameCover,
    },
    {
      title: '时间、时刻、位移',
      summary: '时刻用点、时间用段；对照位移与路程，理解往返运动中二者的差别。',
      to: '/kinematics/time-displacement',
      cover: timeDisplacementCover,
    },
    {
      title: '速度与图像',
      summary: '用 x-t / v-t 图像理解平均速度、瞬时速度，以及割线、切线斜率的含义。',
      to: '/kinematics/velocity',
      cover: velocityCover,
    },
    {
      title: '加速度',
      summary: '用 Δv/Δt 理解加速度，对照速度与加速度同向、反向时的加速与减速。',
      to: '/kinematics/acceleration',
      cover: accelerationCover,
    },
    {
      title: '匀变速直线运动',
      summary: '调节初速度和加速度，对照动画、v-t 图像和 x-t 图像。',
      to: '/kinematics/uniform-acceleration',
      cover: uniformAccelerationCover,
    },
    {
      title: '自由落体运动',
      summary: '只受重力、由静止下落；对照 h-t / v-t 图像，并演示不同质量同时落地。',
      to: '/kinematics/free-fall',
      cover: freeFallCover,
    },
  ],
}

/** 静电场：从电荷到静电屏蔽、尖端放电（不含电势能等内容） */
export const electrostaticsSubTopic: SubTopic = {
  title: '静电场',
  to: '/electromagnetism/electrostatics',
  summary: '从电荷与起电方式到电场、静电屏蔽与尖端放电。',
  cover: electrostaticsCover,
  lessons: [
    {
      title: '电荷、起电方式',
      summary: '切换摩擦起电、接触起电、感应起电，观察电荷如何转移与重新分布。',
      to: '/electromagnetism/electrostatics/charging',
      cover: chargingCover,
    },
    {
      title: '验电器',
      summary: '调节电荷量，观察金箔张角实时变化。',
      to: '/electromagnetism/electrostatics/electroscope',
      cover: electroscopeCover,
    },
    {
      title: '库仑定律',
      summary: '调节 Q₁、Q₂、r，实时观察两点电荷间作用力的大小与方向。',
      to: '/electromagnetism/electrostatics/coulomb',
      cover: coulombCover,
    },
    {
      title: '静电力叠加',
      summary: '拖动多个点电荷，观察分力与合力的矢量合成。',
      to: '/electromagnetism/electrostatics/force-superposition',
      cover: forceSuperpositionCover,
    },
    {
      title: '电场强度与电场线',
      summary: '调节 q 对照 F 与 E；切换点电荷/同种/异种组态，3D 查看电场线。',
      to: '/electromagnetism/electrostatics/electric-field',
      cover: electricFieldCover,
    },
    {
      title: '静电屏蔽',
      summary: '导体空腔内外电场的特点（后续扩展）。',
      comingSoon: true,
      cover: shieldingCover,
    },
    {
      title: '尖端放电',
      summary: '导体尖端附近电场很强时的放电现象（后续扩展）。',
      comingSoon: true,
      cover: pointDischargeCover,
    },
  ],
}

/** 静电场中的能量：从电势、电势能到带电粒子在电场中的运动 */
export const fieldEnergySubTopic: SubTopic = {
  title: '静电场中的能量',
  to: '/electromagnetism/field-energy',
  summary: '从电势、电势能到电势差做功，再到带电粒子在电场中的运动。',
  cover: fieldEnergyCover,
  lessons: [
    {
      title: '电势能与电势',
      summary: '拖拽试探电荷，电势能条形图实时变化，显示 Ep 与 φ。',
      to: '/electromagnetism/field-energy/potential',
      cover: potentialCover,
    },
    {
      title: '电场力做功与路径无关',
      summary: '多路径对比模拟：选择不同路径，对比电场力做功。',
      to: '/electromagnetism/field-energy/path-work',
      cover: pathWorkCover,
    },
    {
      title: '电势差、等势面与做功',
      summary: '拖动 A、B 观察等势面，对照 U_AB、W=qU 与电势能变化。',
      to: '/electromagnetism/field-energy/potential-difference',
      cover: potentialDifferenceCover,
    },
    {
      title: '带电粒子在电场中的运动',
      summary: '加速与偏转（类平抛）轨迹实时追踪，对照 a=qE/m。',
      to: '/electromagnetism/field-energy/particle-motion',
      cover: particleMotionCover,
    },
  ],
}

export const electromagnetismTopic: Topic = {
  title: '电磁学专题',
  to: '/electromagnetism',
  summary: '从静电场到交变电流，用动画理解电荷、电场、磁场与电磁感应。',
  cover: electromagnetismCover,
  subtopics: [
    electrostaticsSubTopic,
    fieldEnergySubTopic,
    {
      title: '恒定电流',
      to: '/electromagnetism/current',
      summary: '电流、电阻与电路中的能量转化（后续扩展）。',
      cover: currentCover,
      lessons: [],
    },
    {
      title: '磁场',
      to: '/electromagnetism/magnetism',
      summary: '磁现象、磁场对电流的作用（后续扩展）。',
      cover: magnetismCover,
      lessons: [],
    },
    {
      title: '电磁感应',
      to: '/electromagnetism/induction',
      summary: '感应电流、楞次定律与法拉第电磁感应（后续扩展）。',
      cover: inductionCover,
      lessons: [],
    },
    {
      title: '交变电流',
      to: '/electromagnetism/ac',
      summary: '交流产生、变压器与电能输送（后续扩展）。',
      cover: acCover,
      lessons: [],
    },
  ],
}

export const topics: Topic[] = [kinematicsTopic, electromagnetismTopic]

export function findSubTopic(path: string): SubTopic | undefined {
  return electromagnetismTopic.subtopics?.find((item) => item.to === path)
}
