varying vec3 vPosition;
// varying vec3 vHaloPosition;

const float R = 1.0;
const float R2 = R * R;
const float recipR2 = 1.0 / R2;
const float recip3R2 = 1.0 / (3.0 * R2);
const float normalizer = 3.0 / (4.0 * R);

float CalculateHaloBrightness()
{
	vec3 vdir = cameraPosition - vPosition;
  // vec3 cameraPositionInObjectSpace = cameraPosition - vHaloPosition;
	// vec3 vdir = cameraPositionInObjectSpace - vPosition;
	float v2 = dot(vdir, vdir);
	float p2 = dot(vPosition, vPosition);
	float pv = -dot(vPosition, vdir);
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
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * B;
}
