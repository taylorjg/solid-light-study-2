import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import { Form, setSpeed } from './form'
import { makeHalo } from './halo'
import { makeShaft } from './shaft'
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

  const halos = []
  // halos.push(makeHalo(new THREE.Vector3()))
  halos.push(makeHalo(new THREE.Vector3(-4, 0, 2)))
  halos.push(makeHalo(new THREE.Vector3(4, 0, 2)))
  halos.forEach(halo => scene.add(halo.mesh))

  const shafts = []
  shafts.push(makeShaft(0, 0))
  shafts.forEach(shaft => scene.add(shaft.mesh))
  shafts.forEach(shaft => {
    const vertexNormalsHelper = new VertexNormalsHelper(shaft.mesh, 0.2, 0xffffff)
    scene.add(vertexNormalsHelper)
  })

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
    halos.forEach(halo => halo.update(camera))
    shafts.forEach(shaft => shaft.update(camera))
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
