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
import domUi from "../utils/dom-ui";
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

  let xSpacing = 0;

  const controls = domUi({
    xSpacing: { label: "Spostamento X", type: "range" },
    ySpacing: { label: "Spostamento Y", type: "range" },
    rotation: { label: "Rotazione", type: "range" },
    externalColor: {
      label: "Colore Esterno",
      type: "color",
      startValue: "#ff0000",
    },
    internalColor: {
      label: "Colore Interno",
      type: "color",
      startValue: "#0000ff",
    },
    alphaFactor: {
      label: "Fattore Trasparenza",
      type: "range",
      startValue: "-100",
    },
  });

  let geo = new BufferGeometry();

  const lines = [];

  for (let i = 0; i < 100; i++) {
    const line = new Line(
      geo,
      new LineBasicMaterial({
        color: "#563d6d",
        transparent: true,
        opacity: 1 - i * 0.01,
      })
    );
    line.scale.multiplyScalar(1 - i * 0.01);
    line.rotation.z = i * -0.02;
    line.position.x = (i * xSpacing) / 1000;
    line.position.y = -i * -0.04;
    line.position.z = -0.1;
    lines.push(line);
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
      const value = radius + noise.sample({ x, y, z: time * 0.0001 }, 1, 0.8);
      points.push(new Vector2(x * value * 0.9, y * value));
    }
    lines.forEach((line, i) => {
      line.material.color = new Color(controls.externalColor).lerp(
        new Color(controls.internalColor),
        i / lines.length
      );
      line.material.opacity = 1 - i * (controls.alphaFactor + 100) * 0.001;
      line.rotation.z = i * controls.rotation * 0.001;
      line.position.x = (i * controls.xSpacing) / 1000;
      line.position.y = (i * controls.ySpacing) / 1000;
      line.position.z = -0.1;
    });

    geo.setFromPoints(points);
    renderer.render(scene, camera);
    mesh.position.y = 0.7 * Math.sin(time * 0.0001);
    darkMesh.position.y = 0.7 * Math.sin(time * 0.0001) - 0.05;
  }

  return { scene, camera, update };
};
