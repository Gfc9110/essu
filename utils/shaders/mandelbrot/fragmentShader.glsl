uniform float WIDTH;
uniform float HEIGHT;
uniform vec2 OFFSET;
uniform vec2 SIZE;
uniform float ZOOM;

void main() {
  vec2 uv = (gl_FragCoord.xy - (SIZE) / 2.0) / SIZE.y;
  uv *= ZOOM;
  uv -= OFFSET / SIZE.y;
  float x0 = uv.x;
  float y0 = uv.y;
  float x2 = 0.0;
  float y2 = 0.0;
  float w = 0.0;
  int n = 0;
  float outColor = 1.0;
  while(x2 + y2 <= 4.0 && n < 1000) {
    float x = x2 - y2 + x0;
    float y = w - x2 - y2 + y0;
    x2 = x * x;
    y2 = y * y;
    w = (x + y) * (x + y);
    n++;
  }
  if(n < 1000) {
    outColor = 0.0;
  }

  gl_FragColor = vec4(vec3(outColor), 1.0);
}