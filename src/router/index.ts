import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AccelerationView from '../views/AccelerationView.vue'
import ChargingView from '../views/ChargingView.vue'
import CoulombView from '../views/CoulombView.vue'
import ElectricFieldView from '../views/ElectricFieldView.vue'
import ElectricPotentialView from '../views/ElectricPotentialView.vue'
import ElectroscopeView from '../views/ElectroscopeView.vue'
import ElectromagnetismPlaceholderView from '../views/ElectromagnetismPlaceholderView.vue'
import ElectromagnetismTopicView from '../views/ElectromagnetismTopicView.vue'
import ElectrostaticsSubTopicView from '../views/ElectrostaticsSubTopicView.vue'
import FieldEnergySubTopicView from '../views/FieldEnergySubTopicView.vue'
import ForceSuperpositionView from '../views/ForceSuperpositionView.vue'
import FreeFallView from '../views/FreeFallView.vue'
import KinematicsTopicView from '../views/KinematicsTopicView.vue'
import KinematicsView from '../views/KinematicsView.vue'
import PathWorkView from '../views/PathWorkView.vue'
import ParticleMotionView from '../views/ParticleMotionView.vue'
import PotentialDifferenceView from '../views/PotentialDifferenceView.vue'
import ReferenceFrameView from '../views/ReferenceFrameView.vue'
import TimeDisplacementView from '../views/TimeDisplacementView.vue'
import VelocityView from '../views/VelocityView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/kinematics',
      name: 'kinematics',
      component: KinematicsTopicView,
    },
    {
      path: '/kinematics/reference-frame',
      name: 'reference-frame',
      component: ReferenceFrameView,
    },
    {
      path: '/kinematics/time-displacement',
      name: 'time-displacement',
      component: TimeDisplacementView,
    },
    {
      path: '/kinematics/velocity',
      name: 'velocity',
      component: VelocityView,
    },
    {
      path: '/kinematics/acceleration',
      name: 'acceleration',
      component: AccelerationView,
    },
    {
      path: '/kinematics/uniform-acceleration',
      name: 'uniform-acceleration',
      component: KinematicsView,
    },
    {
      path: '/kinematics/free-fall',
      name: 'free-fall',
      component: FreeFallView,
    },
    {
      path: '/electromagnetism',
      name: 'electromagnetism',
      component: ElectromagnetismTopicView,
    },
    {
      path: '/electromagnetism/electrostatics',
      name: 'electrostatics',
      component: ElectrostaticsSubTopicView,
    },
    {
      path: '/electromagnetism/electrostatics/charging',
      name: 'charging',
      component: ChargingView,
    },
    {
      path: '/electromagnetism/electrostatics/electroscope',
      name: 'electroscope',
      component: ElectroscopeView,
    },
    {
      path: '/electromagnetism/electrostatics/coulomb',
      name: 'coulomb',
      component: CoulombView,
    },
    {
      path: '/electromagnetism/electrostatics/force-superposition',
      name: 'force-superposition',
      component: ForceSuperpositionView,
    },
    {
      path: '/electromagnetism/electrostatics/electric-field',
      name: 'electric-field',
      component: ElectricFieldView,
    },
    {
      path: '/electromagnetism/field-energy',
      name: 'field-energy',
      component: FieldEnergySubTopicView,
    },
    {
      path: '/electromagnetism/field-energy/potential',
      name: 'electric-potential',
      component: ElectricPotentialView,
    },
    {
      path: '/electromagnetism/field-energy/path-work',
      name: 'path-work',
      component: PathWorkView,
    },
    {
      path: '/electromagnetism/field-energy/potential-difference',
      name: 'potential-difference',
      component: PotentialDifferenceView,
    },
    {
      path: '/electromagnetism/field-energy/particle-motion',
      name: 'particle-motion',
      component: ParticleMotionView,
    },
    {
      path: '/electromagnetism/current',
      name: 'em-current',
      component: ElectromagnetismPlaceholderView,
      props: {
        title: '恒定电流',
        summary: '电流、电阻与电路中的能量转化（后续扩展）。',
      },
    },
    {
      path: '/electromagnetism/magnetism',
      name: 'em-magnetism',
      component: ElectromagnetismPlaceholderView,
      props: {
        title: '磁场',
        summary: '磁现象、磁场对电流的作用（后续扩展）。',
      },
    },
    {
      path: '/electromagnetism/induction',
      name: 'em-induction',
      component: ElectromagnetismPlaceholderView,
      props: {
        title: '电磁感应',
        summary: '感应电流、楞次定律与法拉第电磁感应（后续扩展）。',
      },
    },
    {
      path: '/electromagnetism/ac',
      name: 'em-ac',
      component: ElectromagnetismPlaceholderView,
      props: {
        title: '交变电流',
        summary: '交流产生、变压器与电能输送（后续扩展）。',
      },
    },
  ],
})

export default router
