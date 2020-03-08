uniform vec3 cameraPositionInObjectSpace;
uniform float rx2;
uniform float ry2;
uniform float rx2ry2;
uniform float sigma;
uniform float rho0;
uniform float normalizer;

varying vec3 vPointInObjectSpace;

float CalculateShaftBrightness(float pz, vec3 vdir, float t1, float t2) {
	// Evaluate density integral, normalize, and square.
	float B = (sigma * (pz + vdir.z * ((t1 + t2) * 0.5)) + rho0) * (t2 - t1) * normalizer;
	return (B * B * dot(vdir, vdir));
}

float CalculateCylinderShaftBrightness() {
	vec3 vdir = cameraPositionInObjectSpace - vPointInObjectSpace;
	vec2 v2 = vdir.xy * vdir.xy;
	vec2 p2 = vPointInObjectSpace.xy * vPointInObjectSpace.xy;

	// Calculate quadratic coefficients.
	float a = ry2 * v2.x + rx2 * v2.y;
	float b = -ry2 * vPointInObjectSpace.x * vdir.x - rx2 * vPointInObjectSpace.y * vdir.y;
	float c = ry2 * p2.x + rx2 * p2.y - rx2ry2;
	float m = sqrt(max(b * b - a * c, 0.0));

	// Calculate limits and integrate.
	float t1 = max((b - m) / a, 0.0);
	float t2 = max((b + m) / a, 0.0);

	return CalculateShaftBrightness(vPointInObjectSpace.z, vdir, t1, t2);
}

void main() {
  float B = CalculateCylinderShaftBrightness();
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * B;
}
