attribute vec2 reference;
//attribute vec2 pUv;
uniform sampler2D texturePosVel;

//out vec2 particleReference;
out vec2 particleUv;

void main() {
  vec4 data = texture2D(texturePosVel, reference);
  //particleReference = reference;
  particleUv = reference;
  gl_PointSize = 2.0;
  gl_Position = projectionMatrix * viewMatrix * vec4(data.x, data.y, 1.0, 1.0);
}
