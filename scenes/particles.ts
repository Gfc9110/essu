import { throws } from "assert";
import {
  AmbientLight,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  OrthographicCamera,
  Points,
  PointsMaterial,
  Scene,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import MultitouchInput from "../utils/input/multitouch";
import { generateCircle } from "../utils/meshes/primitives";
import {
  resizeRendererToDisplaySize,
  fixPersp,
  fixOrtho,
} from "../utils/responsiveCamera";
import randomOnCircle from "../utils/vector/randomOnCircle";

export default function (renderer: WebGLRenderer) {
  document.title = " - DRS Wallpaper";
  renderer.autoClear = false;
  renderer.setClearColor("black");
  renderer.clear();
  renderer.setClearColor("black", 0.9);
  // Scene Setup
  const scene = new Scene();
  scene.background = new Color("black");
  const camera = new OrthographicCamera();
  camera.position.z = 11;
  camera.far = 21;
  camera.near = 1;

  const touch = new MultitouchInput(renderer);

  const particles: Particle[] = [];

  for (let i = 0; i < 1000; i++) {
    particles.push(
      new Particle({
        position: new Vector2(
          Math.random() * document.body.clientWidth -
            0.5 * document.body.clientWidth,
          Math.random() * document.body.clientHeight -
            0.5 * document.body.clientHeight
        ),
        velocity: randomOnCircle(1 + Math.random() * 0.1).multiplyScalar(0.001),
        color: "white",
      })
    );
  }

  scene.add(new AmbientLight("white", 1));

  scene.add(...particles);

  //scene.add(generateCircle(new Vector3(300, 0, 0), 100, "red"));

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixOrtho(renderer, camera, document.body.clientHeight);
    }
    scene.userData.deltaTime = deltaTime;
    if (touch.pointers[0]) {
      const worldPosition = touch.pointers[0].position
        .clone()
        .add(
          new Vector2(
            -document.body.clientWidth / 2,
            -document.body.clientHeight / 2
          )
        )
        .multiply(new Vector2(1, -1));
      particles.forEach((p) => p.update(deltaTime, time, worldPosition));
    } else {
      particles.forEach((p) => p.update(deltaTime, time));
    }
    //renderer.clear();
    renderer.render(scene, camera);
  }

  return { scene, camera, update };
}

const pointGeometry = new BufferGeometry();
pointGeometry.setAttribute(
  "position",
  new Float32BufferAttribute([0, 0, 0], 3)
);

interface ParticleOptions {
  position?: Vector2;
  velocity?: Vector2;
  color?: string;
}

class Particle extends Points {
  velocity: Vector2;
  constructor({ position, velocity, color }: ParticleOptions = {}) {
    let material = new PointsMaterial({
      color: color || "white",
      size: 2,
      sizeAttenuation: true,
    });
    super(pointGeometry, material);
    this.material = material;
    if (position) {
      this.position.set(position.x, position.y, 0);
    }
    this.velocity = velocity?.clone() || new Vector2();
  }
  update(deltaTime: number, time: number, mousPos?: Vector2) {
    this.velocity.rotateAround(
      new Vector2(0, 0),
      (Math.random() - 0.5) * (Math.PI / 32)
    );
    /*this.velocity.multiplyScalar(1 + (Math.random() - 0.5) * 0.01);*/
    if (mousPos) {
      const offset = mousPos
        .clone()
        .sub(new Vector2(this.position.x, this.position.y));
      let sqrDistance = offset.lengthSq() / 100;
      sqrDistance = Math.max(0.1, sqrDistance);
      //console.log(mousPos, this.position);
      this.velocity.add(
        offset
          .normalize()
          .multiplyScalar((deltaTime * deltaTime * 0.0005) / sqrDistance)
      );
      this.velocity.clampLength(0, 0.5);
    }
    this.velocity;
    this.translateX(this.velocity.x * deltaTime);
    this.translateY(this.velocity.y * deltaTime);
    if (this.position.x > document.body.clientWidth / 2) {
      this.velocity.x *= -1;
    }
    if (this.position.x < -document.body.clientWidth / 2) {
      this.velocity.x *= -1;
    }
    if (this.position.y > document.body.clientHeight / 2) {
      this.velocity.y *= -1;
    }
    if (this.position.y < -document.body.clientHeight / 2) {
      this.velocity.y *= -1;
    }
  }
}
