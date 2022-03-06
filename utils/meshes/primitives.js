import * as THREE from "three";

/**
 *
 * @param {THREE.Vector3} center
 * @param {THREE.Vector3} size
 * @param {THREE.ColorRepresentation} color
 */
export function generateBox(center, size, color) {
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(center.x, center.y, center.z);
  return mesh;
}
