#define HASHSCALE3 vec3(.1031, .1030, .0973)
#define PI 3.1415926538

uniform vec4 mouseData;

uniform sampler2D windTexture;

uniform float minX;
uniform float maxX;
uniform float minY;
uniform float maxY;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec2 getWind(vec2 pos) {
  float angle = atan(pos.y, pos.x);
  return vec2(cos(angle + PI / 2.0), sin(angle + PI / 2.0)) * 0.1;
  //return pos * 0.01;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D(texturePosVel, uv);
  vec2 position = data.xy;
  vec2 velocity = data.zw;
  //position = position + velocity;
  if(position.x < minX) {
    position.x = -0.1;
    position.y = 0.0;
    velocity = hash22(position);
  }
  if(position.x > maxX) {
    position.x = 0.1;
    position.y = 0.0;
    velocity = hash22(position);
  }
  if(position.y < minY) {
    position.y = 0.0;
    position.x = -0.1;
    velocity = hash22(position);
  }
  if(position.y > maxY) {
    position.y = 0.0;
    position.x = 0.1;
    velocity = hash22(position);

  }
  vec2 screenUv = vec2((position.x - minX) / (maxX - minX), (position.y - minY) / (maxY - minY));
  float d = pow(length(mouseData.xy - position), 2.0) / 1.0;
  d = max(1.0, d) * 0.1;
  velocity = velocity * 0.96;
  vec2 windData = getWind((screenUv - 0.5));
  velocity += windData * 1.0 + (hash22(position + gl_FragCoord.xy) - 0.5) * 0.03;
  gl_FragColor = vec4(position + velocity, velocity + mouseData.zw / d);
  //gl_FragColor = vec4(position + velocity + mouseData.zw * 0.3 / d, velocity); // paint like
}
