import {
  AmbientLight,
  BufferGeometry,
  CircleGeometry,
  Color,
  EdgesGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  ShapeGeometry,
  Vector2,
} from "three";
import gradientMaterial from "../utils/materials/gradientMaterial";
import {
  fixPersp,
  resizeRendererToDisplaySize,
} from "../utils/responsiveCamera";
import noise from "../utils/samplers/noise";
import touchGen from "../utils/touch";
export default async (renderer) => {
  const scene = new Scene();
  scene.background = new Color("#0C0C24");
  const { touch } = touchGen(renderer);
  const camera = new PerspectiveCamera();
  camera.position.z = 10;

  let geo = new BufferGeometry();

  for (let i = 0; i < 160; i++) {
    const line = new Line(
      geo,
      new LineBasicMaterial({
        color: "#563d6d",
        transparent: true,
        opacity: 1,
      })
    );
    line.scale.multiplyScalar(1 - i * 0.02);
    line.rotation.z = i * 0.02;
    line.position.x = i * 0.07;
    line.position.y = -i * 0.04;
    line.position.z = -0.1;
    scene.add(line);
  }

  const cirleGeo = new CircleGeometry(1.4, 64);
  cirleGeo.computeBoundingBox();
  const mesh = new Mesh(
    cirleGeo,
    gradientMaterial("#FC636C", "#BA3078", cirleGeo)
  );
  mesh.rotation.z = Math.PI;

  const darkMesh = new Mesh(
    cirleGeo,
    new MeshStandardMaterial({ color: "#000714" })
  );

  darkMesh.position.z = -0.05;
  darkMesh.position.x = 0.05;

  scene.add(new AmbientLight("white", 1), camera, mesh, darkMesh);
  const radius = 5;
  const segments = 256;

  function update(deltaTime, time) {
    if (resizeRendererToDisplaySize(renderer)) {
      fixPersp(renderer, camera);
      camera.updateProjectionMatrix();
    }

    camera.position.z = window.innerHeight > window.innerWidth ? 23 : 12;
    camera.position.x = window.innerHeight > window.innerWidth ? 0 : -4;
    const points = [];
    for (let i = 0; i <= Math.PI * 2 + 0.001; i += (Math.PI * 2) / segments) {
      const x = Math.cos(i);
      const y = Math.sin(i);
      const value = radius + noise.sample({ x, y, z: time * 0.0001 }, 0.6, 0.8);
      points.push(new Vector2(x * value * 0.9, y * value));
    }
    geo.setFromPoints(points);
    renderer.render(scene, camera);
    mesh.position.y = 0.7 * Math.sin(time * 0.0001);
    darkMesh.position.y = 0.7 * Math.sin(time * 0.0001) - 0.05;
  }

  return { scene, camera, update };
};


