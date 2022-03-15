attribute vec2 reference;
uniform sampler2D texturePosVel;

void main() {
  vec4 data = texture2D( texturePosVel, reference );
  gl_PointSize = 1.0;
  gl_Position = projectionMatrix *  viewMatrix  *  vec4(data.x, data.y, 1.0, 1.0);
}
