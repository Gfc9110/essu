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
import { fixOrtho } from "../responsiveCamera";

export default class GuiManager {
  inputs: GuiInput[];
  camera: OrthographicCamera;
  scene: Scene;
  topLeftAnchor: Group;
  topRightAnchor: Group;
  bottomLeftAnchor: Group;
  bottomRightAnchor: Group;
  pointerHelper: Mesh<CircleGeometry, MeshStandardMaterial>;
  constructor(private renderer: WebGLRenderer, private input: MultitouchInput) {
    this.inputs = [];
    this.renderer = renderer;
    this.camera = new OrthographicCamera();
    this.scene = new Scene();
    this.scene.name = "GuiScene";
    this.scene.add(new AmbientLight("white", 1));
    this.scene.background = null;
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 2;
    this.camera.far = 3;
    this.camera.near = 1;

    this.topLeftAnchor = new Group();
    this.topLeftAnchor.name = "TopLeftAnchor";
    this.topLeftAnchor.position.set(
      -this.renderer.domElement.width / 2,
      this.renderer.domElement.height / 2,
      0
    );

    this.topRightAnchor = new Group();
    this.topRightAnchor.name = "TopRightAnchor";
    this.topRightAnchor.position.set(
      this.renderer.domElement.width / 2,
      this.renderer.domElement.height / 2,
      0
    );

    this.bottomLeftAnchor = new Group();
    this.bottomLeftAnchor.name = "BottomLeftAnchor";
    this.bottomLeftAnchor.position.set(
      -this.renderer.domElement.width / 2,
      -this.renderer.domElement.height / 2,
      0
    );

    this.bottomRightAnchor = new Group();
    this.bottomRightAnchor.name = "BottomRightAnchor";
    this.bottomRightAnchor.position.set(
      this.renderer.domElement.width / 2,
      -this.renderer.domElement.height / 2,
      0
    );

    this.scene.add(
      this.topLeftAnchor,
      this.topRightAnchor,
      this.bottomLeftAnchor,
      this.bottomRightAnchor
    );

    this.pointerHelper = generateCircle(new Vector3(0, 0, 0), 50, "red");
    this.scene.add(this.pointerHelper);

    input.onDownListeners.push(this.onDownListener.bind(this));
    input.onMoveListeners.push(this.onMoveListener.bind(this));
    input.onUpListeners.push(this.onUpListener.bind(this));
  }
  addInput(input: GuiInput) {
    this.inputs.push(input);
  }
  onDownListener(pointer: Pointer) {
    const intersections = this.input
      .getIntersections(this.camera, this.scene, pointer)
      .filter((i) => i.object.userData.receiveTouch);
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
    const intersections = this.input
      .getIntersections(this.camera, this.scene, pointer)
      .filter((i) => i.object.userData.receiveTouch);
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
          document.body.clientWidth / 2,
          document.body.clientHeight / 2
        )
      );
    pos.y = -pos.y;
    this.pointerHelper.position.set(pos.x, pos.y, 0);
    return pos;
  }
  worldTouch(p: Pointer) {
    return this.screenToWorld(p.position);
  }
  fixCamera() {
    fixOrtho(this.renderer, this.camera, document.body.clientHeight);
    this.topLeftAnchor.position.set(
      (-document.body.clientWidth / 2) * 1,
      (document.body.clientHeight / 2) * 1,
      0
    );
    this.topLeftAnchor.scale.set(
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width
    );

    this.topRightAnchor.position.set(
      (document.body.clientWidth / 2) * 1,
      (document.body.clientHeight / 2) * 1,
      0
    );
    this.topRightAnchor.scale.set(
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width
    );

    this.bottomLeftAnchor.position.set(
      (-document.body.clientWidth / 2) * 1,
      (-document.body.clientHeight / 2) * 1,
      0
    );
    this.bottomLeftAnchor.scale.set(
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width
    );

    this.bottomRightAnchor.position.set(
      (document.body.clientWidth / 2) * 1,
      (-document.body.clientHeight / 2) * 1,
      0
    );
    this.bottomRightAnchor.scale.set(
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width,
      window.innerWidth / window.screen.width
    );
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export interface GuiInputOptions {
  position?: Vector2;
  anchor: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center";
}

export class GuiInput extends Group {
  constructor(public gui: GuiManager, public options: GuiInputOptions) {
    super();
    switch (options.anchor) {
      case "topLeft":
        gui.topLeftAnchor.add(this);
        break;
      case "topRight":
        gui.topRightAnchor.add(this);
        break;
      case "bottomLeft":
        gui.bottomLeftAnchor.add(this);
        break;
      case "bottomRight":
        gui.bottomRightAnchor.add(this);
        break;
    }
    if (options.position) {
      this.position.set(options.position.x, options.position.y, 0);
    } else {
      this.position.set(0, 0, 0);
    }
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

export interface StickInputOptions extends GuiInputOptions {
  baseRadius?: number;
  handleRadius?: number;
}

export class StickInput extends GuiInput {
  value: Vector2;
  base: Mesh<CircleGeometry, MeshStandardMaterial>;
  handle: Mesh<CircleGeometry, MeshStandardMaterial>;
  dragging: boolean = false;
  pointer: Pointer;
  options: StickInputOptions;
  constructor(gui: GuiManager, options: StickInputOptions) {
    super(gui, options);
    options.baseRadius = options.baseRadius || 100;
    options.handleRadius = options.handleRadius || options.baseRadius * 0.45;
    this.value = new Vector2(0, 0);
    this.base = generateCircle(
      new Vector3(0, 0, 0),
      options.baseRadius,
      "black",
      32
    );
    this.base.material.transparent = true;
    this.base.material.opacity = 0.5;

    this.handle = generateCircle(
      new Vector3(0, 0, 0),
      options.handleRadius,
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
    //console.log(this.uuid, this.getWorldPosition(new Vector3(0, 0, 0)));
    //console.log(p.position);
    if (!this.pointer && inside) {
      this.pointer = p;
      return true;
    }
    return false;
  }
  onMove(p: Pointer, inside: boolean) {
    if (this.pointer && this.pointer.identifier == p.identifier) {
      const worldPosition = this.getWorldPosition(new Vector3(0, 0, 0));
      const reach = this.gui
        .worldTouch(this.pointer)
        .sub(new Vector2(worldPosition.x, worldPosition.y))
        .multiplyScalar(window.screen.width / window.innerWidth);
      reach.clampLength(0, this.options.baseRadius);
      this.handle.position.set(reach.x, reach.y, 0);
      this.value.x = reach.x / this.options.baseRadius;
      this.value.y = reach.y / this.options.baseRadius;
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
