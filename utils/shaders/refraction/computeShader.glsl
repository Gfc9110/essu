float minWave = 400.0;
float maxWave = 700.0;
#define PI 3.1415926538
#define baseIOR 1.3
uniform vec4 functions[10];
uniform int functionsCount;
uniform vec2 lightStart;
uniform vec2 lightEnd;
#define HASHSCALE3 vec3(.1031, .1030, .0973)

float evaluateFunction(float x, vec4 func) {
  //x = -x;
  float value = func.x + x * func.y + pow(x, 2.0) * func.z;
  return value;
}

float evaluateDerivative(float x, vec4 func) {
  //x = -x;
  return (func.y + x * func.z * 2.0);
}

bool isPointInsideShape(vec2 pos) {
  bool inside = true;
  for(int i = 0; i < functionsCount; i++) {
    float functionValue = evaluateFunction(pos.x, functions[i]);
    float offset = pos.y - functionValue;
    if(functions[i].w > 0.5) {
      offset = -offset;
    }
    if(offset < 0.0) {
      inside = false;
    }
  }
  return inside;
}

// 0 if not change
// 1 if entering shape
// -1 if exiting shape
int particleShapeInteraction(vec2 pos, vec2 vel) {
  bool wasInside = isPointInsideShape(pos);
  bool willBeInside = isPointInsideShape(pos + vel);
  if(wasInside == willBeInside) {
    return 0;
  }
  if(wasInside) {
    return -1;
  }
  return 1;
}

vec4 getNearestFunction2(vec2 particlePosition) {
  float particleX = particlePosition.x;
  float particleY = particlePosition.y;
  float dist = -1.0;
  vec4 nearest;
  for(int i = 0; i < functionsCount; i++) {
    vec4 f = functions[i];
    float functionY = evaluateFunction(particleX, f);
    float distY = abs(functionY - particleY);
    if(i == 0 || distY < dist) {
      nearest = f;
      dist = distY;
    }
  }
  return nearest;
}

vec4 getNearestFunction(vec2 pos) {
  vec4 nearest;
  float dist = -1.0;
  for(int i = 0; i < functionsCount; i++) {
    float functionValue = evaluateFunction(pos.x, functions[i]);
    //float offset = pos.y - functionValue;
    float fDist = abs(pos.y - functionValue);
    if(dist < -0.5 || fDist < dist) {
      dist = fDist;
      nearest = functions[i];
    }
  }
  return nearest;
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec2 evaluateNormal(vec4 function, float inputX) {
  float slope = evaluateDerivative(inputX, function);
  /*if(function.w > 0.5) {
    slope = -slope;
  }*/
  float angle = atan(slope);
  if(function.w > 0.5) {
    angle += PI / 2.0;
  } else {
    angle -= PI / 2.0;
  }
  return vec2(cos(angle), sin(angle));
}

float hash21(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D(texturePosVel, uv);
  vec2 position = data.xy;
  float movement = data.z;
  float rawDirection = fract(movement);
  float directionAngle = rawDirection * PI * 2.0;
  float speed = floor(movement);
  vec2 velocity = vec2(cos(directionAngle), sin(directionAngle)) * (speed / 5.0);
  if(hash21(position) > 0.997) {
    position = lightStart + hash22(position) * 4.0 - 2.0;
    data.w = hash21(uv / 100.0);
    float angle = atan(lightEnd.y - position.y,lightEnd.x - position.x);
    rawDirection = angle / (PI * 2.0);
    //rawDirection = hash21(uv) * 0.01 - 0.005;
  } else if(data.w >= 0.0) {
    int interaction = particleShapeInteraction(position, velocity);
    if(interaction == 1) {
      vec4 nearest = getNearestFunction2(position);
      //float slope = evaluateDerivative(position.x, nearest);
      //float angle = atan(slope);
      //angle += PI / 2.0;
      /*if(nearest.w > 0.5) {
        angle  = -angle;
      }*/
      //} else {
      //angle += PI / 2.0;
      //}
      //angle += PI / 2.0;
      //vec2 normal = vec2(-cos(angle), sin(angle));
      vec2 normal = evaluateNormal(nearest, position.x);
      /*if(nearest.w > 0.5) {
        normal = -normal;
      }*/
      vec2 direction = normalize(velocity * vec2(1, 1));
      float colorVariation = (data.w - 0.5) * 0.47;
      vec2 newDirection = refract(direction, normal, 1.0 / baseIOR + colorVariation);
      //newDirection = reflect(direction, normal);
      float newAngle = atan(newDirection.y, newDirection.x);
      rawDirection = newAngle / (PI * 2.0);
    } else if(interaction == -1) {
      vec4 nearest = getNearestFunction2(position);
      //float slope = evaluateDerivative(position.x, nearest);
      //float angle = atan(slope);
      //angle += PI / 2.0;
      /*if(nearest.w > 0.5) {
        angle  = -angle;
      }*/
      //} else {
      //angle += PI / 2.0;
      //}
      //angle += PI / 2.0;
      //vec2 normal = vec2(-cos(angle), sin(angle));
      vec2 normal = -evaluateNormal(nearest, position.x);
      /*if(nearest.w > 0.5) {
        normal = -normal;
      }*/
      vec2 direction = normalize(velocity * vec2(1, 1));
      float colorVariation = (data.w - 0.5) * 0.47;
      vec2 newDirection = refract(direction, normal, baseIOR + colorVariation);
      //newDirection = reflect(direction, normal);
      float newAngle = atan(newDirection.y, newDirection.x);
      rawDirection = newAngle / (PI * 2.0);
    }
  }
  //float wavelength = data.w;
  /*if(isPointInsideShape(position)) {
    speed = 8.0;
  } else {
    speed = 4.0;
  }*/
  gl_FragColor = vec4(position + velocity, speed + fract(rawDirection), data.w);
}
