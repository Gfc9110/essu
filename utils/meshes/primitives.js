import * as THREE from "three";
import {
  SphereGeometry,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  Vector3,
} from "three";

/**
 *
 * @param {Vector3} center
 * @param {Vector3} size
 * @param {THREE.ColorRepresentation} color
 */
export function generateBox(center, size, color) {
  const geometry = new BoxGeometry(size.x, size.y, size.z);
  const material = new MeshStandardMaterial({ color });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(center.x, center.y, center.z);
  return mesh;
}

/**
 *
 * @param {Number} center
 * @param {Number} radius
 * @param {ColorRepresentation} color
 * @param {Number} wSegments
 * @param {Number} hSegments
 * @returns
 */
export function generateSphere(
  center,
  radius,
  color,
  wSegments = 32,
  hSegments = 16
) {
  const geometry = new SphereGeometry(radius, wSegments, hSegments);
  const material = new MeshStandardMaterial({ color });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(center.x, center.y, center.z);
  return mesh;
}
