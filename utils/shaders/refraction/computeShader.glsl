float minWave = 400.0;
float maxWave = 700.0;
#define PI 3.1415926538
#define baseIOR 1.5
uniform vec4 functions[10];
uniform int functionsCount;

float evaluateFunction(float x, vec4 func) {
  float value = func.x + x * func.y + pow(x, 2.0) * func.z;
  return value;
}

float evaluateDerivative(float x, vec4 func) {
  return func.y + x * func.z * 2.0;
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

vec4 getNearestFunction(vec2 pos) {
  vec4 nearest;
  float dist = -1.0;
  for(int i = 0; i < functionsCount; i++) {
    float functionValue = evaluateFunction(pos.x, functions[i]);
    //float offset = pos.y - functionValue;
    float fDist = abs(pos.y - functionValue);
    if(dist < 0.5 || fDist < dist) {
      dist = fDist;
      nearest = functions[i];
    }
  }
  return nearest;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D(texturePosVel, uv);
  vec2 position = data.xy;
  float movement = data.z;
  float rawDirection = fract(movement);
  float directionAngle = rawDirection * PI * 2.0;
  float speed = floor(movement);
  vec2 velocity = vec2(cos(directionAngle), sin(directionAngle)) * (speed / 20.0);
  int interaction = particleShapeInteraction(position, velocity);
  if(interaction == 1) {
    vec4 nearest = getNearestFunction(position);
    float slope = evaluateDerivative(position.x, nearest);
    float angle = atan(slope);
    //angle += PI / 2.0;
    /*if(nearest.w > 0.5) {
      angle  = -angle;
    }*/
    //} else {
    angle -= PI / 2.0;
    //}
    //angle += PI / 2.0;
    vec2 normal = vec2(cos(angle), sin(angle));
    /*if(nearest.w > 0.5) {
      normal = -normal;
    }*/
    vec2 direction = normalize(velocity);
    vec2 newDirection = refract(direction, normal, 1.3);
    float newAngle = atan(newDirection.y, newDirection.x);
    rawDirection = newAngle / (PI * 2.0);
  } /*else if(interaction == -1) {
    vec4 nearest = getNearestFunction(position);
    float slope = evaluateDerivative(position.x, nearest);
    float angle = atan(slope);
    if(nearest.w < 0.5) {
      angle = -angle;
    }
    angle += PI / 2.0;
    vec2 normal = vec2(cos(angle), sin(angle));
    vec2 direction = normalize(velocity);
    vec2 newDirection = refract(direction, normal, 1.0 / baseIOR);
    float newAngle = atan(newDirection.y, newDirection.x);
    rawDirection = newAngle / (PI * 2.0);
  } */
  //float wavelength = data.w;
  /*if(isPointInsideShape(position)) {
    speed = 8.0;
  } else {
    speed = 4.0;
  }*/
  gl_FragColor = vec4(position + velocity, speed + rawDirection, data.w);
}
