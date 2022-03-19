uniform vec4 mouseData;

uniform sampler2D windTexture;

uniform float minX;
uniform float maxX;
uniform float minY;
uniform float maxY;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D(texturePosVel, uv);
  vec2 position = data.xy;
  vec2 velocity = data.zw;
  position = position + velocity;
  if(position.x < minX) {
    //velocity.x = -velocity.x;
    /*position.x = 0.0;
    position.y = 0.001;
    velocity.x = 0.0;
    velocity.y = 0.0;*/
    position = vec2((rand(gl_FragCoord.xy * 10.0)) - 0.5) * 20.0;
    velocity.x = 0.0;
    velocity.y = 0.0;
  }
  if(position.x > maxX) {
    //velocity.x = -velocity.x;
    /*position.x = 0.0;
    position.y = 0.001;
    velocity.x = 0.0;
    velocity.y = 0.0;*/
    position = vec2((rand(gl_FragCoord.xy * 10.0)) - 0.5) * 20.0;
    velocity.x = 0.0;
    velocity.y = 0.0;
  }
  if(position.y < minY) {
    //velocity.y = -velocity.y;
    /*position.x = 0.0;
    position.y = 0.001;
    velocity.x = 0.0;
    velocity.y = 0.0;*/
    position = vec2((rand(gl_FragCoord.xy * 10.0)) - 0.5) * 20.0;
    velocity.x = 0.0;
    velocity.y = 0.0;
  }
  if(position.y > maxY) {
    //velocity.y = -velocity.y;
    /*position.x = 0.0;
    position.y = 0.001;
    velocity.x = 0.0;
    velocity.y = 0.0;*/
    position = vec2((rand(gl_FragCoord.xy * 10.0)) - 0.5) * 20.0;
    velocity.x = 0.0;
    velocity.y = 0.0;
  }
  float d = pow(length(mouseData.xy - position), 2.0) / 1.0;
  d = max(1.0, d) * 0.1;
  velocity = velocity * 0.95;
  vec2 windData = texture2D(windTexture, vec2((position.x - minX) / (maxX - minX), (position.y - minY) / (maxY - minY))).xy;
  velocity += windData + (vec2(rand(position * -1000.0)) - 0.5) * 0.01;
  gl_FragColor = vec4(position + velocity, velocity + mouseData.zw / d);
  //gl_FragColor = vec4(position + velocity + mouseData.zw * 0.3 / d, velocity); // paint like
}
