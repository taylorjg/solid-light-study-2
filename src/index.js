import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import { Form, setSpeed } from './form'
import haloVertexShader from './shaders/halo-vertex-shader.glsl'
import haloFragmentShader from './shaders/halo-fragment-shader.glsl'
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

  const CUBE_SIZE = 2
  const R = CUBE_SIZE / 2
  const R2 = R * R
  const recipR2 = 1.0 / R2
  const recip3R2 = 1.0 / (3.0 * R2)
  const normalizer = 3.0 / (4.0 * R)

  const makeHalo = position => {
    const geometry = new THREE.BoxBufferGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        cameraPositionInObjectSpace: { value: new THREE.Vector3() },
        hazeTexture: { value: hazeTexture },
        R2: { value: R2 },
        recipR2: { value: recipR2 },
        recip3R2: { value: recip3R2 },
        normalizer: { value: normalizer }
      },
      vertexShader: haloVertexShader,
      fragmentShader: haloFragmentShader,
      side: THREE.BackSide,
      transparent: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)

    return {
      geometry,
      material,
      mesh,
      update: () => {
        const cameraPositionInWorldSpace = camera.position.clone()
        const cameraPositionInObjectSpace = mesh.worldToLocal(cameraPositionInWorldSpace)
        material.uniforms.cameraPositionInObjectSpace.value.copy(cameraPositionInObjectSpace)
      }
    }
  }

  const halos = []
  halos.push(makeHalo(new THREE.Vector3()))
  halos.push(makeHalo(new THREE.Vector3(-4, 0, 2)))
  halos.push(makeHalo(new THREE.Vector3(4, 0, 2)))
  halos.forEach(halo => scene.add(halo.mesh))

  window.addEventListener('resize', () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    camera.aspect = container.offsetWidth / container.offsetHeight
    camera.updateProjectionMatrix()
  })

  let axesHelper = null
  let vertexNormalsHelpers = null

  const toggleAxesHelper = () => {
    if (axesHelper) {
      scene.remove(axesHelper)
      axesHelper = null
    } else {
      axesHelper = new THREE.AxesHelper(10)
      scene.add(axesHelper)
    }
  }

  const toggleVertexNormalsHelpers = () => {
    if (vertexNormalsHelpers) {
      vertexNormalsHelpers.forEach(vertexNormalsHelper => scene.remove(vertexNormalsHelper))
      vertexNormalsHelpers = null
    } else {
      vertexNormalsHelpers = halos.map(halo => {
        const vertexNormalsHelper = new VertexNormalsHelper(halo.mesh, 0.2, 0xffffff)
        scene.add(vertexNormalsHelper)
        return vertexNormalsHelper
      })
    }
  }

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case '1': return setSpeed(1)
      case '2': return setSpeed(2)
      case '3': return setSpeed(5)
      case '4': return setSpeed(10)
      case 'a': return toggleAxesHelper()
      case 'v': return toggleVertexNormalsHelpers()
    }
  })

  const render = () => {
    leftForm.update()
    rightForm.update()
    controls.update()
    halos.forEach(halo => halo.update())
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
