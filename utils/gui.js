import {
  AmbientLight,
  Color,
  Group,
  Object3D,
  OrthographicCamera,
  Scene,
  Vector3,
} from "three";
import { generateBox, generateCircle } from "./meshes/primitives";

export default class GUI {
  constructor(renderer, touch) {
    this.inputs = [];
    this.touch = touch;
    this.renderer = renderer;
    this.camera = new OrthographicCamera();
    this.scene = new Scene();
    this.scene.add(new AmbientLight("white", 1));
    this.scene.background = null;
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 2;
    this.camera.far = 3;
    this.camera.near = 1;

    const input = new Input2D();
    input.position.x = -200;
    input.position.y = -200;
    this.addInput(input);
    touch.onDown.push(this.onDown.bind(this));
    touch.onMove.push(this.onMove.bind(this));
    touch.onUp.push(this.onUp.bind(this));
  }
  /**
   *
   * @param {Input} input
   */
  addInput(input) {
    this.scene.add(input);
    this.inputs.push(input);
  }
  onDown() {
    let result = false;
    const intersections = this.touch
      .getIntersections(this.camera, this.scene)
      .filter((i) => i.object.userData.receiveTouch);

    this.inputs.forEach((i) =>
      i.onDown(
        (result = !!intersections.find(
          (intersection) => intersection.object.userData.inputId === i.uuid
        ))
      )
    );
    return result;
  }
  onMove() {
    let result = false;
    const intersections = this.touch
      .getIntersections(this.camera, this.scene)
      .filter((i) => i.object.userData.receiveTouch);

    this.inputs.forEach((i) =>
      i.onMove(
        (result = !!intersections.find(
          (intersection) => intersection.object.userData.inputId === i.uuid
        ))
      )
    );
    return result;
  }
  onUp() {
    let result = false;
    const intersections = this.touch
      .getIntersections(this.camera, this.scene)
      .filter((i) => i.object.userData.receiveTouch);

    this.inputs.forEach((i) =>
      i.onUp(
        (result = !!intersections.find(
          (intersection) => intersection.object.userData.inputId === i.uuid
        ))
      )
    );
    return result;
  }
}

class Input extends Group {
  onDown(inside) {}
  onMove(inside) {}
  onUp(inside) {}
}

class Input2D extends Input {
  constructor() {
    super();
    this.base = generateCircle(new Vector3(0, 0, 0), 100, "black", 32);
    this.base.material.transparent = true;
    this.base.material.opacity = 0.5;

    this.handle = generateCircle(new Vector3(0, 0, 0), 45, "white", 32);
    this.handle.userData.receiveTouch = true;
    this.handle.userData.inputId = this.uuid;
    this.handle.material.transparent = true;
    this.handle.material.opacity = 0.7;

    this.dragging = false;

    this.add(this.base, this.handle);
  }
  onDown(inside) {
    console.log("down", inside);
    if (inside) {
      this.dragging = true;
    }
  }
  onMove(inside) {
    if (this.dragging) {
      console.log(this.position);
    }
  }
  onUp(inside) {
    this.dragging = false;
  }
}
