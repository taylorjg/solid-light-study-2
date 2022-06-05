import * as THREE from 'three'
import shaftVertexShader from './shaders/shaft-vertex-shader.glsl'
import shaftFragmentShader from './shaders/shaft-fragment-shader.glsl'
import { reverseNormals } from './utils'

const rx = 1
const ry = 1
const h = 10
const rx2 = rx * rx
const ry2 = ry * ry
const rx2ry2 = rx2 * ry2
const shaftRho0 = 0.01
const shaftRho1 = 0.05
const shaftSigma = (shaftRho1 - shaftRho0) / h
const shaftTau = -shaftRho0 / shaftSigma
const D = rx * 2
const N = 1 / (D * Math.max(shaftRho0, shaftRho1))

const vertices = [
  new THREE.Vector3(rx, -ry, h),
  new THREE.Vector3(rx, -ry, 0),
  new THREE.Vector3(rx, ry, 0),
  new THREE.Vector3(rx, ry, h),
  new THREE.Vector3(-rx, -ry, h),
  new THREE.Vector3(-rx, -ry, 0),
  new THREE.Vector3(-rx, ry, 0),
  new THREE.Vector3(-rx, ry, h),
]

const points = [
  // right
  vertices[0],
  vertices[1],
  vertices[2],
  vertices[0],
  vertices[2],
  vertices[3],
  // left
  vertices[6],
  vertices[5],
  vertices[4],
  vertices[7],
  vertices[6],
  vertices[4],
  // top
  vertices[3],
  vertices[2],
  vertices[6],
  vertices[3],
  vertices[6],
  vertices[7],
  // bottom
  vertices[5],
  vertices[1],
  vertices[0],
  vertices[4],
  vertices[5],
  vertices[0]
]

export const makeShaft = (x, y) => {

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  geometry.computeVertexNormals()
  reverseNormals(geometry)

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
    side: THREE.BackSide,
    transparent: true,
    depthTest: false
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.setX(x)
  mesh.position.setY(y)

  return {
    mesh,
    update: camera => {
      const cameraPositionWS = camera.position.clone()
      const cameraPositionOS = mesh.worldToLocal(cameraPositionWS)
      mesh.material.uniforms.cameraPositionOS.value.copy(cameraPositionOS)
    }
  }
}
