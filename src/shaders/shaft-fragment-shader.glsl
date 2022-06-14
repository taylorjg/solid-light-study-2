uniform vec3 cameraPositionOS;
uniform float rx2;
uniform float ry2;
uniform float rx2ry2;
uniform float shaftSigma;
uniform float shaftRho0;
uniform float shaftTau;
uniform float normalizer;

varying vec3 pobject;

float CalculateShaftBrightness(float pz, vec3 vdir, float t1, float t2) {

	t1 = clamp(t1, 0.0, 1.0);
	t2 = clamp(t2, 0.0, 1.0);

	// Limit to range where density is not negative.
	float tlim = (shaftTau - pz) / vdir.z;
	if (vdir.z * shaftSigma < 0.0) {
		t1 = min(t1, tlim);
		t2 = min(t2, tlim);
	} else {
		t1 = max(t1, tlim);
		t2 = max(t2, tlim);
	}

	// Evaluate density integral, normalize, and square.
	float B = (shaftSigma * (pz + vdir.z * ((t1 + t2) * 0.5)) + shaftRho0) * (t2 - t1) * normalizer;
	return B * B * dot(vdir, vdir);
}

float CalculateCylinderShaftBrightness() {
	vec3 vdir = cameraPositionOS - pobject;
	vec2 v2 = vdir.xy * vdir.xy;
	vec2 p2 = pobject.xy * pobject.xy;

	// Calculate quadratic coefficients.
	float a = ry2 * v2.x + rx2 * v2.y;
	float b = -ry2 * pobject.x * vdir.x - rx2 * pobject.y * vdir.y;
	float c = ry2 * p2.x + rx2 * p2.y - rx2ry2;
	float m = sqrt(max(b * b - a * c, 0.0));

	// Calculate limits and integrate.
	float t1 = max((b - m) / a, 0.0);
	float t2 = max((b + m) / a, 0.0);

	return CalculateShaftBrightness(pobject.z, vdir, t1, t2);
}

vec4 interpretValue(float value, float a) {

	if (value < 0.0) {
		return vec4(0.0, 1.0, 0.0, a);
	}

	if (value > 10.0) {
		return vec4(1.0, 0.0, 1.0, a);
	}

	if (value > 1.0) {
		return vec4(0.0, 0.0, 1.0, a);
	}

	return vec4(value, 0.0, 0.0, a);
}

void main() {
  float B = CalculateCylinderShaftBrightness();
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0) * B;
	return;

	/*
	float fred = abs(mod(pobject.z, 1.0));
	if (fred < 0.05) {
	  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
	} else {
	  gl_FragColor = vec4(0.0);
	}
	*/

	/*
	if (pobject.x < 0.0) {
	  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
	} else {
	  gl_FragColor = vec4(0.0);
	}
	*/

	// gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

	/*
	vec3 vdir = cameraPositionOS - pobject;
	vec2 v2 = vdir.xy * vdir.xy;
	vec2 p2 = pobject.xy * pobject.xy;
	float a = ry2 * v2.x + rx2 * v2.y;
	float b = -ry2 * pobject.x * vdir.x - rx2 * pobject.y * vdir.y;
	float c = ry2 * p2.x + rx2 * p2.y - rx2ry2;
	float m = sqrt(max(b * b - a * c, 0.0));
	float t1 = max((b - m) / a, 0.0);
	float t2 = max((b + m) / a, 0.0);
	gl_FragColor = interpretValue(t2, 0.8);
	*/	
}
