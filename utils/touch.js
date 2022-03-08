import { Raycaster, Vector2 } from "three";
import Hammer from "hammerjs";
import mouse from "./mouse";

const raycaster = new Raycaster();

export default function (renderer) {
  const touch = {
    position: new Vector2(0, 0),
    movement: new Vector2(0, 0),
    isDown: false,
    wentDown: false,
    dragging: false,
    onDown: [],
    onUp: [],
    getIntersections: (camera, scene) => {
      raycaster.setFromCamera(
        {
          x: (touch.position.x / renderer.domElement.width) * 2 - 1,
          y: -(touch.position.y / renderer.domElement.height) * 2 + 1,
        },
        camera
      );
      return raycaster.intersectObjects(scene.children);
    },
  };
  let touchMoveTimeout;
  let downHandler = (event) => {
    event.preventDefault();
    if (event.changedTouches) {
      const firstTouch = Array.from(event.changedTouches).find(
        (t) => t.identifier == 0
      );
      if (firstTouch) {
        touch.isDown = true;
        touch.wentDown = true;
        touch.position.x = firstTouch.clientX;
        touch.position.y = firstTouch.clientY;
        touch.movement.x = 0;
        touch.movement.y = 0;
        touch.onDown.forEach((h) => h());
      }
    } else {
      if (event.button === 0) {
        touch.isDown = true;
        touch.wentDown = true;
        touch.position.x = event.clientX;
        touch.position.y = event.clientY;
        touch.movement.x = 0;
        touch.movement.y = 0;
        touch.onDown.forEach((h) => h());
      }
    }
  };
  let moveHandler = (event) => {
    event.preventDefault();
    if (event.changedTouches) {
      const firstTouch = Array.from(event.changedTouches).find(
        (t) => t.identifier == 0
      );
      if (firstTouch) {
        touch.movement.x = firstTouch.clientX - touch.position.x;
        touch.movement.y = firstTouch.clientY - touch.position.y;
        touch.position.x = firstTouch.clientX;
        touch.position.y = firstTouch.clientY;
        touch.dragging = true;
        touch.wentDown = false;
      } else {
        touch.movement.x = 0;
        touch.movement.y = 0;
        touch.dragging = false;
        touch.wentDown = false;
      }
      clearTimeout(touchMoveTimeout);
      touchMoveTimeout = setTimeout(() => {
        touch.dragging = false;
        touch.wentDown = false;
      }, 16.6666);
    } else {
      if (event.button === 0) {
        touch.position.x = event.clientX;
        touch.position.y = event.clientY;
        touch.movement.x = event.movementX;
        touch.movement.y = event.movementY;
        touch.dragging = true;
        touch.wentDown = false;
        clearTimeout(touchMoveTimeout);
        touchMoveTimeout = setTimeout(() => {
          touch.dragging = false;
          touch.wentDown = false;
        }, 16.6666);
      }
    }
  };
  let upHandler = (event) => {
    event.preventDefault();
    if (event.changedTouches) {
      const firstTouch = Array.from(event.changedTouches).find(
        (t) => t.identifier == 0
      );
      if (firstTouch) {
        touch.isDown = false;
        touch.position.x = firstTouch.clientX;
        touch.position.y = firstTouch.clientY;
        touch.wentDown = false;
      }
    } else {
      if (event.button === 0) {
        touch.isDown = false;
        touch.position.x = event.clientX;
        touch.position.y = event.clientY;
        touch.movement.x = 0;
        touch.movement.y = 0;
        touch.wentDown = false;
      }
    }
  };
  renderer.domElement.addEventListener("mousedown", downHandler);
  renderer.domElement.addEventListener("touchstart", downHandler);
  renderer.domElement.addEventListener("mousemove", moveHandler);
  renderer.domElement.addEventListener("touchmove", moveHandler);
  window.addEventListener("mouseup", upHandler);
  window.addEventListener("touchend", upHandler);
  return {
    touch,
  };
}
