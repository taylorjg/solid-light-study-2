import * as THREE from 'three'
import haloVertexShader from './shaders/halo-vertex-shader.glsl'
import haloFragmentShader from './shaders/halo-fragment-shader.glsl'
import { makeLine } from './line'
import { range } from './utils'

const CUBE_SIZE = 4
const SMALLER_CUBE_SIZE = CUBE_SIZE * 0.25
const R = CUBE_SIZE / 2
const R2 = R * R
const recipR2 = 1.0 / R2
const recip3R2 = 1.0 / (3.0 * R2)
const normalizer = 3.0 / (4.0 * R)

const smallerGeometry = new THREE.BoxBufferGeometry(SMALLER_CUBE_SIZE, SMALLER_CUBE_SIZE, SMALLER_CUBE_SIZE)

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

const makePoints = (scene, ...positions) => {
  const geometry = new THREE.BufferGeometry().setFromPoints(positions)
  const material = new THREE.PointsMaterial({ color: 0x800080, size: 0.2 })
  const points = new THREE.Points(geometry, material)
  points.name = 'POINTS'
  scene.add(points)
}

export const drawHaloRays = (halo, scene, camera) => {
  // const cameraPositionWorldSpace = new THREE.Vector3()
  const cameraPositionWorldSpace = camera.position
  const cameraPositionObjectSpace = halo.mesh.worldToLocal(cameraPositionWorldSpace.clone())
  const vertices = smallerGeometry.attributes.position
  const numVertices = vertices.array.length / 3
  range(numVertices).forEach(vertexIndex => {
    const x = vertices.getX(vertexIndex)
    const y = vertices.getY(vertexIndex)
    const z = vertices.getZ(vertexIndex)
    const vertexObjectSpace = new THREE.Vector3(x, y, z)
    const { t1, t2 } = calculateLimits(cameraPositionObjectSpace, vertexObjectSpace)
    const vertexWorldSpace = halo.mesh.localToWorld(vertexObjectSpace.clone())
    const pt1 = vertexWorldSpace.clone().lerp(cameraPositionWorldSpace, t1)
    const pt2 = vertexWorldSpace.clone().lerp(cameraPositionWorldSpace, t2)
    makeLine(scene, vertexWorldSpace, cameraPositionWorldSpace)
    makePoints(scene, pt1, pt2)
  })
}

const calculateLimits = (cameraPositionInObjectSpace, vPointInObjectSpace) => {
  const vdir = cameraPositionInObjectSpace.clone().sub(vPointInObjectSpace)
  const v2 = vdir.clone().dot(vdir)
  const p2 = vPointInObjectSpace.clone().dot(vPointInObjectSpace)
  const pv = -vPointInObjectSpace.clone().dot(vdir)
  const m = Math.sqrt(Math.max(pv * pv - v2 * (p2 - R2), 0.0))
  const t1 = THREE.MathUtils.clamp((pv - m) / v2, 0.0, 1.0)
  const t2 = THREE.MathUtils.clamp((pv + m) / v2, 0.0, 1.0)
  return { t1, t2 }
}
