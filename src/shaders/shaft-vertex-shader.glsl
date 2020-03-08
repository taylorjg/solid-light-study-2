varying vec3 vPointInObjectSpace;

void main() {
  vPointInObjectSpace = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
