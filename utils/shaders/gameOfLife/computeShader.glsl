//uniform float WIDTH;
//uniform float HEIGHT;
uniform int STEP;
uniform float RAND;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D(state, uv);
  //float randV = rand(uv);

  int nCount = 0;

  for(float x = -1.0; x < 2.0; x++) {
    for(float y = -1.0; y < 2.0; y++) {
      if(x != 0.0 || y != 0.0) {
        vec2 nUV = (gl_FragCoord.xy + vec2(x, y)) / resolution.xy;
        vec4 nData = texture2D(state, nUV);
        if(nData.x > 0.5)
          nCount++;
      }
    }
  }

  bool alive = data.x > 0.5;

  if(nCount == 3) {
    alive = true;
  } else if(nCount != 2) {
    alive = false;
  }

  float dataOut = 0.0;

  if(alive) {
    dataOut = 1.0;
  }

  if(STEP == 0) {
    dataOut = 0.0;
    float randData = rand(gl_FragCoord.xy);
    if(randData + RAND > 0.95) {
      dataOut = 1.0;
    }
  }

  gl_FragColor = vec4(vec3(dataOut), 1.0);
}