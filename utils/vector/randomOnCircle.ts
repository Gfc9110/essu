import { Vector2 } from "three";

export default function (radius = 1): Vector2 {
  const angle = Math.random() * Math.PI * 2;
  return new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
}
