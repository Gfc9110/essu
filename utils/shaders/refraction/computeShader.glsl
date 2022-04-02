float minWave = 400.0;
float maxWave = 700.0;
#define PI 3.1415926538
#define baseIOR 1.3
uniform vec2 lightStart;
uniform vec2 lightEnd;
uniform float internalReflection;
#define HASHSCALE3 vec3(.1031, .1030, .0973)

uniform vec4 shapePoints[100];

int orientation(vec2 p, vec2 q, vec2 r) {
  float val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if(val == 0.0) {
    return 0;
  }
  if(val > 0.0) {
    return 1;
  }
  return 2;
}

bool onSegment(vec2 p, vec2 q, vec2 r) {
  return q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) && q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y);
}

bool doIntersect(vec4 segmentA, vec4 segmentB) {
  vec2 p1 = segmentA.xy;
  vec2 q1 = segmentA.zw;
  vec2 p2 = segmentB.xy;
  vec2 q2 = segmentB.zw;

  int o1 = orientation(p1, q1, p2);
  int o2 = orientation(p1, q1, q2);
  int o3 = orientation(p2, q2, p1);
  int o4 = orientation(p2, q2, q1);

  if(o1 != o2 && o3 != o4) {
    return true;
  }

  if(o1 == 0 && onSegment(p1, p2, q1)) {
    return true;
  }

  if(o2 == 0 && onSegment(p1, q2, q1)) {
    return true;
  }

  if(o3 == 0 && onSegment(p2, p1, q2)) {
    return true;
  }

  if(o4 == 0 && onSegment(p2, q1, q2)) {
    return true;
  }

  return false;
}

vec2 isInsideShape(vec2 position, vec2 velocity, int shapeStart, int shapeEnd) {
  float minY = 50000.0;
  float maxY = -50000.0;
  float minX = 50000.0;
  float maxX = -50000.0;
  vec2 normalAxis = vec2(0);
  for(int i = shapeStart; i <= shapeEnd; i++) {
    if(shapePoints[i].y < minY) {
      minY = shapePoints[i].y;
    }
    if(shapePoints[i].y > maxY) {
      maxY = shapePoints[i].y;
    }
    if(shapePoints[i].x < minX) {
      minX = shapePoints[i].x;
    }
    if(shapePoints[i].x > maxX) {
      maxX = shapePoints[i].x;
    }
  }
  if(position.y < minY || position.y > maxY || position.x < minX || position.x > maxX) {
    return vec2(0, 0);
  }
  //int sideCount = shapeEnd - shapeStart + 1;
  vec2 outside = vec2(maxX + 10.0, maxY + 10.0);
  int intersectCount = 0;
  vec4 nearestSegment = vec4(0);
  float segmentDistance = 50000.0;
  for(int i = shapeStart; i <= shapeEnd; i++) {
    int segmentStart = i;
    int segmentEnd = i + 1;
    if(segmentEnd > shapeEnd) {
      segmentEnd = shapeStart;
    }
    if(doIntersect(vec4(shapePoints[segmentStart].xy, shapePoints[segmentEnd].xy), vec4(position - velocity, position + velocity))) {
      nearestSegment = vec4(shapePoints[segmentStart].xy, shapePoints[segmentEnd].xy);
    }
    /*vec2 center = (shapePoints[segmentStart].xy + shapePoints[segmentEnd].xy) / 2.0;
    float dist = length(center - position);
    if(dist < segmentDistance) {
      segmentDistance = dist;
      nearestSegment = vec4(shapePoints[segmentStart].xy, shapePoints[segmentEnd].xy);
    }*/
    if(doIntersect(vec4(shapePoints[segmentStart].xy, shapePoints[segmentEnd].xy), vec4(position, outside))) {
      intersectCount += 1;
    }
  }
  bool inside = intersectCount % 2 == 1;
  if(inside) {
    vec2 center = (nearestSegment.xy + nearestSegment.zw) / 2.0;
    vec2 segmentVector = nearestSegment.xy - nearestSegment.zw;
    float normalAngle = atan(segmentVector.y, segmentVector.x) + PI / 2.0;
    normalAxis = vec2(cos(normalAngle), sin(normalAngle));
    intersectCount = 0;

    for(int i = shapeStart; i <= shapeEnd; i++) {
      int segmentStart = i;
      int segmentEnd = i + 1;
      if(segmentEnd > shapeEnd) {
        segmentEnd = shapeStart;
      }
      /*vec2 center = (shapePoints[segmentStart].xy + shapePoints[segmentEnd].xy) / 2.0;
      float dist = length(center - position);
      if(dist < segmentDistance) {
        segmentDistance = dist;
        nearestSegment = vec4(shapePoints[segmentStart].xy, shapePoints[segmentEnd].xy);
      }*/
      if(doIntersect(vec4(shapePoints[segmentStart].xy, shapePoints[segmentEnd].xy), vec4(center + normalAxis * 0.1, outside))) {
        intersectCount += 1;
      }
    }
    if(intersectCount % 2 == 1) {
      normalAxis = -normalAxis;
    }
  }
  return normalAxis;
  //return intersectCount % 2 == 1;
}

