uniform vec4 functions[10];
uniform float width;
uniform float height;
uniform int functionsCount;

uniform vec4 shapePoints[100];
uniform vec2 lightStart;
uniform vec2 lightEnd;

float evaluateFunction(float x, vec4 func) {
  float value = func.x + x * func.y + pow(x, 2.0) * func.z;
  return value;
}

int orientation(vec2 p, vec2 q, vec2 r) {
  float val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val == 0.0) {
    return 0;
  }
  if (val > 0.0) {
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

  if (o1 != o2 && o3 != o4) {
    return true;
  }

  if (o1 == 0 && onSegment(p1, p2, q1)) {
    return true;
  }

  if (o2 == 0 && onSegment(p1, q2, q1)) {
    return true;
  }

  if (o3 == 0 && onSegment(p2, p1, q2)) {
    return true;
  }

  if (o4 == 0 && onSegment(p2, q1, q2)) {
    return true;
  }

  return false;
}

bool isInsideShape(vec2 position, int shapeStart, int shapeEnd) {
  float minY = 50000.0;
  float maxY =  -50000.0;
  float minX = 50000.0;
  float maxX = -50000.0;
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
  if (position.y < minY || position.y > maxY || position.x < minX || position.x > maxX) {
    return false;
  }
  //int sideCount = shapeEnd - shapeStart + 1;
  vec2 outside = vec2(maxX + 10.0, maxY + 10.0);
  int intersectCount = 0;
  for(int i = shapeStart; i <= shapeEnd; i++) {
    int segmentStart = i;
    int segmentEnd = shapeEnd;
    if(segmentEnd == segmentStart) {
      segmentEnd = shapeStart;
    }
    if (doIntersect(vec4(shapePoints[segmentStart].xy, shapePoints[segmentEnd].xy), vec4(position, outside))) {
      intersectCount += 1;
    }
  }
  return intersectCount % 2 == 1;
}

float mapFragX(float x) {
  return x - width / 2.0;
}

float mapFragY(float y) {
  return y - height / 2.0;
}

void main() {
  float baseColor = 0.05;
  vec3 outColor = vec3(0.1,0.1,0.1);
  float pY = mapFragY(gl_FragCoord.y);

  for(int i = 0; i < functionsCount; i++) {
    float functionValue = evaluateFunction(mapFragX(gl_FragCoord.x), functions[i]);
    float offset = pY - functionValue;
    if(functions[i].w > 0.5) {
      offset = -offset;
    }
    if(offset < 0.0) {
      outColor = vec3(0,0,0);;
    }
  }

  vec2 worldPosition = vec2(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y));

  int startShape = 0;
  int endShape = 0;

  for(int i = 0; i < 100; i++) {
    if(shapePoints[i].w == 0.0) {
      endShape = i - 1;
      if(isInsideShape(worldPosition, startShape, endShape)) {
        outColor = vec3(0,0,1);
      }
      if(i == 99 || shapePoints[i+1].w == 0.0) {
        i = 99;
      }
      startShape = i+1;
    }
  }

  if(length(vec2(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y)) - lightStart) < 8.0) {
    outColor = vec3(0,1,0);
  } else if (length(vec2(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y)) - lightEnd) < 8.0) {
    outColor = vec3(1,0,0);
  }

  //outColor = smoothstep(150.0001, 150.0, length(vec3(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y), 0.0))) * 0.1;

  //outColor += 1.0 - abs(evaluateFunction(mapFragX(gl_FragCoord.x), functions[0]) - pY);
  gl_FragColor = vec4(outColor, 1);
}