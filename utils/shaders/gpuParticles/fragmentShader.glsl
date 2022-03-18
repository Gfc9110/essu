varying vec2 particleReference;
varying vec2 particleUv;
uniform sampler2D texturePosVel;
uniform sampler2D image;
uniform bool FIRST;

void main() {
  vec2 outColor = vec2(1.0);
  // gl_FragColor = vec4(texture2D(image, particleUv.xy)); //image
  gl_FragColor = vec4(particleUv.xy, 0, 1);
}
