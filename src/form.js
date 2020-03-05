import * as THREE from 'three'
import Line2dInit from 'three-line-2d'
import Line2dBasicShaderInit from 'three-line-2d/shaders/basic'
import * as U from './utils'

const Line2dGeometry = Line2dInit(THREE)
const Line2dShader = Line2dBasicShaderInit(THREE)

const TWO_PI = Math.PI * 2
const HALF_PI = Math.PI / 2

const PROJECTED_IMAGE_LINE_THICKNESS = 0.02
const ELLIPSE_POINT_COUNT = 100
const WIPE_POINT_COUNT = 50
const ROTATION_DELTA = Math.PI / (180 * 60)
const DELTA_ANGLE = 15 * Math.PI / 180
const ANGLE_OFFSET_THRESHOLD = 45 * Math.PI / 180

let currentRotationDelta = ROTATION_DELTA

export const setSpeed = multiplier => {
  currentRotationDelta = ROTATION_DELTA * multiplier
}

// Use our own code to calculate points on an elliptical curve because
// THREE.EllipseCurve seems to interfere with negative start/end angles.
class EllipseCurve {

  constructor(cx, cy, rx, ry) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
  }

  getPoint(angle) {
    const x = this.cx - this.rx * Math.cos(angle)
    const y = this.cy + this.ry * Math.sin(angle)
    return new THREE.Vector2(x, y)
  }

  getPoints(startAngle, endAngle, divisions) {
    const deltaAngle = endAngle - startAngle
    return U.range(divisions + 1).map(index => {
      const t = index / divisions
      const angle = startAngle + t * deltaAngle
      return this.getPoint(angle)
    })
  }
}

export class Form {

  constructor(scene, cx, cy, rx, ry, isInitiallyGrowing) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
    this.reset(isInitiallyGrowing)
    this.ellipseCurve = new EllipseCurve(cx, cy, rx, ry)
    this.wipeCurve = new THREE.CubicBezierCurve()
    this.screenImageGeometry = Line2dGeometry()
    const screenImageMaterial = new THREE.ShaderMaterial(
      Line2dShader({
        side: THREE.DoubleSide,
        diffuse: 0xffffff,
        thickness: PROJECTED_IMAGE_LINE_THICKNESS
      }))
    this.screenImageMesh = new THREE.Mesh(this.screenImageGeometry, screenImageMaterial)
    scene.add(this.screenImageMesh)
  }

  calculateSinusoidalDampingFactor(angle) {
    const dampingFactor = Math.pow(3 + (1 - Math.sin(angle % Math.PI)) * 5, 2)
    // console.log(`angle: ${angle}; dampingFactor: ${dampingFactor}`)
    return dampingFactor
  }

  getCurrentAngle() {
    const offsetFromStartAngle = currentRotationDelta * this.tick
    const baseAngle = -HALF_PI + offsetFromStartAngle
    const totalTicks = TWO_PI / currentRotationDelta
    const sinWaveTicks = totalTicks / 48
    const x = TWO_PI * (this.tick % sinWaveTicks) / sinWaveTicks
    const sinx = Math.sin(x)
    const sinusoidalDampingFactor = this.calculateSinusoidalDampingFactor(offsetFromStartAngle)
    const sinusoidalOffset = sinx / sinusoidalDampingFactor
    const finalAngle = baseAngle - sinusoidalOffset
    // console.log(`tick: ${this.tick}; offsetFromStartAngle: ${offsetFromStartAngle}; totalTicks: ${totalTicks}; sinWaveTicks: ${sinWaveTicks}; x: ${x}; sinx: ${sinx}; sinusoidalDampingFactor: ${sinusoidalDampingFactor}; sinusoidalOffset: ${sinusoidalOffset}; baseAngle: ${baseAngle}; finalAngle: ${finalAngle}`)
    return finalAngle
  }

  getWipeControlPoints(currentAngle) {
    const startAngle = -HALF_PI
    const angleOffset = Math.abs(currentAngle - startAngle)
    const angleOffset2 = angleOffset < Math.PI ? angleOffset : TWO_PI - angleOffset
    const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD
    const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor)
    const deltaAngle1 = currentAngle - DELTA_ANGLE * alpha
    const deltaAngle2 = currentAngle + DELTA_ANGLE * alpha
    const centrePoint = new THREE.Vector2(this.cx, this.cy)
    const deltaPoint1 = this.ellipseCurve.getPoint(deltaAngle1)
    const deltaPoint2 = this.ellipseCurve.getPoint(deltaAngle2)
    const startingPoint = this.ellipseCurve.getPoint(currentAngle)
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha)
    const controlPoint1 = deltaPoint1.lerp(endingPoint, 0.25)
    const controlPoint2 = deltaPoint2.lerp(endingPoint, 0.75)
    return {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    }
  }

  combineEllipseAndWipe(ellipsePoints, wipePoints) {
    const wipePointsTail = wipePoints.slice(1)
    return this.growing
      ? ellipsePoints.concat(wipePointsTail)
      : wipePointsTail.reverse().concat(ellipsePoints)
  }

  getWipePoints(currentAngle) {
    const {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    } = this.getWipeControlPoints(currentAngle)
    if (controlPoint1.equals(controlPoint2)) {
      return U.repeat(WIPE_POINT_COUNT + 1, startingPoint)
    }
    this.wipeCurve.v0.copy(startingPoint)
    this.wipeCurve.v1.copy(controlPoint1)
    this.wipeCurve.v2.copy(controlPoint2)
    this.wipeCurve.v3.copy(endingPoint)
    return this.wipeCurve.getPoints(WIPE_POINT_COUNT)
  }

  update() {
    const currentAngle = this.getCurrentAngle()
    if (this.growing) {
      this.endAngle = currentAngle
    } else {
      this.startAngle = currentAngle
    }
    const revolutionComplete = (this.growing ? this.endAngle : this.startAngle) > HALF_PI * 3
    if (revolutionComplete) {
      this.reset(!this.growing)
    } else {
      const ellipsePoints = this.ellipseCurve.getPoints(this.startAngle, this.endAngle, ELLIPSE_POINT_COUNT)
      const wipePoints = this.getWipePoints(currentAngle)
      const screenImagePoints = this.combineEllipseAndWipe(ellipsePoints, wipePoints)
      this.screenImageGeometry.update(U.vectorsAsArrays(screenImagePoints))
      this.tick++
    }
  }

  reset(growing) {
    this.growing = growing
    if (this.growing) {
      this.startAngle = -HALF_PI
      this.endAngle = -HALF_PI
    } else {
      this.startAngle = -HALF_PI
      this.endAngle = HALF_PI * 3
    }
    this.tick = 0
  }
}
