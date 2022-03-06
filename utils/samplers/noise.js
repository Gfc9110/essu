import SimplexNoise from "simplex-noise";
const simplex = new SimplexNoise();

export default {
  sample({ x = 0, y = 0, z = 0 }, noiseScale = 1, magnitude = 1) {
    return (
      simplex.noise3D(x / noiseScale, y / noiseScale, z / noiseScale) *
      magnitude
    );
  },
};
