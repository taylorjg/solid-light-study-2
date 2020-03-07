varying vec3 vPointInObjectSpace;
varying vec2 vUv;

void main() {
  vPointInObjectSpace = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
