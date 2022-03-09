import { OrthographicCamera } from "three";

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

/**
 *
 * @param {*} renderer
 * @param {OrthographicCamera} camera
 */
export default function fixCameraAspect(renderer, camera, height) {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera.left = -(aspect * height) / 2;
    camera.right = (aspect * height) / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    //camera.aspect = canvas.clientWidth / canvas.clientHeight;

    camera.updateProjectionMatrix();
  }
}
