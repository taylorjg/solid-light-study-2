import * as THREE from 'three'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import structureBufferVertexShader from './shaders/structure-buffer-vertex-shader.glsl'
import structureBufferFragmentShader from './shaders/structure-buffer-fragment-shader.glsl'
import { makeHalo } from './halo'
// import { makeShaft } from './shaft'

const main = async () => {
  const DPR = window.devicePixelRatio

  const stats = new Stats()
  document.body.appendChild(stats.dom)

  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(DPR)
  container.appendChild(renderer.domElement)

  const structureBuffer = new THREE.WebGLRenderTarget(w * DPR, h * DPR)
  structureBuffer.texture.type = THREE.HalfFloatType

  const makeStructureBufferMaterial = () => {
    return new THREE.ShaderMaterial({
      vertexShader: structureBufferVertexShader,
      fragmentShader: structureBufferFragmentShader,
    })
  }

  const structureBufferMaterial = makeStructureBufferMaterial()

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
  camera.position.set(0, 0, 20)
  camera.lookAt(0, 0, 0)
  scene.add(camera)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.minDistance = 0
  controls.maxDistance = 50
  controls.enableDamping = true
  controls.dampingFactor = 0.9
  controls.autoRotate = false

  const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32)
  const coneMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial)
  coneMesh.position.set(-4, -0.5, 2 + 5)
  scene.add(coneMesh)

  const resolution = new THREE.Vector2(w * DPR, h * DPR)

  const halos = []
  // halos.push(makeHalo(new THREE.Vector3(-4, 0, 2), structureBuffer.texture, resolution))
  // halos.push(makeHalo(new THREE.Vector3(-4, 0, 2), structureBuffer.texture, resolution))
  halos.push(makeHalo(new THREE.Vector3(), structureBuffer.texture, resolution))
  halos.forEach(halo => scene.add(halo.mesh))
  halos.forEach(halo => halo.mesh.layers.set(1))

  const shafts = []
  // shafts.push(makeShaft())
  // shafts.forEach(shaft => scene.add(shaft.mesh))

  window.addEventListener('resize', () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    camera.aspect = container.offsetWidth / container.offsetHeight
    camera.updateProjectionMatrix()
  })

  let axesHelper = null
  let vertexNormalsHelpers = null
  let wireframesOn = false
  let cameraHelper = null

  const doItForHalos = true
  const doItForShafts = true

  const things = [
    ...(doItForHalos ? halos : []),
    ...(doItForShafts ? shafts : [])
  ]

  const toggleAxesHelper = () => {
    if (axesHelper) {
      scene.remove(axesHelper)
      axesHelper = null
    } else {
      axesHelper = new THREE.AxesHelper(8)
      scene.add(axesHelper)
    }
  }

  const toggleVertexNormalsHelpers = () => {
    if (vertexNormalsHelpers) {
      vertexNormalsHelpers.forEach(vertexNormalsHelper => scene.remove(vertexNormalsHelper))
      vertexNormalsHelpers = null
    } else {
      vertexNormalsHelpers = things.map(({ mesh }) => {
        const vertexNormalsHelper = new VertexNormalsHelper(mesh, 0.1, 0xffff00)
        scene.add(vertexNormalsHelper)
        return vertexNormalsHelper
      })
    }
  }

  const toggleWireframes = () => {
    if (wireframesOn) {
      things.forEach(({ lineSegments }) => lineSegments && scene.remove(lineSegments))
      wireframesOn = false
    } else {
      things.forEach(({ lineSegments }) => lineSegments && scene.add(lineSegments))
      wireframesOn = true
    }
  }

  const toggleCameraHelper = () => {
    if (cameraHelper) {
      scene.remove(cameraHelper)
      cameraHelper = null
    } else {
      cameraHelper = new THREE.CameraHelper(camera)
      cameraHelper.material.color = new THREE.Color(0xffffff)
      scene.add(cameraHelper)
    }
  }

  renderer.setAnimationLoop(() => {
    cameraHelper && cameraHelper.update()
    controls.update()
    halos.forEach(halo => halo.update(camera))
    shafts.forEach(shaft => shaft.update(camera))

    const savedMaterialsMap = new Map()

    scene.traverse(object => {
      if (object.isMesh && object.layers.mask === 1) {
        savedMaterialsMap.set(object, object.material)
        object.material = structureBufferMaterial
      }
    })

    renderer.setClearColor(new THREE.Color(0, 0, 10000.0))
    renderer.setRenderTarget(structureBuffer)
    camera.layers.set(0)
    renderer.render(scene, camera)

    scene.traverse(object => {
      if (object.isMesh && object.layers.mask === 1) {
        if (savedMaterialsMap.has(object)) {
          object.material = savedMaterialsMap.get(object)
        }
      }
    })

    renderer.setClearColor(new THREE.Color(0, 0, 0))
    renderer.setRenderTarget(null)
    camera.layers.enable(0)
    camera.layers.enable(1)
    renderer.render(scene, camera)

    stats.update()
  })

  const params = {
    'Cone Z': coneMesh.position.z,
    'Axes Helper': Boolean(axesHelper),
    'Vertex Normals Helpers': Boolean(vertexNormalsHelpers),
    'Wireframes': wireframesOn,
    'Camera Helper': Boolean(cameraHelper)
  }

  const gui = new dat.GUI()

  gui.add(params, 'Cone Z', 2 - 5, 2 + 5, 0.1).onChange(value => {
    coneMesh.position.z = value
  })

  const axesHelperController = gui.add(params, 'Axes Helper').onChange(toggleAxesHelper)
  const vertexNormalsHelpersController = gui.add(params, 'Vertex Normals Helpers').onChange(toggleVertexNormalsHelpers)
  const wireframesController = gui.add(params, 'Wireframes').onChange(toggleWireframes)
  const cameraHelperController = gui.add(params, 'Camera Helper').onChange(toggleCameraHelper)

  gui.open()

  const toggleController = controller => controller.setValue(!controller.getValue())

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'a': return toggleController(axesHelperController)
      case 'c': return toggleController(cameraHelperController)
      case 'v': return toggleController(vertexNormalsHelpersController)
      case 'w': return toggleController(wireframesController)
    }
  })
}

main()
