/**
 *
 * @param {import("three").WebGLRenderer} renderer
 * @returns
 */
export function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

export function fixOrtho(renderer, camera, height) {
  const canvas = renderer.domElement;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  camera.left = -(aspect * height) / 2;
  camera.right = (aspect * height) / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.updateProjectionMatrix();
}

export function fixPersp(renderer, camera) {
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
}
