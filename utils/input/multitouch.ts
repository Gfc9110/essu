import {
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import touch from "../touch";

export type TouchListener = (p: Pointer) => boolean;

const emitPointer = (p: Pointer, l: TouchListener[]) => {
  let result = false;
  const listeners = [...l];
  while (listeners.length && result == false) {
    const next = listeners.shift();
    result = next && next(p);
  }
};

export default class MultitouchInput {
  public pointers: Pointer[] = [];
  public onDownListeners: TouchListener[] = [];
  public onMoveListeners: TouchListener[] = [];
  public onUpListeners: TouchListener[] = [];
  private raycaster: Raycaster = new Raycaster();

  constructor(private renderer: WebGLRenderer) {
    this.registerEvent(
      "mousedown",
      this.onMouseDown.bind(this),
      this.onDownListeners
    );
    this.registerEvent(
      "touchstart",
      this.onTouchStart.bind(this),
      this.onDownListeners
    );
    this.registerEvent(
      "mousemove",
      this.onMouseMove.bind(this),
      this.onMoveListeners
    );
    this.registerEvent(
      "touchmove",
      this.onTouchMove.bind(this),
      this.onMoveListeners
    );
    this.registerEvent(
      "mouseup",
      this.onMouseUp.bind(this),
      this.onUpListeners
    );
    this.registerEvent(
      "touchend",
      this.onTouchEnd.bind(this),
      this.onUpListeners
    );
  }
  onMouseDown(event: MouseEvent): Pointer[] {
    const pointer = (this.pointers[0] =
      this.pointers[0] || new Pointer("mouse", -1));
    pointer.type = "mouse";
    pointer.position.set(event.offsetX, event.offsetY);
    pointer.movement.set(event.movementX, event.movementY);
    pointer.isDown = true;
    return [pointer];
  }
  onTouchStart(event: TouchEvent): Pointer[] {
    let pointers: Pointer[] = [];
    Array.from(event.changedTouches).forEach((t, i) => {
      const pointer = (this.pointers[t.identifier] =
        this.pointers[t.identifier] || new Pointer("touch", t.identifier));
      //p = i == 0 ? pointer : p;

      if (pointer.identifier == 2) {
        document.body.requestFullscreen();
      }
      pointer.update(t);
      pointer.isDown = true;
      pointers.push(pointer);
    });
    return pointers;
  }
  onMouseMove(event: MouseEvent): Pointer[] {
    const pointer = (this.pointers[0] =
      this.pointers[0] || new Pointer("mouse", -1));
    pointer.type = "mouse";
    pointer.position.set(event.offsetX, event.offsetY);
    pointer.movement.set(event.movementX, event.movementY);
    return [pointer];
  }
  onTouchMove(event: TouchEvent): Pointer[] {
    let pointers: Pointer[] = [];
    Array.from(event.changedTouches).forEach((t, i) => {
      const pointer = (this.pointers[t.identifier] =
        this.pointers[t.identifier] || new Pointer("touch", t.identifier));
      pointer.update(t);
      pointers.push(pointer);
    });
    return pointers;
  }
  onMouseUp(event: MouseEvent): Pointer[] {
    const pointer = (this.pointers[0] =
      this.pointers[0] || new Pointer("mouse", -1));
    pointer.type = "mouse";
    pointer.position.set(event.offsetX, event.offsetY);
    pointer.movement.set(event.movementX, event.movementY);
    pointer.isDown = false;
    return [pointer];
  }
  onTouchEnd(event: TouchEvent): Pointer[] {
    let pointers: Pointer[] = [];
    Array.from(event.changedTouches).forEach((t, i) => {
      const pointer = (this.pointers[t.identifier] =
        this.pointers[t.identifier] || new Pointer("touch", t.identifier));
      //p = i == 0 ? pointer : p;
      pointer.update(t);
      pointer.isDown = false;
      pointers.push(pointer);
    });
    return pointers;
  }
  registerEvent<E extends keyof HTMLElementEventMap>(
    eventName: E,
    handler: (event: HTMLElementEventMap[E]) => Pointer[],
    listeners: TouchListener[]
  ) {
    this.renderer.domElement.addEventListener(eventName, (e) => {
      e.preventDefault();
      handler(e).forEach((p) => emitPointer(p, listeners));
    });
  }
  getIntersections(
    camera: PerspectiveCamera | OrthographicCamera,
    scene: Scene,
    pointer: Pointer
  ) {
    console.log((pointer.position.x / window.innerWidth) * 2 - 1);
    console.log(-(pointer.position.y / window.innerHeight) * 2 + 1);
    //console.log(document.body.clientWidth);
    console.log(window.innerWidth);
    this.raycaster.setFromCamera(
      {
        x: (pointer.position.x / window.innerWidth) * 2 - 1,
        y: -(pointer.position.y / window.innerHeight) * 2 + 1,
      },
      camera
    );
    return this.raycaster.intersectObjects(scene.children);
  }
}

export class Pointer {
  position = new Vector2(0, 0);
  movement = new Vector2(0, 0);
  isDown = false;
  isDragging = false;
  update(t: Touch) {
    const x = t.clientX; // / (window.innerHeight / window.screen.availHeight);
    const y = t.clientY; // / (window.innerHeight / window.screen.availHeight);
    this.movement.x = x - this.position.x;
    this.movement.y = y - this.position.y;
    this.position.x = x;
    this.position.y = y;
  }
  constructor(public type: "mouse" | "touch", public identifier: number) {}
}
