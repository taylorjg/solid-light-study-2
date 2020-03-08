uniform vec3 cameraPositionInObjectSpace;
uniform float R2;
uniform float recipR2;
uniform float recip3R2;
uniform float normalizer;

varying vec3 vPointInObjectSpace;

float CalculateHaloBrightness() {
	vec3 vdir = cameraPositionInObjectSpace - vPointInObjectSpace;
	float v2 = dot(vdir, vdir);
	float p2 = dot(vPointInObjectSpace, vPointInObjectSpace);
	float pv = -dot(vPointInObjectSpace, vdir);
	float m = sqrt(max(pv * pv - v2 * (p2 - R2), 0.0));

	// Calculate clamped limits of integration.
	float t1 = clamp((pv - m) / v2, 0.0, 1.0);
	float t2 = clamp((pv + m) / v2, 0.0, 1.0);
	float u1 = t1 * t1;
	float u2 = t2 * t2;

	// Evaluate density integral, normalize, and square.
	float B = ((1.0 - p2 * recipR2) * (t2 - t1) + pv * recipR2 * (u2 - u1) - v2 * recip3R2 * (t2 * u2 - t1 * u1)) * normalizer;
	return (B * B * v2);
}

void main() {
  float B = CalculateHaloBrightness();
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0) * B;
}
