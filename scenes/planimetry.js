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
import fixCamera from "../utils/responsivePerspective";
import touchGen from "../utils/touch";

export default async function (renderer) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const scene = new Scene();
  const { touch, touchUpdate } = touchGen(renderer);
  scene.background = new Color("#fffbf9");
  const camera = new PerspectiveCamera();
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

  const plane = generateBox(
    new Vector3(0, 0, 0),
    new Vector3(10, 10, 0.1),
    "white"
  );

  plane.receiveShadow = true;

  scene.add(plane);

  const blueBox = generateBox(
    new Vector3(3.5, 0, 0.75),
    new Vector3(3, 4, 1.5),
    "blue"
  );
  blueBox.userData["cursor"] = true;
  blueBox.castShadow = true;

  scene.add(blueBox);

  const redBox = generateBox(
    new Vector3(-3.5, -3.5, 0.75),
    new Vector3(3, 3, 1.5),
    "red"
  );
  redBox.userData["cursor"] = true;
  redBox.castShadow = true;

  scene.add(redBox);

  const greenBox = generateBox(
    new Vector3(0, 3.5, 0.75),
    new Vector3(10, 3, 1.5),
    "green"
  );
  greenBox.userData["cursor"] = true;
  greenBox.castShadow = true;

  scene.add(greenBox);

  /**
   * @type {import("three").Mesh}
   */
  touch.onDown.push(() => {
    for (let intersection of touch.getIntersections(camera, scene)) {
      if (intersection.object.userData["cursor"]) {
        intersection.object.material.color.set("#555");
        return;
      }
    }
  });

  function update(deltaTime, time) {
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
  }

  return { scene, camera, update };
}
