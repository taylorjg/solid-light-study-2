import * as THREE from 'three'
import shaftVertexShader from './shaders/shaft-vertex-shader.glsl'
import shaftFragmentShader from './shaders/shaft-fragment-shader.glsl'

const rx = 1
const ry = 1
const h = 10
const rx2 = rx * rx
const ry2 = ry * ry
const rx2ry2 = rx2 * ry2
const shaftRho0 = 0.02
const shaftRho1 = 0.03
const shaftSigma = (shaftRho1 - shaftRho0) / h
const shaftTau = -shaftRho0 / shaftSigma
const D = rx * 2
const N = 1 / (D * Math.max(shaftRho0, shaftRho1))

const geomHalfWidth = rx * 1
const geomHalfHeight = ry * 1
const geomDepth = h * 1

const vertices = [
  new THREE.Vector3(geomHalfWidth, -geomHalfHeight, geomDepth),
  new THREE.Vector3(geomHalfWidth, -geomHalfHeight, 0),
  new THREE.Vector3(geomHalfWidth, geomHalfHeight, 0),
  new THREE.Vector3(geomHalfWidth, geomHalfHeight, geomDepth),
  new THREE.Vector3(-geomHalfWidth, -geomHalfHeight, geomDepth),
  new THREE.Vector3(-geomHalfWidth, -geomHalfHeight, 0),
  new THREE.Vector3(-geomHalfWidth, geomHalfHeight, 0),
  new THREE.Vector3(-geomHalfWidth, geomHalfHeight, geomDepth),
]

const points = [
  // right
  vertices[0],
  vertices[2],
  vertices[1],
  vertices[0],
  vertices[3],
  vertices[2],
  // left
  vertices[4],
  vertices[5],
  vertices[6],
  vertices[7],
  vertices[4],
  vertices[6],
  // // top
  vertices[6],
  vertices[2],
  vertices[3],
  vertices[7],
  vertices[6],
  vertices[3],
  // // bottom
  vertices[0],
  vertices[1],
  vertices[5],
  vertices[0],
  vertices[5],
  vertices[4]
]

export const makeShaft = () => {

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  geometry.computeVertexNormals()

  // const material = new THREE.MeshBasicMaterial({
  //   side: THREE.FrontSide,
  //   depthTest: false,
  //   color: 'red',
  //   transparent: true,
  //   opacity: 0.4
  // })

  const material = new THREE.ShaderMaterial({
    uniforms: {
      cameraPositionOS: { value: new THREE.Vector3() },
      rx2: { value: rx2 },
      ry2: { value: ry2 },
      rx2ry2: { value: rx2ry2 },
      shaftSigma: { value: shaftSigma },
      shaftRho0: { value: shaftRho0 },
      shaftTau: { value: shaftTau },
      normalizer: { value: N }
    },
    vertexShader: shaftVertexShader,
    fragmentShader: shaftFragmentShader,
    transparent: true,
    depthTest: false
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.translateZ(-geomDepth / 2)

  return {
    mesh,
    update: camera => {
      const cameraPositionWS = camera.position.clone()
      const cameraPositionOS = mesh.worldToLocal(cameraPositionWS)
      mesh.material.uniforms.cameraPositionOS.value = cameraPositionOS
    }
  }
}
