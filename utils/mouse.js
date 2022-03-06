import * as THREE from "three";

export default function () {
  const mouse = {
    position: new THREE.Vector2(0, 0),
    movement: new THREE.Vector2(0, 0),
  };
  document.addEventListener("mousemove", (event) => {
    mouse.position.x = event.offsetX;
    mouse.position.y = event.offsetY;
    mouse.movement.x = event.movementX;
    mouse.movement.y = event.movementY;
  });
  return mouse;
}
