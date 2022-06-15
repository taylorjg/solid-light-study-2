varying vec3 pobject;

void main() {
  pobject = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
