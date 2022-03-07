import {
  Color,
  DirectionalLight,
  Group,
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
  const scene = new Scene();
  const hammer = Hammer(renderer.domElement);
  scene.background = new Color("white");
  const camera = new PerspectiveCamera();
  camera.position.x = 0;
  camera.position.y = -10;
  camera.position.z = 10;
  camera.rotation.x = Math.PI / 4;

  const light = new DirectionalLight();
  light.position.x = 10;
  light.position.y = 10;
  light.position.z = 10;

  const cameraArm = new Group();
  cameraArm.add(camera);

  const cameraBase = new Group();
  cameraBase.add(cameraArm);

  scene.add(cameraBase);
  scene.add(light);

  scene.add(
    generateBox(new Vector3(0, 0, 0), new Vector3(10, 10, 0.1), "white")
  );

  hammer.on("pan", (event) => {
    cameraBase.rotation.z -= event.velocityX * 0.02;
    cameraArm.rotation.x += event.velocityY = 0.02;
    console.log(event);
  });

  function update(deltaTime, time) {
    fixCamera(renderer, camera);
  }

  return { scene, camera, update };
}
