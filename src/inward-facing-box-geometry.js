import * as THREE from 'three'

export const makeInwardFacingBoxGeometry = (
  width,
  height,
  depth,
  faces = 'top,bottom,left,right,front,back'
) => {

  const halfWidth = width / 2
  const halfHeight = height / 2
  const halfDepth = depth / 2

  const vertices = [
    new THREE.Vector3(halfWidth, -halfHeight, halfDepth),
    new THREE.Vector3(halfWidth, -halfHeight, -halfDepth),
    new THREE.Vector3(halfWidth, halfHeight, -halfDepth),
    new THREE.Vector3(halfWidth, halfHeight, halfDepth),
    new THREE.Vector3(-halfWidth, -halfHeight, halfDepth),
    new THREE.Vector3(-halfWidth, -halfHeight, -halfDepth),
    new THREE.Vector3(-halfWidth, halfHeight, -halfDepth),
    new THREE.Vector3(-halfWidth, halfHeight, halfDepth)
  ]

  const RIGHT_BOTTOM_FRONT = 0
  const RIGHT_BOTTOM_BACK = 1
  const RIGHT_TOP_BACK = 2
  const RIGHT_TOP_FRONT = 3
  const LEFT_BOTTOM_FRONT = 4
  const LEFT_BOTTOM_BACK = 5
  const LEFT_TOP_BACK = 6
  const LEFT_TOP_FRONT = 7

  const topFacePoints = [
    vertices[LEFT_TOP_BACK],
    vertices[RIGHT_TOP_BACK],
    vertices[RIGHT_TOP_FRONT],
    vertices[LEFT_TOP_FRONT],
    vertices[LEFT_TOP_BACK],
    vertices[RIGHT_TOP_FRONT]
  ]

  const bottomFacePoints = [
    vertices[RIGHT_BOTTOM_FRONT],
    vertices[RIGHT_BOTTOM_BACK],
    vertices[LEFT_BOTTOM_BACK],
    vertices[RIGHT_BOTTOM_FRONT],
    vertices[LEFT_BOTTOM_BACK],
    vertices[LEFT_BOTTOM_FRONT]
  ]

  const leftFacePoints = [
    vertices[LEFT_BOTTOM_FRONT],
    vertices[LEFT_BOTTOM_BACK],
    vertices[LEFT_TOP_BACK],
    vertices[LEFT_TOP_FRONT],
    vertices[LEFT_BOTTOM_FRONT],
    vertices[LEFT_TOP_BACK]
  ]

  const rightFacePoints = [
    vertices[RIGHT_BOTTOM_FRONT],
    vertices[RIGHT_TOP_BACK],
    vertices[RIGHT_BOTTOM_BACK],
    vertices[RIGHT_BOTTOM_FRONT],
    vertices[RIGHT_TOP_FRONT],
    vertices[RIGHT_TOP_BACK]
  ]

  const frontFacePoints = [
    vertices[LEFT_BOTTOM_FRONT],
    vertices[LEFT_TOP_FRONT],
    vertices[RIGHT_TOP_FRONT],
    vertices[RIGHT_TOP_FRONT],
    vertices[RIGHT_BOTTOM_FRONT],
    vertices[LEFT_BOTTOM_FRONT]
  ]

  const backFacePoints = [
    vertices[RIGHT_TOP_BACK],
    vertices[LEFT_TOP_BACK],
    vertices[LEFT_BOTTOM_BACK],
    vertices[LEFT_BOTTOM_BACK],
    vertices[RIGHT_BOTTOM_BACK],
    vertices[RIGHT_TOP_BACK]
  ]

  const maybeFacePoints = (face, facePoints) => faces.includes(face) ? facePoints : []

  const maybeTopFacePoints = maybeFacePoints('top', topFacePoints)
  const maybeBottomFacePoints = maybeFacePoints('bottom', bottomFacePoints)
  const maybeLeftFacePoints = maybeFacePoints('left', leftFacePoints)
  const maybeRightFacePoints = maybeFacePoints('right', rightFacePoints)
  const maybeFrontFacePoints = maybeFacePoints('front', frontFacePoints)
  const maybeBackFacePoints = maybeFacePoints('back', backFacePoints)

  const points = [
    ...maybeTopFacePoints,
    ...maybeBottomFacePoints,
    ...maybeLeftFacePoints,
    ...maybeRightFacePoints,
    ...maybeFrontFacePoints,
    ...maybeBackFacePoints
  ]

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  geometry.computeVertexNormals()

  return geometry
}
