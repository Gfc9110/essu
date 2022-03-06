import "./style.css";

import * as THREE from "three";

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

import scenes from "./scenes";
import { Camera, Scene } from "three";

async function main() {
  const canvas = document.querySelector("#c");
  let mouseMove = null;
  canvas.addEventListener("mouseleave", () => {
    mouseMove = null;
  });
  canvas.addEventListener("mousemove", ({ movementX, movementY }) => {
    mouseMove = { x: movementX, y: movementY };
  });
  const renderer = new THREE.WebGLRenderer({ canvas });
  const generated = await scenes[params.scene || "orthoCubes"](renderer);

  /**
   * @type {Scene}
   */
  const scene = generated.scene;

  /**
   * @type {Camera}
   */
  const camera = generated.camera;

  const updateScene = generated.update;
  let time = 0;

  function render(newTime) {
    const deltaTime = newTime - time;
    updateScene(deltaTime, newTime);

    renderer.render(scene, camera);

    time = newTime;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
