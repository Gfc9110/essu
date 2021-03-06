import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  Vector2,
  Vector3,
} from "three";
import gradientMaterial from "../utils/materials/gradientMaterial";
import { generateBox } from "../utils/meshes/primitives";
import {
  fixOrtho,
  fixPersp,
  resizeRendererToDisplaySize,
} from "../utils/responsiveCamera";
import fixCamera from "../utils/responsivePerspective";
import touchGen from "../utils/touch";
import MultitouchInput from "../utils/input/multitouch";
import GuiManager, { StickInput } from "../utils/gui/gui";

import "../utils/hideControls.sass";

/**
 *
 * @param {import("three").WebGLRenderer} renderer
 */
export default async function (renderer) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  renderer.autoClear = false;

  const multitouch = new MultitouchInput(renderer);

  const gui = new GuiManager(renderer, multitouch);

  const scene = new Scene();
  //const { touch } = touchGen(renderer);
  scene.background = new Color("#fffbf9");
  const camera = new PerspectiveCamera();
  //const gui = new GUI(renderer, touch);
  camera.position.x = 0;
  camera.position.y = window.innerHeight > window.innerWidth ? -20 : -10;
  camera.position.z = window.innerHeight > window.innerWidth ? 20 : 10;
  camera.rotation.x = Math.PI / 4;

  let draggingCamera = false;

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

  gui.addInput(
    new StickInput(gui, {
      anchor: "bottomRight",
      position: new Vector2(-150, 150),
    })
  );

  gui.addInput(
    new StickInput(gui, {
      anchor: "bottomLeft",
      position: new Vector2(150, 150),
    })
  );

  //scene.add(plane);

  const box = generateBox(new Vector3(0, 0, 0.55), new Vector3(1, 1, 1), "red");

  scene.add(box);

  //const input = new Input2D(gui, 200);
  //input.position.x = 0;
  //input.position.y = -600;
  //gui.addInput(input);

  /*scene.add(
    new Mesh(
      new RingGeometry(3, 3.1, 32, 4),
      new MeshStandardMaterial({ color: "red" })
    )
  );*/

  /*touch.onDown.push(() => {
    draggingCamera = true;
    return true;
  });*/

  /*touch.onUp.push(() => {
    draggingCamera = false;
  });*/

  const gradientBoxGeometry = new RingGeometry(3, 3.1, 32, 4);
  gradientBoxGeometry.computeBoundingBox();
  const gMat = gradientMaterial("red", "blue", gradientBoxGeometry);

  scene.add(new Mesh(gradientBoxGeometry, gMat));

  function update(deltaTime, time) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixPersp(renderer, camera);
      gui.fixCamera();
    }
    fixCamera(renderer, camera);
    camera.position.y = window.innerHeight > window.innerWidth ? -20 : -10;
    camera.position.z = window.innerHeight > window.innerWidth ? 20 : 10;
    /*if (draggingCamera && touch.dragging) {
      cameraBase.rotation.z -= touch.movement.x * 0.001;
      cameraArm.rotation.x -= touch.movement.y * 0.001;
      cameraArm.rotation.x = Math.min(
        Math.max(-Math.PI / 8, cameraArm.rotation.x),
        Math.PI / 8
      );
    }*/
    //box.position.x += input.value.x * 0.1;
    //box.position.y += input.value.y * 0.1;

    //console.log(input.value);

    renderer.clear();
    renderer.render(scene, camera);
    gui.render();
  }

  return { scene, camera, update };
}
