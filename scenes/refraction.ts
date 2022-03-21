import { OrthographicCamera, Scene, WebGLRenderer } from "three";
import { fixOrtho, resizeRendererToDisplaySize } from "../utils/responsiveCamera";

// array di funzioni che definiscono forma , dati: ax^0 + bx^1 + cx^2, inverted?
// rifrazione ai confini delle particelle
// dati particelle: posX, posY, fract -> angle | floor = speed, wavelength
// use shader function "refract"

export default function (renderer: WebGLRenderer) {
  const scene = new Scene();
  const camera = new OrthographicCamera();

  function update(deltaTime: number, time: number) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixOrtho(renderer, camera, document.body.clientHeight);
    }
    renderer.render(scene, camera);
  }

  return { scene, camera, update };
}
