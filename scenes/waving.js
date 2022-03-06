import fixCamera from "../utils/responsiveOrthographic.js";
import mouseGenerator from "../utils/mouse.js";
import * as THREE from "three";
import { generateBox, generateSphere } from "../utils/meshes/primitives.js";
import {
  Vector3,
  PerspectiveCamera,
  OrthographicCamera,
  Scene,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  PointLight,
} from "three";
import arrayGrid from "../utils/arrayGrid.js";
import trianglePlane from "../utils/geometries/triangle-plane.js";
import wave from "../utils/samplers/wave.js";
import noise from "../utils/samplers/noise.js";

function terrainSample(p, noiseScale = 1) {
  return (
    noise.sample({
      x: p.x / noiseScale,
      y: p.y / noiseScale,
      z: p.z / noiseScale,
    }) * amplitude
  );
}

export default async (renderer) => {
  document.title = "DRS | Waving";
  const mouse = mouseGenerator();
  const scene = new Scene();

  scene.background = new Color("#222");

  let tp = trianglePlane(2, 100, 100, (p) => noise.sample(p, 10, 3));

  const mesh = new Mesh(
    tp,
    new MeshPhysicalMaterial({
      color: "#77aadd",
      roughness: 0,
      transparent: true,
      opacity: 0.7,
    })
  );

  mesh.position.x = -100;
  mesh.position.y = -100;

  scene.add(mesh);

  const light = new DirectionalLight("white");
  light.position.x = 1;
  light.position.y = 1;
  light.position.z = 1;
  //scene.add(light);

  const pointLight = new PointLight("white");
  pointLight.position.z = 20;
  scene.add(pointLight);

  scene.add(generateSphere(new Vector3(0, 0, 10), 5, "white"));

  const canvas = renderer.domElement;
  const camera = new OrthographicCamera();
  const cameraRig = new Group();
  cameraRig.name = "CameraRig";
  cameraRig.add(camera);
  camera.zoom = 0.5;
  camera.near = 200;
  camera.far = 1800;
  camera.position.z = 1000;

  cameraRig.rotation.x = 0.8;

  const cameraTurntable = new Group();
  cameraTurntable.add(cameraRig);
  scene.add(cameraTurntable);
  const update = (deltaTime, time) => {
    cameraRig.rotation.x = Math.min(
      Math.max(
        Math.PI / 4 + (mouse.position.y - canvas.height / 2) * -0.002,
        0.3
      ),
      1.3
    );

    cameraTurntable.rotation.z = (mouse.position.x - canvas.width / 2) * -0.003;

    tp = trianglePlane(
      2,
      100,
      100,
      (p) =>
        noise.sample({ ...p, z: time / 300 }, 20, 2) +
        noise.sample({ ...p, z: time / 3000 }, 0.5, 0.3)
    );
    mesh.geometry.dispose();
    mesh.geometry = tp;

    fixCamera(renderer, camera, 100);
  };
  return { scene, camera, update };
};
