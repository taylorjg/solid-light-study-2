// uniform vec3 haloPosition;
varying vec3 vPosition;
// varying vec3 vHaloPosition;

void main() {
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  // vHaloPosition = (modelViewMatrix * vec4(haloPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
