import { Vector2 } from "three";
import Hammer from "hammerjs";
import mouse from "./mouse";

export default function (renderer) {
  const touch = {
    position: new Vector2(0, 0),
    movement: new Vector2(0, 0),
    down: false,
  };
  const hammer = new Hammer(renderer.domElement);
  hammer.on("pan", (event) => {
    if (event.srcEvent.pointerId == 1) {
      touch.position.x = event.center.x;
      touch.position.y = event.center.y;
      touch.movement.x = event.deltaX;
      touch.movement.y = event.deltaY;
    }
  });
  return touch;
}
