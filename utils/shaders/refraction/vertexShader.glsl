attribute vec2 reference;
uniform sampler2D texturePosVel;
out vec2 particleUv;

void main() {
  vec4 data = texture2D(texturePosVel, reference);
  particleUv = reference;
  gl_PointSize = 1.0;
  gl_Position = projectionMatrix * viewMatrix * vec4(data.x, data.y, 1.0, 1.0);
}
