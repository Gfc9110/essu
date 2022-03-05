import "./style.css";

import * as THREE from "three";
import { Color } from "three";
//import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

function main() {
  const canvas = document.querySelector("#c");
  let mouseMove = null;
  canvas.addEventListener("mouseleave", () => {
    mouseMove = null;
  });
  canvas.addEventListener("mousemove", ({ offsetX, offsetY }) => {
    mouseMove = { x: offsetX, y: offsetY };
  });
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

  //renderer.shadowMap.enabled = true;

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 150;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  const cameraRig = new THREE.Group();
  cameraRig.add(camera);

  camera.position.z = 2;

  const scene = new THREE.Scene();
  scene.background = new Color(0x000000);

  scene.add(cameraRig);

  const light = new THREE.DirectionalLight(0xffffff);
  //light.castShadow = true;

  //light.shadow.mapSize.x = 1024;
  //light.shadow.mapSize.y = 1024;

  light.position.x = 0;
  light.position.z = 1;
  light.position.y = 1;

  light.intensity = 3;
  light.color.set("#7A8E9B");

  scene.add(light);

  /*const fbxLoader = new FBXLoader();
  fbxLoader.load("./models/BaseShape3D.fbx", (object) => {
    object.rotation.y = -Math.PI / 2;
    scene.add(object);
  });*/

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(375, 200),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load("img/background.jpg"),
      side: c.DoubleSide,
    })
  );

  //plane.receiveShadow = true;

  plane.position.z = -90;

  scene.add(plane);

  const helper = new THREE.CameraHelper(light.shadow.camera);

  //scene.add(helper);

  const boxWidth = 0.2024465;
  const boxHeight = 0.53245;
  const boxDepth = 0.2024465;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material = new THREE.MeshStandardMaterial({ color: 0x131622 });
  new THREE.MeshStandardMaterial();

  const short = new THREE.Mesh(geometry, material);
  //short.castShadow = true;
  //short.receiveShadow = true;
  short.position.y = 0.53245 / 2;
  short.position.x = 0.2024465 / 2;
  const long = new THREE.Mesh(
    new THREE.BoxGeometry(0.86288, 0.2024465, 0.2024465),
    material
  );
  //long.castShadow = true;
  //long.receiveShadow = true;
  long.position.x = 0.86288 / 2;

  long.position.y = 0.2024465 / 2;

  const half = new THREE.Group();
  half.add(short, long);
  const logo = new THREE.Group();
  logo.add(half, half.clone(true));
  half.rotation.z = Math.PI;
  logo.rotation.z = -Math.PI / 4;
  scene.add(logo);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  /*
  const backgroundTexture = new THREE.TextureLoader().load('img/background.jpg');
  scene.background = backgroundTexture;
  */

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // cubes.forEach((cube, ndx) => {
    //   const speed = 1 + ndx * 0.1;
    //   const rot = time * speed;
    //   cube.rotation.x = rot;
    //   cube.rotation.y = rot;
    // });

    //cube.rotation.z += 0.001;

    //short.rotation.x += 0.01;
    //console.log(mouseMove);

    /*
    logo.rotation.y += mouseMove
      ? mouseMove.x
        ? mouseMove.x * 0.01
        : 0
      : 0.01;
    mouseMove = mouseMove ? { ...mouseMove, x: 0 } : null;
    

    logo.rotation.y = mouseMove
      ? mouseMove.x
        ?mouseMove.x * 0.01
        : 0
      : 0
    mouseMove = mouseMove ? { ...mouseMove, x:0 } : null;
    */

    if (mouseMove) {
      if (mouseMove.x) {
        logo.rotation.y = (mouseMove.x - canvas.clientWidth * 0.5) * 0.0005;

        //plane.position.x = (mouseMove.x - canvas.clientWidth * 0.5) * -0.005;
        //plane.rotation.y = (mouseMove.x - canvas.clientWidth * 0.5) * 0.00005;
        cameraRig.rotation.y =
          (mouseMove.x - canvas.clientWidth * 0.5) * 0.00005;
      }

      if (mouseMove.y) {
        logo.rotation.x = (mouseMove.y - canvas.clientHeight * 0.5) * 0.0005;
        //plane.position.y = (mouseMove.y - canvas.clientHeight * 0.5) * -0.005;
        //plane.rotation.x = (mouseMove.y - canvas.clientHeight * 0.5) * 0.00005;
        cameraRig.rotation.x =
          (mouseMove.y - canvas.clientHeight * 0.5) * 0.00005;
      }
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
