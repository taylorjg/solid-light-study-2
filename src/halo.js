import * as THREE from 'three'
import haloVertexShader from './shaders/halo-vertex-shader.glsl'
import haloFragmentShader from './shaders/halo-fragment-shader.glsl'
import { reverseNormals } from './utils'

const R = 2
const R2 = R * R
const recipR2 = 1.0 / R2
const recip3R2 = 1.0 / (3.0 * R2)
const normalizer = 3.0 / (4.0 * R)
const CUBE_SIZE = R * 2

export const makeHalo = position => {
  const geometry = new THREE.BoxBufferGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      cameraPositionOS: { value: new THREE.Vector3() },
      R2: { value: R2 },
      recipR2: { value: recipR2 },
      recip3R2: { value: recip3R2 },
      normalizer: { value: normalizer }
    },
    vertexShader: haloVertexShader,
    fragmentShader: haloFragmentShader,
    side: THREE.BackSide,
    transparent: true,
    depthTest: false
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)

  reverseNormals(geometry)

  return {
    mesh,
    update: camera => {
      const cameraPositionWS = camera.position.clone()
      const cameraPositionOS = mesh.worldToLocal(cameraPositionWS.clone())
      mesh.material.uniforms.cameraPositionOS.value = cameraPositionOS
    }
  }
}
