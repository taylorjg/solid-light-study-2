import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import { Form, setSpeed } from './form'
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader.glsl'
import * as U from './utils'
import * as C from './constants'

const main = async () => {
  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
  camera.position.set(0, 0, 12)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  scene.add(camera)

  let axesHelper = null
  let vertexNormalsHelper = null

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

  const hazeTexture = await U.loadTexture('haze.jpg')

  const CUBE_SIZE = 4
  const R = CUBE_SIZE / 2
  const R2 = R * R
  const recipR2 = 1.0 / R2
  const recip3R2 = 1.0 / (3.0 * R2)
  const normalizer = 3.0 / (4.0 * R)

  const haloPosition = new THREE.Vector3(3.5, 0.43, 2)
  const haloGeometry = new THREE.BoxBufferGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
  const haloMaterial = new THREE.ShaderMaterial({
    uniforms: {
      cameraPositionInObjectSpace: { value: new THREE.Vector3() },
      hazeTexture: { value: hazeTexture },
      R: { value: R },
      R2: { value: R2 },
      recipR2: { value: recipR2 },
      recip3R2: { value: recip3R2 },
      normalizer: { value: normalizer }
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: true
  })
  const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial)
  haloMesh.position.copy(haloPosition)
  scene.add(haloMesh)

  window.addEventListener('resize', () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    camera.aspect = container.offsetWidth / container.offsetHeight
    camera.updateProjectionMatrix()
  })

  const toggleAxesHelper = () => {
    if (axesHelper) {
      scene.remove(axesHelper)
      axesHelper = null
    } else {
      axesHelper = new THREE.AxesHelper(10)
      scene.add(axesHelper)
    }
  }

  const toggleVertexNormalsHelper = () => {
    if (vertexNormalsHelper) {
      scene.remove(vertexNormalsHelper)
      vertexNormalsHelper = null
    } else {
      vertexNormalsHelper = new VertexNormalsHelper(haloMesh, 0.2, 0xffffff)
      scene.add(vertexNormalsHelper)
    }
  }

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case '1': return setSpeed(1)
      case '2': return setSpeed(2)
      case '3': return setSpeed(5)
      case '4': return setSpeed(10)
      case 'a': return toggleAxesHelper()
      case 'v': return toggleVertexNormalsHelper()
    }
  })

  const render = () => {
    leftForm.update()
    rightForm.update()
    controls.update()
    const cameraPositionInObjectSpace = haloMesh.worldToLocal(camera.position.clone())
    haloMaterial.uniforms.cameraPositionInObjectSpace.value.copy(cameraPositionInObjectSpace)
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
