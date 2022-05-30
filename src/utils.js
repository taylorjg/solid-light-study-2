import * as THREE from 'three'

export const range = n =>
  Array.from(Array(n).keys())

export const repeat = (n, x) =>
  range(n).map(() => x)

export const vectorsAsArrays = vectors =>
  vectors.map(vector => vector.toArray())

export const loadTexture = url =>
  new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(url, resolve, reject)
  })

export const reverseNormals = geometry => {
  const normalAttribute = geometry.getAttribute('normal')
  for (let i = 0; i < normalAttribute.array.length; i += normalAttribute.itemSize) {
    const x = normalAttribute.array[i + 0]
    const y = normalAttribute.array[i + 1]
    const z = normalAttribute.array[i + 2]
    const n = new THREE.Vector3(x, y, z).negate()
    normalAttribute.array[i + 0] = n.x
    normalAttribute.array[i + 1] = n.y
    normalAttribute.array[i + 2] = n.z
  }
}
