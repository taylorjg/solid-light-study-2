import * as THREE from 'three'
import shaftVertexShader from './shaders/shaft-vertex-shader.glsl'
import shaftFragmentShader from './shaders/shaft-fragment-shader.glsl'

const rx = 1
const ry = 1
const h = 10
const rx2 = rx * rx
const ry2 = ry * ry
const rx2ry2 = rx2 * ry2
const shaftRho0 = 0.015
const shaftRho1 = 0.01
const shaftSigma = (shaftRho1 - shaftRho0) / h
const shaftTau = -shaftRho0 / shaftSigma
const D = rx * 2
const N = 1 / (D * Math.max(shaftRho0, shaftRho1))

const geomHalfWidth = rx * 1
const geomHalfHeight = ry * 1
const geomDepth = 10 * 1

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
  // top
  vertices[6],
  vertices[2],
  vertices[3],
  vertices[7],
  vertices[6],
  vertices[3],
  // bottom
  vertices[0],
  vertices[1],
  vertices[5],
  vertices[0],
  vertices[5],
  vertices[4]
]

const frontBottom = vertices[4]
const backBottom = vertices[5]
const backTop = vertices[6]
const frontTop = vertices[7]

const range = n => Array.from(Array(n).keys())

const makeAlphas = n => {
  const stepSize = 1 / n
  const steps = range(n + 1)
  return steps.map(step => step * stepSize)
}

const alphas = makeAlphas(4)

const troubleShootingVertices = alphas.flatMap(alpha => {
  const top = new THREE.Vector3().lerpVectors(backTop, frontTop, alpha)
  const bottom = new THREE.Vector3().lerpVectors(backBottom, frontBottom, alpha)
  const middle = new THREE.Vector3().lerpVectors(top, bottom, 0.5)
  return [top, middle, bottom]
})

console.log('troubleShootingVertices:', troubleShootingVertices)

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
    depthTest: false,
  })

  const mesh = new THREE.Mesh(geometry, material)
  // mesh.translateZ(-geomDepth / 2)
  // mesh.translateX(4)

  let counter = 0
  const prec = 4

  const vecToString = v => v.toArray().map(v => v.toFixed(prec)).join(', ')

  return {
    mesh,
    update: camera => {
      const cameraPositionWS = camera.position.clone()
      const cameraPositionOS = mesh.worldToLocal(cameraPositionWS.clone())
      mesh.material.uniforms.cameraPositionOS.value = cameraPositionOS
      counter++
      if (counter % 120 === 0) {
        console.log('-'.repeat(80))
        console.log(`cameraPositionWS: ${vecToString(cameraPositionWS)}; cameraPositionOS: ${vecToString(cameraPositionOS)}`)
        troubleShootingVertices.forEach(pobject => {
          const { t1, t2, vdir, tlim, t1final, t2final, B, dot, result } = calculateCylinderShaftBrightness(cameraPositionOS, pobject)
          console.log(
            `pobject: ${vecToString(pobject)}; ` +
            `t1: ${t1.toFixed(prec)}; ` +
            `t2: ${t2.toFixed(prec)}; ` +
            `vdir: ${vecToString(vdir)}; ` +
            `tlim: ${tlim.toFixed(prec)}; ` +
            `t1final: ${t1final.toFixed(prec)}; ` +
            `t2final: ${t2final.toFixed(prec)}; ` +
            `B: ${B.toFixed(prec)}; ` +
            `dot: ${dot.toFixed(prec)}; ` +
            `result: ${result.toFixed(prec)}; `
          )
        })
      }
    }
  }
}

// float CalculateShaftBrightness(float pz, vec3 vdir, float t1, float t2) {
// 	t1 = clamp(t1, 0.0, 1.0);
// 	t2 = clamp(t2, 0.0, 1.0);
// 	// Limit to range where density is not negative.
// 	float tlim = (shaftTau - pz) / vdir.z;
// 	if (vdir.z * shaftSigma < 0.0) {
// 		t1 = min(t1, tlim);
// 		t2 = min(t2, tlim);
// 	} else {
// 		t1 = max(t1, tlim);
// 		t2 = max(t2, tlim);
// 	}
// 	// Evaluate density integral, normalize, and square.
// 	float B = (shaftSigma * (pz + vdir.z * ((t1 + t2) * 0.5)) + shaftRho0) * (t2 - t1) * normalizer;
// 	return (B * B * dot(vdir, vdir));
// }

const calculateShaftBrightness = (pz, vdir, t1, t2) => {

  t1 = THREE.MathUtils.clamp(t1, 0.0, 1.0)
  t2 = THREE.MathUtils.clamp(t2, 0.0, 1.0)

  // Limit to range where density is not negative.
  const tlim = (shaftTau - pz) / vdir.z
  if (vdir.z * shaftSigma < 0.0) {
    t1 = Math.min(t1, tlim)
    t2 = Math.min(t2, tlim)
  } else {
    t1 = Math.max(t1, tlim)
    t2 = Math.max(t2, tlim)
  }

  // Evaluate density integral, normalize, and square.
  const B = (shaftSigma * (pz + vdir.z * ((t1 + t2) * 0.5)) + shaftRho0) * (t2 - t1) * N
  const dot = vdir.dot(vdir)
  const result = B * B * dot

  return { tlim, t1final: t1, t2final: t2, B, dot, result }
}

// float CalculateCylinderShaftBrightness() {
// 	vec3 vdir = cameraPositionOS - pobject;
// 	vec2 v2 = vdir.xy * vdir.xy;
// 	vec2 p2 = pobject.xy * pobject.xy;
// 	// Calculate quadratic coefficients.
// 	float a = ry2 * v2.x + rx2 * v2.y;
// 	float b = -ry2 * pobject.x * vdir.x - rx2 * pobject.y * vdir.y;
// 	float c = ry2 * p2.x + rx2 * p2.y - rx2ry2;
// 	float m = sqrt(max(b * b - a * c, 0.0));
// 	// Calculate limits and integrate.
// 	float t1 = max((b - m) / a, 0.0);
// 	float t2 = max((b + m) / a, 0.0);
// 	return CalculateShaftBrightness(pobject.z, vdir, t1, t2);
// }

export const calculateCylinderShaftBrightness = (cameraPositionOS, pobject) => {
  const vdir = cameraPositionOS.clone().sub(pobject)
  const v2 = new THREE.Vector2(vdir.x * vdir.x, vdir.y * vdir.y)
  const p2 = new THREE.Vector2(pobject.x * pobject.x, pobject.y * pobject.y)
  const a = ry2 * v2.x + rx2 * v2.y
  const b = -ry2 * pobject.x * vdir.x - rx2 * pobject.y * vdir.y
  const c = ry2 * p2.x + rx2 * p2.y - rx2ry2
  const m = Math.sqrt(Math.max(b * b - a * c, 0))
  const t1 = Math.max((b - m) / a, 0.0)
  const t2 = Math.max((b + m) / a, 0.0)
  return {
    t1, t2, vdir, v2, p2,
    ...calculateShaftBrightness(pobject.z, vdir, t1, t2)
  }
}
