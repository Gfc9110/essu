import fixCamera from "../utils/responsiveOrthographic.js";
import mouseGenerator from "../utils/mouse.js";
import * as THREE from "three";
import { generateBox } from "../utils/meshes/primitives.js";
import {
  Vector3,
  PerspectiveCamera,
  OrthographicCamera,
  Scene,
  Color,
  DirectionalLight,
  Group,
} from "three";
import arrayGrid from "../utils/arrayGrid.js";

export default async (renderer) => {
  const mouse = mouseGenerator();
  const scene = new Scene();

  scene.background = new Color("#ffd");
  const testBoxMesh = generateBox(
    new Vector3(0, 0, 0),
    new Vector3(4, 4, 4),
    "red"
  );

  const cubeGrid = arrayGrid(testBoxMesh, 20, 20, 20);

  cubeGrid.position.x = -200;
  cubeGrid.position.y = -200;

  scene.add(cubeGrid);

  const light = new DirectionalLight("white");
  light.position.x = 200;
  light.position.y = 100;
  light.position.z = 200;
  scene.add(light);

  const canvas = renderer.domElement;
  const camera = new OrthographicCamera();
  const cameraRig = new Group();
  cameraRig.name = "CameraRig";
  cameraRig.add(camera);
  camera.zoom = 0.5;
  camera.near = 200;
  camera.far = 1800;
  camera.position.z = 1000;

  const cameraTurntable = new Group();
  cameraTurntable.add(cameraRig);
  scene.add(cameraTurntable);
  const update = () => {
    cameraRig.rotation.x =
      Math.PI / 4 + (mouse.position.y - canvas.height / 2) * -0.0001;
    cameraTurntable.rotation.z =
      (mouse.position.x - canvas.width / 2) * -0.0001;

    fixCamera(renderer, camera, 100);
  };
  return { scene, camera, update };
};
