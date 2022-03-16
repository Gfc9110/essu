import {
  AmbientLight,
  Color,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer,
} from "three";
import GPUComputationRenderer from "../lib/GPUComputationRenderer";
import { resizeRendererToDisplaySize, fixOrtho } from "../utils/responsiveCamera";
import Stats from "../utils/stats";

// @ts-ignore
import computeShader from "../utils/shaders/gameOfLife/computeShader.glsl?raw";
import MultitouchInput from "../utils/input/multitouch";

export default function (renderer: WebGLRenderer) {
  const stats = Stats();
  document.body.appendChild(stats.dom);

  const input = new MultitouchInput(renderer);

  const scene = new Scene();
  scene.background = new Color("black");
  const camera = new OrthographicCamera();
  camera.position.z = 2;
  camera.far = 3;
  camera.near = 1;

  let WIDTH = document.body.clientWidth;
  let HEIGHT = document.body.clientHeight;

  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      if (x != 0 || y != 0) {
        console.log([x, y]);
      }
    }
  }

  const planeMesh = new Mesh(
    new PlaneGeometry(WIDTH / HEIGHT, WIDTH / HEIGHT),
    new MeshBasicMaterial()
  );

  scene.add(new AmbientLight("white", 0), planeMesh);

  const lifeResolution = 4096;

  const gpuCompute = new GPUComputationRenderer(lifeResolution, lifeResolution, renderer);

  const initialStateTexture = gpuCompute.createTexture();

  const stateVar = gpuCompute.addVariable("state", computeShader, initialStateTexture);

  //stateVar.material.uniforms.WIDTH = { value: WIDTH };
  //stateVar.material.uniforms.HEIGHT = { value: HEIGHT };
  stateVar.material.uniforms.STEP = { value: 0 };
  stateVar.material.uniforms.RAND = { value: (Math.random() - 0.5) * 0.1 };

  gpuCompute.setVariableDependencies("state", ["state"]);

  gpuCompute.init();

  gpuCompute.compute();

  /*input.onDownListeners.push(() => {
    gpuCompute.compute();
    return false;
  });*/

  input.onMoveListeners.push((p) => {
    if (p.isDown) {
      camera.translateX((-p.movement.x * 0.001) / camera.zoom);
      camera.translateY((p.movement.y * 0.001) / camera.zoom);
    }
    return true;
  });

  window.addEventListener("wheel", ({ deltaY }) => {
    camera.zoom *= 1 - deltaY * 0.0003;
    camera.updateProjectionMatrix();
  });

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixOrtho(renderer, camera, 1);
    }
    stateVar.material.uniforms.STEP.value++;
    gpuCompute.compute();
    planeMesh.material.map = gpuCompute.getCurrentRenderTarget("state").texture;
    renderer.render(scene, camera);
    stats.update();
  }

  return { camera, scene, update };
}
