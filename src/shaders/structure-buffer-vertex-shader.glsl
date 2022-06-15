varying vec4 my_position;

void main() {
  my_position = modelViewMatrix * vec4(position, 1.0);
  my_position.z = -my_position.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
