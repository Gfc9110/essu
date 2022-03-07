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
import { generateBox } from "../utils/meshes/primitives";
import mouseGen from "../utils/mouse";
import fixCamera from "../utils/responsivePerspective";
import touchGen from "../utils/touch";
import Hammer from "hammerjs";

export default async function (renderer) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const scene = new Scene();
  const touch = touchGen(renderer);
  const hammer = Hammer(renderer.domElement);
  scene.background = new Color("#fffbf9");
  const camera = new PerspectiveCamera();
  camera.position.x = 0;
  camera.position.y = -10;
  camera.position.z = 10;
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

  const plane = generateBox(
    new Vector3(0, 0, 0),
    new Vector3(10, 10, 0.1),
    "white"
  );

  plane.receiveShadow = true;

  scene.add(plane);

  const box = generateBox(
    new Vector3(3.5, 0, 0.75),
    new Vector3(3, 4, 1.5),
    "blue"
  );
  box.castShadow = true;

  scene.add(box);

  /*hammer.on("pan", (event) => {
    cameraBase.rotation.z -= event.velocityX * 0.02;
    cameraArm.rotation.x += event.velocityY * 0.02;
    cameraArm.rotation.x = Math.min(
      Math.max(-Math.PI / 8, cameraArm.rotation.x),
      Math.PI / 8
    );
    console.log(event);
  });*/

  function update(deltaTime, time) {
    if (touch.down && touch.dragging) {
      cameraBase.rotation.z -= touch.movement.x * 0.001;
      cameraArm.rotation.x -= touch.movement.y * 0.001;
      cameraArm.rotation.x = Math.min(
        Math.max(-Math.PI / 8, cameraArm.rotation.x),
        Math.PI / 8
      );
    }
    fixCamera(renderer, camera);
  }

  return { scene, camera, update };
}
