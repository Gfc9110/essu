import * as THREE from "three";
//import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.z = 2;

  const scene = new THREE.Scene();

  /*const fbxLoader = new FBXLoader();
  fbxLoader.load("./models/BaseShape3D.fbx", (object) => {
    object.rotation.y = -Math.PI / 2;
    scene.add(object);
  });*/

  const boxWidth = 0.2024465;
  const boxHeight = 0.53245;
  const boxDepth = 0.2024465;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });

  const short = new THREE.Mesh(geometry, material);
  short.position.y = 0.53245 / 2;
  short.position.x = 0.2024465 / 2;
  const long = new THREE.Mesh(
    new THREE.BoxGeometry(0.86288, 0.2024465, 0.2024465),
    material
  );
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
    logo.rotation.y += 0.01;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
