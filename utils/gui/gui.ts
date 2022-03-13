import {
  AmbientLight,
  CircleGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import MultitouchInput, { Pointer, TouchListener } from "../input/multitouch";
import { generateCircle } from "../meshes/primitives";

export default class GuiManager {
  inputs: GuiInput[];
  camera: OrthographicCamera;
  scene: Scene;
  constructor(private renderer: WebGLRenderer, private input: MultitouchInput) {
    this.inputs = [];
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
    input.onDownListeners.push(this.onDownListener.bind(this));
    input.onMoveListeners.push(this.onMoveListener.bind(this));
    input.onUpListeners.push(this.onUpListener.bind(this));
  }
  addInput(input: GuiInput) {
    this.scene.add(input);
    this.inputs.push(input);
  }
  onDownListener(pointer: Pointer) {
    //console.log(pointer);
    const intersections = this.input
      .getIntersections(this.camera, this.scene, pointer)
      .filter((i) => i.object.userData.receiveTouch);
    //console.log(intersections);
    for (let input of this.inputs) {
      if (
        input.onDown(
          pointer,
          !!intersections.find((i) => i.object.userData.inputId === input.uuid)
        )
      )
        return true;
    }
    return false;
  }
  onMoveListener(pointer: Pointer) {
    //console.log(pointer);
    const intersections = this.input
      .getIntersections(this.camera, this.scene, pointer)
      .filter((i) => i.object.userData.receiveTouch);
    //console.log(intersections);
    for (let input of this.inputs) {
      if (
        input.onMove(
          pointer,
          !!intersections.find((i) => i.object.userData.inputId === input.uuid)
        )
      )
        return true;
    }
    return false;
  }
  onUpListener(pointer: Pointer) {
    //console.log(pointer);
    const intersections = this.input
      .getIntersections(this.camera, this.scene, pointer)
      .filter((i) => i.object.userData.receiveTouch);
    //console.log(intersections);
    for (let input of this.inputs) {
      if (
        input.onUp(
          pointer,
          !!intersections.find((i) => i.object.userData.inputId === input.uuid)
        )
      )
        return true;
    }
    return false;
  }
  screenToWorld(position: Vector2) {
    const pos = position
      .clone()
      .sub(
        new Vector2(
          this.renderer.domElement.width / 2,
          this.renderer.domElement.height / 2
        )
      );
    pos.y = -pos.y;
    return pos;
  }
  worldTouch(p: Pointer) {
    return this.screenToWorld(p.position);
  }
}

export class GuiInput extends Group {
  constructor(public gui: GuiManager) {
    super();
  }
  onDown(p: Pointer, inside: boolean): boolean {
    //console.log(p, inside);
    return false;
  }
  onMove(p: Pointer, inside: boolean): boolean {
    //console.log(p, inside);
    return false;
  }
  onUp(p: Pointer, inside: boolean): boolean {
    //console.log(p, inside);
    return false;
  }
}

export class StickInput extends GuiInput {
  value: Vector2;
  base: Mesh<CircleGeometry, MeshStandardMaterial>;
  handle: Mesh<CircleGeometry, MeshStandardMaterial>;
  dragging: boolean = false;
  pointer: Pointer;
  constructor(
    gui: GuiManager,
    pos: Vector2 = null,
    private baseRadius = 100,
    private handleRadius = null
  ) {
    super(gui);
    if (pos) {
      this.position.set(pos.x, pos.y, 0);
    }
    this.value = new Vector2(0, 0);
    this.base = generateCircle(
      new Vector3(0, 0, 0),
      this.baseRadius,
      "black",
      32
    );
    this.base.material.transparent = true;
    this.base.material.opacity = 0.5;

    this.handle = generateCircle(
      new Vector3(0, 0, 0),
      this.handleRadius || this.baseRadius * 0.45,
      "blue",
      32
    );
    this.handle.userData.receiveTouch = true;
    this.handle.userData.inputId = this.uuid;
    this.handle.material.transparent = true;
    this.handle.material.opacity = 0.7;
    this.add(this.base, this.handle);
  }
  onDown(p: Pointer, inside: boolean) {
    if (!this.pointer && inside) {
      this.pointer = p;
      return true;
    }
    return false;
  }
  onMove(p: Pointer, inside: boolean) {
    if (this.pointer && this.pointer.identifier == p.identifier) {
      const reach = this.gui
        .worldTouch(this.pointer)
        .sub(new Vector2(this.position.x, this.position.y));
      reach.clampLength(0, this.baseRadius);
      this.handle.position.set(reach.x, reach.y, 0);
      this.value.x = reach.x / this.baseRadius;
      this.value.y = reach.y / this.baseRadius;
      return true;
    }
    return false;
  }
  onUp(p: Pointer, inside) {
    if (this.pointer && this.pointer.identifier == p.identifier) {
      this.pointer = null;
      this.value.set(0, 0);
      this.handle.position.set(0, 0, 0);
      return true;
    }
    return false;
  }
}
