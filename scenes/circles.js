import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  Mesh,
  RingGeometry,
  MeshStandardMaterial,
} from "three";
import createCircles from "../utils/geometries/createCircles";
import { generateBox } from "../utils/meshes/primitives";
import fixCamera from "../utils/responsivePerspective";
import touchGen from "../utils/touch";

export default async function (renderer) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const scene = new Scene();
  const { touch } = touchGen(renderer);
  scene.background = new Color("#000");
  const camera = new PerspectiveCamera();
  camera.position.x = 0;
  camera.position.y = window.innerHeight > window.innerWidth ? -20 : -10;
  camera.position.z = window.innerHeight > window.innerWidth ? 20 : 10;
  camera.rotation.x = Math.PI / 4;

  const ambient = new AmbientLight("#fff", 1);

  scene.add(ambient);

  const light = new DirectionalLight();
  light.position.x = 2;
  light.position.y = 2;
  light.position.z = 10;
  light.intensity = 0.5;
  light.castShadow = true;

  const cameraArm = new Group();
  cameraArm.add(camera);

  const cameraBase = new Group();
  cameraBase.add(cameraArm);

  scene.add(cameraBase);
  scene.add(light);

  







  //Aggiunta cerchio

  const circles = createCircles(20, 0.08, 0.01, 0.02, 1, 0x092B73, 0xEB16FE);
  
  scene.add(...circles);



  

  /**
   * @type {import("three").Mesh}
   */
  touch.onDown.push(() => {
    for (let intersection of touch.getIntersections(camera, scene)) {
      if (intersection.object.userData["cursor"]) {
        intersection.object.material.color.set("#555");
        return;
      }
    }
  });

  function update(deltaTime, time) {

    fixCamera(renderer, camera);
    
    camera.position.y = window.innerHeight > window.innerWidth ? -20 : -10;
    camera.position.z = window.innerHeight > window.innerWidth ? 20 : 10;
    /*
    if (touch.isDown && touch.dragging) {
      cameraBase.rotation.z -= touch.movement.x * 0.001;
      cameraArm.rotation.x -= touch.movement.y * 0.001;
      cameraArm.rotation.x = Math.min(
        Math.max(-Math.PI / 8, cameraArm.rotation.x),
        Math.PI / 8
      );
      console.log(cameraArm.rotation.x);
    }
    */

    cameraArm.rotation.x = -0.5;
    

    renderer.render(scene, camera);


    if(touch.dragging){
      circles.forEach((circle, i) => {
        circle.position.x += touch.movement.x * 0.0005 * Math.abs(i - circles.length/2); 
        circle.position.y += touch.movement.y * -0.0005 * Math.abs(i - circles.length/2); 
      });
    }
    
    
  }

  return { scene, camera, update };
}
