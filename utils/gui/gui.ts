import {
  AmbientLight,
  Group,
  OrthographicCamera,
  Raycaster,
  Scene,
  WebGLRenderer,
} from "three";
import MultitouchInput, { Pointer } from "../input/multitouch";

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
}

export class GuiInput extends Group {
  constructor(private gui: GuiManager) {
    super();
  }
  onDown(p: Pointer, inside: boolean): boolean {
    console.log(p, inside);
    return false;
  }
}

export class StickInput extends GuiInput {
  constructor(gui: GuiManager, baseRadius = 100, handleRadius = null) {
    super(gui);
  }
}
