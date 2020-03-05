import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Form, setSpeed } from './form'
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader.glsl'
import * as C from './constants'

const container = document.getElementById('container')
const w = container.offsetWidth
const h = container.offsetHeight
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(w, h)
container.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
camera.position.set(0, 0, 8)
scene.add(camera)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0)
controls.minDistance = 0
controls.maxDistance = 50
controls.enableDamping = true
controls.dampingFactor = 0.9
controls.autoRotate = false

const y = C.SCREEN_IMAGE_CENTRE_Y
const rx = C.SCREEN_IMAGE_RADIUS_X
const ry = C.SCREEN_IMAGE_RADIUS_Y

const leftForm = new Form(scene, C.LEFT_FORM_CENTRE_X, y, rx, ry, true)
const rightForm = new Form(scene, C.RIGHT_FORM_CENTRE_X, y, rx, ry, false)

const CUBE_SIZE = 2

const cubeGeometry = new THREE.BoxBufferGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 'red' })
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
cubeMesh.position.set(-CUBE_SIZE, 0, CUBE_SIZE)
scene.add(cubeMesh)

// const haloPosition = new THREE.Vector3(CUBE_SIZE, 0, CUBE_SIZE)
const haloGeometry = new THREE.BoxBufferGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
const haloMaterial = new THREE.ShaderMaterial({
  // uniforms: {
  //   haloPosition: {
  //     value: haloPosition
  //   }
  // },
  vertexShader,
  fragmentShader,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending
})
const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial)
// haloMesh.position.copy(haloPosition)
scene.add(haloMesh)

const render = () => {
  leftForm.update()
  rightForm.update()
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

window.addEventListener('resize', () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()
})

document.addEventListener('keydown', e => {
  switch (e.key) {
    case '1': return setSpeed(1)
    case '2': return setSpeed(2)
    case '3': return setSpeed(5)
    case '4': return setSpeed(10)
  }
})

render()
