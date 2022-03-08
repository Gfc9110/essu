import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
} from "three";
import GUI from "../utils/gui";
import { generateBox } from "../utils/meshes/primitives";
import {
  fixOrtho,
  fixPersp,
  resizeRendererToDisplaySize,
} from "../utils/responsiveCamera";
import fixCamera from "../utils/responsivePerspective";
import touchGen from "../utils/touch";

/**
 *
 * @param {import("three").WebGLRenderer} renderer
 */
export default async function (renderer) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  renderer.autoClear = false;

  const scene = new Scene();
  const { touch } = touchGen(renderer);
  scene.background = new Color("#fffbf9");
  const camera = new PerspectiveCamera();
  const gui = new GUI(renderer, touch);
  camera.position.x = 0;
  camera.position.y = window.innerHeight > window.innerWidth ? -20 : -10;
  camera.position.z = window.innerHeight > window.innerWidth ? 20 : 10;
  camera.rotation.x = Math.PI / 4;

  const ambient = new AmbientLight("#fffbf9", 0.4);

  scene.add(ambient);

  const light = new DirectionalLight();
  light.position.x = 2;
  light.position.y = 2;
  light.position.z = 10;
  light.intensity = 0.5;
  light.castShadow = true;

  const cameraArm = new Group();
  cameraArm.add(camera);

  const cameraBase = new Group();
  cameraBase.add(cameraArm);

  scene.add(cameraBase);
  scene.add(light);

  const box = generateBox(new Vector3(0, 0, 0), new Vector3(2, 2, 2), "red");

  scene.add(box);

  function update(deltaTime, time) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixPersp(renderer, camera);
      fixOrtho(renderer, gui.camera, renderer.domElement.height);
      camera.updateProjectionMatrix();
      gui.camera.updateProjectionMatrix();
    }
    fixCamera(renderer, camera);
    camera.position.y = window.innerHeight > window.innerWidth ? -20 : -10;
    camera.position.z = window.innerHeight > window.innerWidth ? 20 : 10;
    if (touch.isDown && touch.dragging) {
      cameraBase.rotation.z -= touch.movement.x * 0.001;
      cameraArm.rotation.x -= touch.movement.y * 0.001;
      cameraArm.rotation.x = Math.min(
        Math.max(-Math.PI / 8, cameraArm.rotation.x),
        Math.PI / 8
      );
    }
    renderer.clear();
    renderer.render(scene, camera);
    renderer.render(gui.scene, gui.camera);
  }

  return { scene, camera, update };
}