vec3 isPointInsideShape(vec2 pos, vec2 vel) {
  int inside = 0;

  int startShape = 0;
  int endShape = 0;
  vec2 normal = vec2(0);
  for(int i = 0; i < 100; i++) {
    if(shapePoints[i].w == 0.0) {
      endShape = i - 1;
      vec2 n = isInsideShape(pos, vel, startShape, endShape);
      if(length(n) > 0.5) {
        normal = n;
        inside = 1;
        i = 100;
      }
      if(i == 99 || shapePoints[i + 1].w == 0.0) {
        i = 100;
      }
      startShape = i + 1;
    }
  }
  return vec3(normal, inside);
}

// 0 if not change
// 1 if entering shape
// -1 if exiting shape
vec3 particleShapeInteraction(vec2 pos, vec2 vel) {
  vec3 wasInsideN = isPointInsideShape(pos, vel);
  vec3 willBeInsideN = isPointInsideShape(pos + vel, vel);
  bool wasInside = wasInsideN.z > 0.5;
  bool willBeInside = willBeInsideN.z > 0.5;
  if(wasInside == willBeInside) {
    return vec3(wasInsideN.xy, 0);
  }
  if(length(wasInsideN) > 0.5) {
    return vec3(wasInsideN.xy, -1);
  }
  return vec3(willBeInsideN.xy, 1);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
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
  vec2 velocity = vec2(cos(directionAngle), sin(directionAngle)) * (speed / 3.0);
  if(hash21(position) > 0.997) {
    position = lightStart + hash22(position) * 4.0 - 2.0;
    data.w = hash21(uv / 100.0);
    float angle = atan(lightEnd.y - position.y, lightEnd.x - position.x);
    rawDirection = angle / (PI * 2.0);
  } else if(data.w >= 0.0) {

    vec3 interaction = particleShapeInteraction(position, velocity);
    if(interaction.z > 0.5) {
      vec2 normal = normalize(interaction.xy * vec2(1, 1));
      vec2 direction = normalize(velocity * vec2(1, 1));
      float ccos = dot(normal, -direction);
      float colorVariation = (data.w - 0.5) * 0.47;
      vec2 newDirection = vec2(0, 0);
      //if(hash21(uv / 70.0) > ccos) {
        newDirection = refract(direction, normal, 1.0 / (baseIOR + colorVariation));
      //} else {
      //  newDirection = reflect(direction, normal);
      //}
      float newAngle = atan(newDirection.y, newDirection.x);
      rawDirection = newAngle / (PI * 2.0);
    } else if(interaction.z < -0.5) {
      vec2 normal = -normalize(interaction.xy);
      vec2 direction = normalize(velocity * vec2(1, 1));
      float ccos = dot(normal, -direction);
      float colorVariation = (data.w - 0.5) * 0.47;
      vec2 newDirection = vec2(0, 0);
      //if(hash21(uv / 70.0) > ccos) {
      if(internalReflection > 0.5) {
        newDirection = reflect(direction, normal);
      } else {
        newDirection = refract(direction, normal, baseIOR + colorVariation);
      }
      //} else {
      //  newDirection = reflect(direction, normal);
      //}
      float newAngle = atan(newDirection.y, newDirection.x);
      rawDirection = newAngle / (PI * 2.0);
    }
  }
  gl_FragColor = vec4(position + velocity, speed + min(fract(rawDirection), 0.999), data.w);
}
