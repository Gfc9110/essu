import * as THREE from "three";
import { SphereGeometry } from "three";

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

export function generateSphere(
  center,
  radius,
  color,
  wSegments = 32,
  hSegments = 16
) {
  const geometry = new SphereGeometry(radius, wSegments, hSegments);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(center.x, center.y, center.z);
  return mesh;
}
