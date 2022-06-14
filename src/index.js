import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import { makeHalo } from './halo'
import { makeShaft } from './shaft'

const main = async () => {
  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

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

  const halos = []
  // halos.push(makeHalo(new THREE.Vector3(-4, 0, 2)))
  // halos.push(makeHalo(new THREE.Vector3(4, 0, 2)))
  halos.forEach(halo => scene.add(halo.mesh))

  const shafts = []
  shafts.push(makeShaft())
  shafts.forEach(shaft => scene.add(shaft.mesh))

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
    shafts.forEach(shaft => shaft.update(camera))
    renderer.render(scene, camera)
  })
}

main()
