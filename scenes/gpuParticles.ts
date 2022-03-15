import {
  AmbientLight,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  OrthographicCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";
import GPUComputationRenderer from "../lib/GPUComputationRenderer";
import MultitouchInput from "../utils/input/multitouch";
import { resizeRendererToDisplaySize, fixOrtho } from "../utils/responsiveCamera";

// @ts-ignore
import computeShader from "../utils/shaders/gpuParticles/computeShader.glsl?raw";

// @ts-ignore
import vertexShader from "../utils/shaders/gpuParticles/vertexShader.glsl?raw";

// @ts-ignore
import fragmentShader from "../utils/shaders/gpuParticles/fragmentShader.glsl?raw";
import Stats from "../utils/stats";
import controlsUi from "../utils/controls-ui";

export default function (renderer: WebGLRenderer) {
  const scene = new Scene();
  scene.background = new Color("black");
  const camera = new OrthographicCamera();
  camera.position.z = 11;
  camera.far = 21;
  camera.near = 1;

  const controls: any = controlsUi({
    sqParticleCount: {
      label: "Radice Quantità Particelle",
      type: "range",
      min: "1.0",
      max: "1024",
      step: "1",
      startValue: "1024"
    },
  });

  const stats = Stats();
  document.body.appendChild(stats.dom);
  const sqrtParticleCount = controls.sqParticleCount;

  const gpuCompute = new GPUComputationRenderer(sqrtParticleCount, sqrtParticleCount, renderer);

  const computeTexture = gpuCompute.createTexture();

  for (let i = 0; i < computeTexture.image.data.length; i += 4) {
    computeTexture.image.data[i] = Math.random() * 100 - 50; //posX
    computeTexture.image.data[i + 1] = Math.random() * 100 - 50; //posY
    computeTexture.image.data[i + 2] = Math.random() - 0.5; //velX
    computeTexture.image.data[i + 3] = Math.random() - 0.5; //velY
  }

  const pointsGeometry = new BufferGeometry();
  const positions: number[] = [];
  for (let i = 0; i < sqrtParticleCount * sqrtParticleCount; i++) {
    positions.push(0, 0, 0);
  }
  const references: number[] = [];
  for (let x = 0; x < sqrtParticleCount; x++) {
    for (let y = 0; y < sqrtParticleCount; y++) {
      references.push(x / sqrtParticleCount, y / sqrtParticleCount);
    }
  }
  pointsGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  pointsGeometry.setAttribute("reference", new Float32BufferAttribute(references, 2));

  const points = new Points(
    pointsGeometry,
    new ShaderMaterial({
      uniforms: { texturePosVel: { value: null } },
      vertexShader,
      fragmentShader,
    })
  );

  const computeVariable = gpuCompute.addVariable("texturePosVel", computeShader, computeTexture);
  computeVariable.material.uniforms.mouseData = { value: new Vector4(0, 0, 0, 0) };
  computeVariable.material.uniforms.minX = { value: -document.body.clientWidth / 2 };
  computeVariable.material.uniforms.maxX = { value: document.body.clientWidth / 2 };
  computeVariable.material.uniforms.minY = { value: -document.body.clientHeight / 2 };
  computeVariable.material.uniforms.maxY = { value: document.body.clientHeight / 2 };

  gpuCompute.setVariableDependencies("texturePosVel", ["texturePosVel"]);

  gpuCompute.init();

  const touch = new MultitouchInput(renderer);

  scene.add(new AmbientLight("white", 1), points);

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixOrtho(renderer, camera, document.body.clientHeight);
    }
    if (touch.pointers[0]) {
      computeVariable.material.uniforms.mouseData.value.set(
        touch.pointers[0].position.x - document.body.clientWidth / 2,
        -(touch.pointers[0].position.y - document.body.clientHeight / 2),
        touch.pointers[0].isDown ? touch.pointers[0].movement.x : 0,
        touch.pointers[0].isDown ? -touch.pointers[0].movement.y : 0
      );
    }
    gpuCompute.compute();
    points.material.uniforms.texturePosVel.value =
      gpuCompute.getCurrentRenderTarget("texturePosVel").texture;
    renderer.render(scene, camera);
    stats.update();
  }

  return { scene, camera, update };
}
