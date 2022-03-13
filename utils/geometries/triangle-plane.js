import { BufferAttribute, BufferGeometry } from "three";

/**
 *
 * @param {Number} vertexSpacing
 * @param {Number} sizeX
 * @param {Number} sizeY
 * @returns {BufferGeometry}
 */
export default function (
  vertexSpacing,
  sizeX,
  sizeY,
  sampler = ({ x, y }) => 0,
  verticalSpacing = null
) {
  const geometry = new BufferGeometry();

  const indices = [];

  const vertices = [];

  for (let x = 0; x <= sizeX; x++) {
    for (let y = 0; y <= sizeY; y++) {
      vertices.push(
        x * vertexSpacing,
        y * (verticalSpacing || vertexSpacing),
        sampler({ x, y })
      );
      if (x > 0 && y > 0) {
        indices.push((x - 1) * (sizeY + 1) + (y - 1));
        indices.push(x * (sizeY + 1) + (y - 1));
        indices.push((x - 1) * (sizeY + 1) + y);

        indices.push(x * (sizeY + 1) + (y - 1));
        indices.push(x * (sizeY + 1) + y);
        indices.push((x - 1) * (sizeY + 1) + y);
      }
    }
  }

  const v = new Float32Array(vertices);
  geometry.setIndex(indices);
  geometry.setAttribute("position", new BufferAttribute(v, 3));
  geometry.computeVertexNormals();
  return geometry;
}
