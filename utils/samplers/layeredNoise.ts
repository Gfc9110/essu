import { Vector3, Vector4 } from "three";
import SimplexNoise from "simplex-noise";
const simplex = new SimplexNoise();

export default function (
  { x, y, z, w }: Vector4,
  layers: { scale: number; amplitude: number }[]
): number {
  return layers.reduce((previousValue, currentValue, index) => {
    return (
      previousValue +
      simplex.noise4D(
        x / currentValue.scale,
        y / currentValue.scale,
        z / currentValue.scale,
        w / currentValue.scale
      )
    );
  }, 0);
}
