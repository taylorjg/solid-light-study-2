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
  console.log(resolution)

  const halos = []
  halos.push(makeHalo(new THREE.Vector3(-4, 0, 2), structureBuffer.texture, resolution))
  // halos.push(makeHalo(new THREE.Vector3(4, 0, 2), structureBuffer.texture, resolution))
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

  const toggleAxesHelper = () => {
    if (axesHelper) {
      scene.remove(axesHelper)
      axesHelper = null
    } else {
      axesHelper = new THREE.AxesHelper(4)
      scene.add(axesHelper)
    }
  }

  const includeHalos = false
  const includeShafts = true

  const toggleVertexNormalsHelpers = () => {
    if (vertexNormalsHelpers) {
      vertexNormalsHelpers.forEach(vertexNormalsHelper => scene.remove(vertexNormalsHelper))
      vertexNormalsHelpers = null
    } else {
      const things = [
        ...(includeHalos ? halos : []),
        ...(includeShafts ? shafts : [])
      ]
      vertexNormalsHelpers = things.map(({ mesh }) => {
        const vertexNormalsHelper = new VertexNormalsHelper(mesh, 0.1, 0xffffff)
        scene.add(vertexNormalsHelper)
        return vertexNormalsHelper
      })
    }
  }

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'a': return toggleAxesHelper()
      case 'v': return toggleVertexNormalsHelpers()
    }
  })

  renderer.setAnimationLoop(() => {
    controls.update()
    halos.forEach(halo => halo.update(camera))
    // shafts.forEach(shaft => shaft.update(camera))

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
    'cone.z': coneMesh.position.z
  }

  const gui = new dat.GUI()

  gui.add(params, 'cone.z', 2 - 5, 2 + 5).step(0.1).onChange(value => {
    coneMesh.position.z = value
  })

  gui.open()
}

main()
