uniform vec4 mouseData;

uniform float minX;
uniform float maxX;
uniform float minY;
uniform float maxY;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D(texturePosVel, uv);
  vec2 position = data.xy;
  vec2 velocity = data.zw;
  position = position + velocity;
  /*if (position.x < minX) {
    velocity.x = -velocity.x;
    position.x = minX;
  }
  if (position.x > maxX) {
    velocity.x = -velocity.x;
    position.x = maxX;
  }
  if (position.y < minY) {
    velocity.y = -velocity.y;
    position.y = minY;
  }
  if (position.y > maxY) {
    velocity.y = -velocity.y;
    position.y = maxY;
  }*/
  float d = pow(length(mouseData.xy - position), 2.0) / 1.0;
  d = max(1.0, d) * 0.1;
  velocity = velocity * 0.9;
  gl_FragColor = vec4(position + velocity, velocity + mouseData.zw / d);
  //gl_FragColor = vec4(position + velocity + mouseData.zw * 0.3 / d, velocity); // paint like
}
