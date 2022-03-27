import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MultiplyBlending,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Uniform,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";
import GPUComputationRenderer from "../lib/GPUComputationRenderer";
import controlsUi from "../utils/controls-ui";
import { fixOrtho, resizeRendererToDisplaySize } from "../utils/responsiveCamera";
import Stats from "../utils/stats";

// @ts-ignore
import computeShader from "../utils/shaders/refraction/computeShader.glsl?raw";

// @ts-ignore
import vertexShader from "../utils/shaders/refraction/vertexShader.glsl?raw";

// @ts-ignore
import fragmentShader from "../utils/shaders/refraction/fragmentShader.glsl?raw";

// @ts-ignore
import visualizerFragmentShader from "../utils/shaders/refraction/visualizerFragmentShader.glsl?raw";

// array di funzioni che definiscono forma , dati: ax^0 + bx^1 + cx^2, inverted?
// rifrazione ai confini delle particelle
// dati particelle: posX, posY, fract -> angle | floor = speed, wavelength
// use shader function "refract"

export default function (renderer: WebGLRenderer) {
  const scene = new Scene();
  scene.background = new Color("black");
  const camera = new OrthographicCamera();
  camera.position.z = 11;
  camera.far = 21;
  camera.near = 1;

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

  const center = new Vector2(0, -300);

  const spacingX = 200;
  const spacingY = 10;
  const offsetX = spacingX / (controls.sqCount + 1);
  const offsetY = spacingY / (controls.sqCount + 1);

  const functions = [new Vector4(100, 1, 0, 0), new Vector4(300, 1, 0, 1)];

  const functionsCount = functions.length;
  for (let i = functions.length; i < 10; i++) {
    functions.push(new Vector4());
  }

  const functionsVisualizer = new Mesh(
    new PlaneGeometry(document.body.clientWidth, document.body.clientHeight),
    new ShaderMaterial({ fragmentShader: visualizerFragmentShader })
  );

  const references: number[] = [];
  for (let x = 0; x < controls.sqCount; x++) {
    for (let y = 0; y < controls.sqCount; y++) {
      let u = x / controls.sqCount;
      let v = y / controls.sqCount;
      references.push(u, v);
      const pI = (y * controls.sqCount + x) * 4;
      computeTexture.image.data[pI] = x * offsetX - spacingX / 2 + center.x;
      computeTexture.image.data[pI + 1] = y * offsetY - spacingY / 2 + center.y;
      const r = Math.random();
      computeTexture.image.data[pI + 2] = 4.25;
      //console.log((computeTexture.image.data[pI + 2] % 1) * Math.PI * 2);
      computeTexture.image.data[pI + 3] = r;
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
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: AdditiveBlending,
    })
  );

  //points.material.uniforms.functions = new Uniform(functions);

  const computeVariable = gpuCompute.addVariable("texturePosVel", computeShader, computeTexture);

  computeVariable.material.uniforms.functions = new Uniform(functions);
  computeVariable.material.uniforms.functionsCount = new Uniform(functionsCount);

  functionsVisualizer.material.uniforms.functions = new Uniform(functions);
  functionsVisualizer.material.uniforms.width = new Uniform(document.body.clientWidth);
  functionsVisualizer.material.uniforms.height = new Uniform(document.body.clientHeight);
  functionsVisualizer.material.uniforms.functionsCount = new Uniform(functionsCount);

  gpuCompute.setVariableDependencies("texturePosVel", ["texturePosVel"]);

  gpuCompute.init();

  gpuCompute.compute();

  points.material.uniforms.texturePosVel.value =
    gpuCompute.getCurrentRenderTarget("texturePosVel").texture;

  points.material.uniforms.FIRST.value = false;

  scene.add(new AmbientLight("white", 1), points, functionsVisualizer);

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixOrtho(renderer, camera, document.body.clientHeight);
      functionsVisualizer.geometry = new PlaneGeometry(
        document.body.clientWidth,
        document.body.clientHeight
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
