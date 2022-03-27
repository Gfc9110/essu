uniform vec4 functions[10];
uniform float width;
uniform float height;
uniform int functionsCount;

float evaluateFunction(float x, vec4 func) {
  float value = func.x + x * func.y + pow(x, 2.0) * func.z;
  return value;
}

float mapFragX(float x) {
  return x - width / 2.0;
}

float mapFragY(float y) {
  return y - height / 2.0;
}

void main() {
  float baseColor = 0.05;
  float outColor = 0.1;
  float pY = mapFragY(gl_FragCoord.y);

  for(int i = 0; i < functionsCount; i++) {
    float functionValue = evaluateFunction(mapFragX(gl_FragCoord.x), functions[i]);
    float offset = pY - functionValue;
    if(functions[i].w > 0.5) {
      offset = -offset;
    }
    if(offset < 0.0) {
      outColor = 0.0;
    }
  }

  //outColor = smoothstep(150.0001, 150.0, length(vec3(mapFragX(gl_FragCoord.x), mapFragY(gl_FragCoord.y), 0.0))) * 0.1;

  //outColor += 1.0 - abs(evaluateFunction(mapFragX(gl_FragCoord.x), functions[0]) - pY);
  gl_FragColor = vec4(vec3(outColor), 1);
}