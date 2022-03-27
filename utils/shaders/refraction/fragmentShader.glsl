float minWave = 450.0;
float maxWave = 650.0;

varying vec2 particleUv;
uniform sampler2D texturePosVel;

//uniform vec4 functions[1];

float saturate(float x) {
  return min(1.0, max(0.0, x));
}

vec3 saturate(vec3 x) {
  return min(vec3(1., 1., 1.), max(vec3(0., 0., 0.), x));
}

vec3 bump3y(vec3 x, vec3 yoffset) {
  vec3 y = vec3(1., 1., 1.) - x * x;
  y = saturate(y - yoffset);
  return y;
}

vec3 spectral_zucconi6(float w) {
	// w: [400, 700]
	// x: [0,   1]
  float x = saturate((w - 400.0) / 300.0);

  const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
  const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
  const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);

  const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
  const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
  const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);

  return bump3y(c1 * (x - x1), y1) +
    bump3y(c2 * (x - x2), y2);
}

void main() {
  float wavelength = texture2D(texturePosVel, particleUv.xy).w;
  gl_FragColor = vec4(spectral_zucconi6(minWave + wavelength * (maxWave - minWave)), 0.01);
  //gl_FragColor = functions[0];
}
