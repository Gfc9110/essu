import {
  AmbientLight,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  TextureLoader,
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

// @ts-ignore
import image from "../assets/images/gpuParticles/resilience.jpg";

export default function (renderer: WebGLRenderer) {
  const scene = new Scene();
  scene.background = new Color("black");
  const camera = new OrthographicCamera();
  camera.position.z = 11;
  camera.far = 21;
  camera.near = 1;

  const imageTexture = new TextureLoader().load(image);

  const controls: any = controlsUi({
    sqCount: {
      label: "Radice Quantità Particelle",
      type: "range",
      min: "1.0",
      max: "4096",
      step: "1",
      startValue: "1024",
    },
  });

  const stats = Stats();
  document.body.appendChild(stats.dom);
  const sqrtParticleCount = controls.sqCount;

  const gpuCompute = new GPUComputationRenderer(sqrtParticleCount, sqrtParticleCount, renderer);

  const computeTexture = gpuCompute.createTexture();

  const spacingX = 300;
  const spacingY = 300;
  const offsetX = spacingX / (controls.sqCount + 1);
  const offsetY = spacingY / (controls.sqCount + 1);

  const references: number[] = [];
  for (let x = 0; x < controls.sqCount; x++) {
    for (let y = 0; y < controls.sqCount; y++) {
      let u = x / controls.sqCount;
      let v = y / controls.sqCount;
      references.push(u, v);
      const pI = (y * controls.sqCount + x) * 4;
      computeTexture.image.data[pI] = x * offsetX - spacingX / 2;
      computeTexture.image.data[pI + 1] = y * offsetY - spacingY / 2;
      computeTexture.image.data[pI + 2] = 0;
      computeTexture.image.data[pI + 3] = 0;
    }
  }

  const pointsGeometry = new BufferGeometry();
  const positions: number[] = [];
  for (let i = 0; i < sqrtParticleCount * sqrtParticleCount; i++) {
    positions.push(0, 0, 0);
  }
  pointsGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  pointsGeometry.setAttribute("reference", new Float32BufferAttribute(references, 2));

  const points = new Points(
    pointsGeometry,
    new ShaderMaterial({
      uniforms: {
        texturePosVel: { value: null },
        FIRST: { value: true },
        image: { value: imageTexture },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
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

  gpuCompute.compute();

  points.material.uniforms.FIRST.value = false;

  const touch = new MultitouchInput(renderer);

  scene.add(new AmbientLight("white", 1), points);

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixOrtho(renderer, camera, document.body.clientHeight);
      computeVariable.material.uniforms.minX = { value: -document.body.clientWidth / 2 };
      computeVariable.material.uniforms.maxX = { value: document.body.clientWidth / 2 };
      computeVariable.material.uniforms.minY = { value: -document.body.clientHeight / 2 };
      computeVariable.material.uniforms.maxY = { value: document.body.clientHeight / 2 };
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
