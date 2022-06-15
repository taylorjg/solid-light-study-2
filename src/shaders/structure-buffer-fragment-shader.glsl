varying vec4 my_position;

void main() {
  float z = my_position.z;
  float ddx = dFdx(z);
  float ddy = dFdy(z);
  gl_FragColor = vec4(ddx, ddy, z, 1.0);
}
