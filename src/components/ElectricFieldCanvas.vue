<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { length, type FieldCharge, type Vec3 } from '@/utils/electricField'

const props = defineProps<{
  charges: FieldCharge[]
  fieldLines: Vec3[][]
  probe: Vec3
  eAtProbe: Vec3
  fAtProbe: Vec3
  showForce: boolean
}>()

const hostRef = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let frameId = 0
let observer: ResizeObserver | null = null

const contentGroup = new THREE.Group()
const linesGroup = new THREE.Group()
const chargesGroup = new THREE.Group()
const vectorsGroup = new THREE.Group()

function clearGroup(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0]!
    group.remove(child)
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
      child.geometry.dispose()
      const mat = child.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat.dispose()
    }
    if (child instanceof THREE.Sprite) {
      const mat = child.material
      mat.map?.dispose()
      mat.dispose()
    }
    if (child instanceof THREE.ArrowHelper) {
      child.line.geometry.dispose()
      ;(child.line.material as THREE.Material).dispose()
      child.cone.geometry.dispose()
      ;(child.cone.material as THREE.Material).dispose()
    }
  }
}

function rebuildLines() {
  clearGroup(linesGroup)
  for (const line of props.fieldLines) {
    if (line.length < 2) continue
    const points = line.map((p) => new THREE.Vector3(p.x, p.y, p.z))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.75,
    })
    linesGroup.add(new THREE.Line(geometry, material))
  }
}

function makeSignSprite(positive: boolean): THREE.Sprite {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 96px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(positive ? '+' : '−', size / 2, size / 2 + 4)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.028, 0.028, 0.028)
  return sprite
}

function rebuildCharges() {
  clearGroup(chargesGroup)
  for (const c of props.charges) {
    const positive = c.q >= 0
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 28, 20),
      new THREE.MeshStandardMaterial({
        color: positive ? 0xef4444 : 0x3b82f6,
        emissive: positive ? 0x7f1d1d : 0x1e3a8a,
        emissiveIntensity: 0.35,
      }),
    )
    sphere.position.set(c.x, c.y, c.z)
    chargesGroup.add(sphere)

    const sign = makeSignSprite(positive)
    sign.position.set(c.x, c.y, c.z)
    chargesGroup.add(sign)
  }
}

function makeArrow(origin: Vec3, vec: Vec3, color: number, arrowLength: number) {
  const mag = length(vec)
  if (mag < 1e-12) return null
  const dir = new THREE.Vector3(vec.x / mag, vec.y / mag, vec.z / mag)
  const arrow = new THREE.ArrowHelper(
    dir,
    new THREE.Vector3(origin.x, origin.y, origin.z),
    arrowLength,
    color,
    arrowLength * 0.22,
    arrowLength * 0.12,
  )
  return arrow
}

function rebuildVectors() {
  clearGroup(vectorsGroup)

  const probeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xb45309, emissiveIntensity: 0.35 }),
  )
  probeMesh.position.set(props.probe.x, props.probe.y, props.probe.z)
  vectorsGroup.add(probeMesh)

  const eArrow = makeArrow(props.probe, props.eAtProbe, 0x38bdf8, 0.08)
  if (eArrow) vectorsGroup.add(eArrow)

  if (props.showForce) {
    // F = qE：箭头长度随 |q| 变化（相对滑块上限 3 μC），方向随 q 正负翻转
    const eMag = length(props.eAtProbe)
    const fMag = length(props.fAtProbe)
    const qAbs = eMag > 1e-12 ? fMag / eMag : 0
    const qRatio = Math.min(1, qAbs / 3e-6)
    const fLen = 0.04 + 0.14 * qRatio
    const fArrow = makeArrow(props.probe, props.fAtProbe, 0xfb923c, fLen)
    if (fArrow) vectorsGroup.add(fArrow)
  }
}

function rebuildSceneContent() {
  rebuildLines()
  rebuildCharges()
  rebuildVectors()
}

function resize() {
  const host = hostRef.value
  if (!host || !renderer || !camera) return
  const w = host.clientWidth
  const h = host.clientHeight
  camera.aspect = w / Math.max(h, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
}

function animate() {
  frameId = requestAnimationFrame(animate)
  controls?.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function init() {
  const host = hostRef.value
  if (!host) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  camera = new THREE.PerspectiveCamera(45, 1, 0.01, 20)
  camera.position.set(0.28, 0.22, 0.42)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor(0x0f172a)
  host.appendChild(renderer.domElement)
  Object.assign(renderer.domElement.style, {
    width: '100%',
    height: '100%',
    display: 'block',
    borderRadius: '8px',
  })

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 0.12
  controls.maxDistance = 1.6
  controls.target.set(0, 0, 0)
  controls.update()

  const ambient = new THREE.AmbientLight(0xffffff, 0.55)
  const key = new THREE.DirectionalLight(0xffffff, 0.9)
  key.position.set(0.4, 0.6, 0.3)
  scene.add(ambient, key)

  const grid = new THREE.GridHelper(0.5, 10, 0x334155, 0x1e293b)
  grid.position.y = -0.12
  scene.add(grid)

  contentGroup.add(linesGroup, chargesGroup, vectorsGroup)
  scene.add(contentGroup)

  rebuildSceneContent()
  resize()
  observer = new ResizeObserver(() => resize())
  observer.observe(host)
  animate()
}

function dispose() {
  cancelAnimationFrame(frameId)
  observer?.disconnect()
  controls?.dispose()
  clearGroup(linesGroup)
  clearGroup(chargesGroup)
  clearGroup(vectorsGroup)
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
  renderer = null
  scene = null
  camera = null
  controls = null
}

onMounted(() => init())
onUnmounted(() => dispose())

watch(
  () => [props.fieldLines, props.charges],
  () => {
    rebuildLines()
    rebuildCharges()
  },
  { deep: true },
)

watch(
  () => [props.probe, props.eAtProbe, props.fAtProbe, props.showForce],
  () => rebuildVectors(),
  { deep: true },
)
</script>

<template>
  <div ref="hostRef" class="viewport" role="img" aria-label="电场线三维示意（可旋转缩放）">
    <p class="hint">拖拽旋转 · 滚轮缩放 · 右键平移</p>
  </div>
</template>

<style scoped>
.viewport {
  position: relative;
  width: 100%;
  height: min(56vh, 460px);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: #0f172a;
}

.hint {
  position: absolute;
  left: 12px;
  top: 10px;
  z-index: 1;
  margin: 0;
  color: rgba(226, 232, 240, 0.9);
  font-size: 12px;
  pointer-events: none;
}
</style>
