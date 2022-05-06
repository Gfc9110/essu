//varying vec2 particleReference;
varying vec2 particleUv;
uniform sampler2D texturePosVel;
//uniform sampler2D image;
//uniform bool FIRST;

uniform float time;

void main() {
  //vec2 outColor = vec2(1.0);
  // gl_FragColor = vec4(texture2D(image, particleUv.xy)); //image
  //gl_FragColor = vec4(particleUv.xy, 1, 1);

  vec3 outColor = vec3(particleUv.xy, (sin(time * 0.001) + 1.0) / 2.0);
  //outColor *= smoothstep(0.5, 0.2, length(fract(texture2D(texturePosVel, particleUv.xy).xy / 20.0) - 0.5));
  gl_FragColor = vec4(outColor, 1.0);
  //gl_FragColor = vec4(1);
}
