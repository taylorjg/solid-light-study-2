import * as THREE from 'three'
import shaftVertexShader from './shaders/shaft-vertex-shader.glsl'
import shaftFragmentShader from './shaders/shaft-fragment-shader.glsl'
import { reverseNormals } from './utils'

const h = 10
const rx = 1
const ry = 1
const d = rx * 2
const rx2 = rx * rx
const ry2 = ry * ry
const rx2ry2 = rx2 * ry2
const rho0 = 0.15
const rho1 = 0.2
const sigma = (rho1 - rho0) / h
const tau = -rho0 / sigma
const normalizer = 1 / (d * Math.max(rho0, rho1))

export const makeShaft = (x, y) => {
  const geometry = new THREE.BoxBufferGeometry(rx * 2, ry * 2, h, 10, 10, 10)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      cameraPositionInObjectSpace: { value: new THREE.Vector3() },
      rx2: { value: rx2 },
      ry2: { value: ry2 },
      rx2ry2: { value: rx2ry2 },
      rho0: { value: rho0 },
      sigma: { value: sigma },
      tau: { value: tau },
      normalizer: { value: normalizer }
    },
    vertexShader: shaftVertexShader,
    fragmentShader: shaftFragmentShader,
    side: THREE.BackSide,
    transparent: true,
    depthTest: false
  })
  const mesh = new THREE.Mesh(geometry, material)
  // mesh.position.setX(x)
  // mesh.position.setY(y)
  mesh.position.setZ(h - h / 2)
  // mesh.rotateX(Math.PI / 180 * -20)
  mesh.rotateX(Math.PI/2)

  reverseNormals(geometry)

  return {
    mesh,
    update: camera => {
      const cameraPositionInWorldSpace = camera.position.clone()
      const cameraPositionInObjectSpace = mesh.worldToLocal(cameraPositionInWorldSpace)
      material.uniforms.cameraPositionInObjectSpace.value.copy(cameraPositionInObjectSpace)
    }
  }
}
