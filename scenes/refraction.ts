import {
  AddEquation,
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Color,
  CustomBlending,
  DstAlphaFactor,
  Float32BufferAttribute,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MultiplyBlending,
  OneFactor,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SrcAlphaFactor,
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
import MultitouchInput, { Pointer } from "../utils/input/multitouch";

// array di funzioni che definiscono forma , dati: ax^0 + bx^1 + cx^2, inverted?
// rifrazione ai confini delle particelle
// dati particelle: posX, posY, fract -> angle | floor = speed, wavelength
// use shader function "refract"

export default function (renderer: WebGLRenderer) {
  let lightStartPoint = new Vector2(-100, 0);
  let lightEndPoint = new Vector2(0, -100);
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

  const input = new MultitouchInput(renderer);

  const center = new Vector2(-600, 25);

  const shapes: Vector4[][] = [];
  shapes.push([    
    //new Vector4(-50, 150, 0, 1),
    new Vector4(0, 80, 0, 1),
    //new Vector4(50, 150, 0, 1),
    new Vector4(100, -80, 0, 1),
    new Vector4(-100, -80, 0, 1),
  ]);
  //shapes.push([new Vector4(200, -100, 0, 1), new Vector4(-200, -100, 0, 1), new Vector4(0, -200, 0, 1)]);
  //shapes.push([new Vector4(300, -350, 0, 1), new Vector4(240, -250, 0, 1), new Vector4(360, -250, 0, 1)]);

  const spacingX = 900;
  const spacingY = 15;
  const offsetX = spacingX / (controls.sqCount + 1);
  const offsetY = spacingY / (controls.sqCount + 1);

  const shapePoints = shapes.reduce((prev, current, index) => {
    prev.push(...current, new Vector4(0, 0, 0, 0));
    return prev;
  }, []);

  const shapePointsLength = shapePoints.length;
  for (let i = shapePointsLength; i < 100; i++) {
    shapePoints.push(new Vector4(0, 0, 0, 0));
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
      computeTexture.image.data[pI + 2] = 6.0;
      //console.log((computeTexture.image.data[pI + 2] % 1) * Math.PI * 2);
      computeTexture.image.data[pI + 3] = -1;
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
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: SrcAlphaFactor,
      blendDst: DstAlphaFactor,
    })
  );

  //points.material.uniforms.functions = new Uniform(functions);

  const computeVariable = gpuCompute.addVariable("texturePosVel", computeShader, computeTexture);
  computeVariable.material.uniforms.lightStart = new Uniform(lightStartPoint);
  computeVariable.material.uniforms.lightEnd = new Uniform(lightEndPoint);
  computeVariable.material.uniforms.shapePoints = new Uniform(shapePoints);
  
  functionsVisualizer.material.uniforms.width = new Uniform(document.body.clientWidth);
  functionsVisualizer.material.uniforms.height = new Uniform(document.body.clientHeight);
  functionsVisualizer.material.uniforms.lightStart = new Uniform(lightStartPoint);
  functionsVisualizer.material.uniforms.lightEnd = new Uniform(lightEndPoint);
  functionsVisualizer.material.uniforms.shapePoints = new Uniform(shapePoints);

  gpuCompute.setVariableDependencies("texturePosVel", ["texturePosVel"]);

  gpuCompute.init();

  gpuCompute.compute();

  points.material.uniforms.texturePosVel.value =
    gpuCompute.getCurrentRenderTarget("texturePosVel").texture;

  points.material.uniforms.FIRST.value = false;

  scene.add(new AmbientLight("white", 1), points, functionsVisualizer);

  const mouseScale = new Vector2(1, -1);

  function screenToWorld(pos: Vector2) {
    return new Vector2(
      pos.x - document.body.clientWidth / 2,
      -(pos.y - document.body.clientHeight / 2)
    );
  }

  input.onMoveListeners.push((p) => {
    if (p.isDown) {
      //console.log(screenToWorld(p.position));
      let startDistance = lightStartPoint.clone().sub(screenToWorld(p.position)).lengthSq();
      let endDistance = lightEndPoint.clone().sub(screenToWorld(p.position)).lengthSq();
      startDistance <= endDistance
        ? lightStartPoint.add(p.movement.multiply(mouseScale))
        : lightEndPoint.add(p.movement.multiply(mouseScale));
      return true;
    }
    return false;
  });

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
