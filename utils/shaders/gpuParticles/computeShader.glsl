void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D( texturePosVel, uv );
  vec2 position = data.xy;
  vec2 velocity = data.zw;
  gl_FragColor = vec4(position + velocity, velocity);
}
