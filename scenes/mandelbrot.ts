import {
  AmbientLight,
  Color,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import MultitouchInput from "../utils/input/multitouch";
import { fixOrtho, resizeRendererToDisplaySize } from "../utils/responsiveCamera";

// @ts-ignore
import fragmentShader from "../utils/shaders/mandelbrot/fragmentShader.glsl?raw";
import Stats from "../utils/stats";

export default function (renderer: WebGLRenderer) {
  const scene = new Scene();
  scene.background = new Color("black");
  const camera = new OrthographicCamera();
  camera.position.z = 2;
  camera.far = 3;
  camera.near = 1;

  const input = new MultitouchInput(renderer);

  let WIDTH = document.body.clientWidth;
  let HEIGHT = document.body.clientHeight;

  const stats = Stats();

  document.body.appendChild(stats.domElement);

  const planeMesh = new Mesh(
    new PlaneGeometry(WIDTH / HEIGHT, 1),
    new ShaderMaterial({ fragmentShader })
  );

  const viewOffset = new Vector2(0, 0);

  input.onMoveListeners.push((p) => {
    if (p.isDown) {
      viewOffset.add(
        new Vector2(p.movement.x, -p.movement.y).multiplyScalar(
          planeMesh.material.uniforms.ZOOM.value
        )
      );
    }
    return false;
  });

  //planeMesh.material.uniforms.WIDTH = { value: WIDTH };
  //planeMesh.material.uniforms.HEIGHT = { value: HEIGHT };
  planeMesh.material.uniforms.OFFSET = { value: viewOffset };
  planeMesh.material.uniforms.SIZE = { value: new Vector2(WIDTH, HEIGHT) };
  planeMesh.material.uniforms.ZOOM = { value: 1 };

  window.addEventListener("wheel", ({ deltaY }) => {
    planeMesh.material.uniforms.ZOOM.value *= 1 + deltaY * 0.0001;
  });

  scene.add(new AmbientLight("white"), planeMesh);

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixOrtho(renderer, camera, 1);
      WIDTH = document.body.clientWidth;
      HEIGHT = document.body.clientHeight;
      planeMesh.geometry = new PlaneGeometry(WIDTH / HEIGHT, 1);
      //planeMesh.material.uniforms.WIDTH.value = WIDTH;
      //planeMesh.material.uniforms.HEIGHT.value = HEIGHT;
      planeMesh.material.uniforms.SIZE.value = new Vector2(WIDTH, HEIGHT);
    }

    renderer.render(scene, camera);
    stats.update();
  }

  return { camera, scene, update };
}
