import * as THREE from 'three'
import haloVertexShader from './shaders/halo-vertex-shader.glsl'
import haloFragmentShader from './shaders/halo-fragment-shader.glsl'
import { makeInwardFacingBoxGeometry } from './inward-facing-box-geometry'

const R = 2
const R2 = R * R
const recipR2 = 1.0 / R2
const recip3R2 = 1.0 / (3.0 * R2)
const normalizer = 3.0 / (4.0 * R)
const CUBE_SIZE = R * 2

export const makeHalo = (position, structureBufferTexture, resolution) => {
  const geometry = makeInwardFacingBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      cameraPositionOS: { value: new THREE.Vector3() },
      cameraViewOS: { value: new THREE.Vector3() },
      R2: { value: R2 },
      recipR2: { value: recipR2 },
      recip3R2: { value: recip3R2 },
      normalizer: { value: normalizer },
      tStructureBuffer: { value: structureBufferTexture },
      resolution: { value: resolution }
    },
    vertexShader: haloVertexShader,
    fragmentShader: haloFragmentShader,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)

  return {
    mesh,
    update: camera => {
      const cameraPositionWS = camera.position.clone()
      const cameraPositionOS = mesh.worldToLocal(cameraPositionWS.clone())
      mesh.material.uniforms.cameraPositionOS.value = cameraPositionOS
      const cameraViewWS = camera.getWorldDirection(new THREE.Vector3())
      const cameraViewOS = mesh.worldToLocal(cameraViewWS.clone())
      mesh.material.uniforms.cameraViewOS.value = cameraViewOS
    }
  }
}
