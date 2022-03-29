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

bool isInsideShape(vec2 position, int shapeStart, int shapeEnd) {
  float minY = 50000.0;
  float maxY = -50000.0;
  for(int i = shapeStart; i < shapeEnd; i++) {
    if(shapePoints[i].y < minY) {
      minY = shapePoints[i].y;
    }
    if(shapePoints[i].y > maxY) {
      maxY = shapePoints[i].y;
    }
  }
  if(position.y < minY || position.y > maxY ) {
    return false;
  }

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

  if(length(vec2(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y)) - lightStart) < 8.0) {
    outColor = vec3(0,1,0);
  } else if (length(vec2(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y)) - lightEnd) < 8.0) {
    outColor = vec3(1,0,0);
  }

  //outColor = smoothstep(150.0001, 150.0, length(vec3(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y), 0.0))) * 0.1;

  //outColor += 1.0 - abs(evaluateFunction(mapFragX(gl_FragCoord.x), functions[0]) - pY);
  gl_FragColor = vec4(outColor, 1);
}