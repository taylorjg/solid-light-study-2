import * as THREE from 'three'

export const makeLine = (scene, pt1, pt2) => {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x800080 })
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([pt1, pt2])
    const lineMesh = new THREE.Line(lineGeometry, lineMaterial)
    lineMesh.name = 'LINE'
    scene.add(lineMesh)
}
