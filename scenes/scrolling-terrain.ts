import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector4,
  WebGLRenderer,
} from "three";
import controlsUi from "../utils/controls-ui";
import {
  fixPersp,
  resizeRendererToDisplaySize,
} from "../utils/responsiveCamera";
import trianglePlane from "../utils/geometries/triangle-plane";
import layeredNoise from "../utils/samplers/layeredNoise";
import touchGen from "../utils/touch";

export default function (renderer: WebGLRenderer) {
  document.title = " - DRS Wallpaper";
  // Scene Setup
  const scene = new Scene();
  const camera = new PerspectiveCamera();
  //const gui = new GUI(renderer, touch);
  camera.position.x = 0;
  camera.position.y = window.innerHeight > window.innerWidth ? -20 : -10;
  camera.position.z = window.innerHeight > window.innerWidth ? 20 : 10;
  camera.rotation.x = Math.PI / 4;

  let draggingCamera = false;
  camera.position.z = 10;
  const { touch } = touchGen(renderer);

  const controls: {
    planeSizeX: number;
    planeSizeY: number;
    planeDivisionX: number;
    planeDivisionY: number;
    lightPositionX: number;
    lightPositionY: number;
    lightPositionZ: number;
    lightColor: string;
    lightIntensity: number;
    backgroundColor: string;
    terrainColor: string;
    cameraRotationZ: number;
    cameraRotationX: number;
    noiseScale: number;
  } = controlsUi({
    planeSizeX: {
      label: "Larghezza Terreno",
      type: "range",
      min: "1",
      max: "30",
      step: "0.1",
      startValue: "7",
    },
    planeSizeY: {
      label: "Lunghezza Terreno",
      type: "range",
      min: "1",
      max: "30",
      step: "0.1",
      startValue: "5",
    },
    planeDivisionX: {
      type: "range",
      label: "Suddivisione X",
      min: "1",
      max: "100",
      step: "1",
      startValue: "7",
    },
    planeDivisionY: {
      type: "range",
      label: "Suddivisione Y",
      min: "1",
      max: "100",
      step: "1",
      startValue: "5",
    },
    lightPositionX: {
      label: "Luce X",
      type: "range",
      min: "-10",
      max: "10",
      step: "0.1",
      startValue: "-2",
    },
    lightPositionY: {
      label: "Luce Y",
      type: "range",
      min: "-10",
      max: "10",
      step: "0.1",
      startValue: "-2",
    },
    lightPositionZ: {
      label: "Luce Z",
      type: "range",
      min: "-10",
      max: "10",
      step: "0.1",
      startValue: "3",
    },
    lightColor: {
      label: "Colore Illuminazione",
      type: "color",
      startValue: "#ffffff",
    },
    lightIntensity: {
      label: "Intensità Illuminazione",
      type: "range",
      min: "0",
      max: "10",
      step: "0.1",
      startValue: "1",
    },
    backgroundColor: {
      label: "Colore Sfondo",
      type: "color",
      startValue: "#3355aa",
    },
    terrainColor: {
      label: "Colore Terreno",
      type: "color",
      startValue: "#777700",
    },
    cameraRotationZ: {
      type: "range",
      label: "Rotazione Vista",
      startValue: "0",
      min: "-3.14",
      max: "3.14",
      step: "0.01",
    },
    cameraRotationX: {
      type: "range",
      label: "Inclinazione Vista",
      startValue: "0",
      min: "-0.39",
      max: "0.39",
      step: "0.01",
    },
    noiseScale: {
      label: "Scala Noise",
      type: "range",
      min: "0.1",
      max: "10",
      step: "0.1",
      startValue: "1",
    },
  });

  const planeGeometry = trianglePlane(
    controls.planeSizeX / controls.planeDivisionX,
    controls.planeDivisionX,
    controls.planeDivisionY,
    ({ x, y }) => {
      return layeredNoise(new Vector4(x, y, 0, 0), [
        { scale: 10, amplitude: 1 },
      ]);
    },
    controls.planeSizeY / controls.planeDivisionY
  );

  const sun = new DirectionalLight(
    controls.lightColor,
    controls.lightIntensity
  );

  const planeMesh = new Mesh(
    planeGeometry,
    new MeshStandardMaterial({ color: controls.terrainColor })
  );

  scene.add(planeMesh, sun, new AmbientLight("white", 0.3));

  const cameraArm = new Group();
  cameraArm.add(camera);

  const cameraBase = new Group();
  cameraBase.add(cameraArm);

  scene.add(cameraBase);

  touch.onDown.push(() => {
    draggingCamera = true;
    return true;
  });

  touch.onUp.push(() => {
    draggingCamera = false;
  });

  let lastCameraRotationZ = controls.cameraRotationZ;
  let lastCameraRotationX = controls.cameraRotationX;

  renderer.domElement.addEventListener("wheel", ({ deltaY }) => {
    camera.translateZ(deltaY * 0.01);
  });

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixPersp(renderer, camera);
      camera.updateProjectionMatrix();
    }
    planeMesh.geometry.dispose();
    planeMesh.geometry = trianglePlane(
      controls.planeSizeX / controls.planeDivisionX,
      controls.planeDivisionX,
      controls.planeDivisionY,
      ({ x, y }) => {
        return layeredNoise(new Vector4(x, y, 0, 0), [
          { scale: 100 * controls.noiseScale, amplitude: 1 },
          { scale: 10 * controls.noiseScale, amplitude: 0.1 },
          { scale: 1 * controls.noiseScale, amplitude: 0.01 },
        ]);
      },
      controls.planeSizeY / controls.planeDivisionY
    );
    planeMesh.position.x = -controls.planeSizeX / 2;
    planeMesh.position.y = -controls.planeSizeY / 2;
    sun.color.set(controls.lightColor);
    sun.intensity = controls.lightIntensity;

    sun.position.set(
      controls.lightPositionX,
      controls.lightPositionY,
      controls.lightPositionZ
    );
    scene.background
      ? (scene.background as Color).set(controls.backgroundColor)
      : (scene.background = new Color(controls.backgroundColor));
    if (lastCameraRotationZ !== controls.cameraRotationZ) {
      cameraBase.rotation.z = controls.cameraRotationZ;
      lastCameraRotationZ = controls.cameraRotationZ;
    }
    if (lastCameraRotationX !== controls.cameraRotationX) {
      cameraArm.rotation.x = controls.cameraRotationX;
      lastCameraRotationX = controls.cameraRotationX;
    }
    if (draggingCamera && touch.dragging) {
      cameraBase.rotation.z -= touch.movement.x * 0.01;
      cameraArm.rotation.x -= touch.movement.y * 0.01;
    }
    cameraArm.rotation.x = Math.min(
      Math.max(-Math.PI / 8, cameraArm.rotation.x),
      Math.PI / 8
    );
    planeMesh.material.color.set(controls.terrainColor);

    renderer.render(scene, camera);
  }

  return { scene, camera, update };
}
