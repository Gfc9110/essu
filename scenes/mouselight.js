import {
  AmbientLight,
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  OrthographicCamera,
  PointLight,
  Scene,
  Vector3,
} from "three";
import arrayGrid from "../utils/arrayGrid";
import { generateBox, generateSphere } from "../utils/meshes/primitives";
import mouseGen from "../utils/mouse";
import fixCameraAspect from "../utils/responsiveOrthographic";

export default async function (renderer) {
  const canvas = renderer.domElement;
  const scene = new Scene();
  const mouse = mouseGen(renderer);
  scene.background = new Color("white");
  const camera = new OrthographicCamera();
  camera.zoom = 0.7;
  camera.near = 200;
  camera.far = 1800;
  camera.position.z = 1000;
  camera.rotation.x = 0;
  const light = new PointLight();
  light.position.x = 0;
  light.position.y = 0;
  light.position.z = 10;
  light.distance = 150;
  scene.add(light);
  const lightSphere = generateSphere(new Vector3(0, 0, 0), 6, "white");
  light.add(lightSphere);
  lightSphere.position.z = 20;
  lightSphere.position.y = 20;

  const baseCube = generateBox(
    new Vector3(0, 0, -45),
    new Vector3(10, 10, 100),
    "#888"
  );

  baseCube.rotation.z = Math.PI / 4;
  baseCube.rotation.x = -Math.PI / 4;

  const cubeGrid1 = arrayGrid(
    baseCube,
    10 * Math.sqrt(2),
    20,
    10,
    20 * Math.sqrt(2)
  );
  baseCube.position.x += 5 * Math.sqrt(2);
  baseCube.position.y += 10 * Math.sqrt(2);
  const cubeGrid2 = arrayGrid(
    baseCube,
    10 * Math.sqrt(2),
    20,
    10,
    20 * Math.sqrt(2)
  );

  const cubeGrid = new Group();
  cubeGrid.add(cubeGrid1, cubeGrid2);
  cubeGrid.position.x = -100 * Math.sqrt(2);
  cubeGrid.position.y = -125;
  scene.add(cubeGrid);

  const cameraCenter = new Group();
  cameraCenter.add(camera);
  scene.add(cameraCenter);

  function update(delta, time) {
    //cameraCenter.rotation.z += delta * 0.0001;
    const reachX =
      (mouse.position.x / canvas.clientWidth - 0.5) *
      150 *
      (canvas.clientWidth / canvas.clientHeight);

    const reachY = -(mouse.position.y / canvas.clientHeight - 0.5) * 150;
    light.position.x += (reachX - light.position.x) * 0.002;
    light.position.y += (reachY - light.position.y) * 0.002;
    /*light.position.x =
      (mouse.position.x / canvas.clientWidth - 0.5) *
      200 *
      (canvas.clientWidth / canvas.clientHeight);*/
    /*light.position.y =
      (-(mouse.position.y / canvas.clientHeight - 0.5) * 200 -
        light.position.y) *
      0.5;*/
    fixCameraAspect(renderer, camera, 100);
  }
  return { scene, camera, update };
}
