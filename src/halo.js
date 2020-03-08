import * as THREE from 'three'
import haloVertexShader from './shaders/halo-vertex-shader.glsl'
import haloFragmentShader from './shaders/halo-fragment-shader.glsl'

const CUBE_SIZE = 2
const R = CUBE_SIZE / 2
const R2 = R * R
const recipR2 = 1.0 / R2
const recip3R2 = 1.0 / (3.0 * R2)
const normalizer = 3.0 / (4.0 * R)

export const makeHalo = position => {
  const geometry = new THREE.BoxBufferGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      cameraPositionInObjectSpace: { value: new THREE.Vector3() },
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
    update: camera => {
      const cameraPositionInWorldSpace = camera.position.clone()
      const cameraPositionInObjectSpace = mesh.worldToLocal(cameraPositionInWorldSpace)
      material.uniforms.cameraPositionInObjectSpace.value.copy(cameraPositionInObjectSpace)
    }
  }
}
