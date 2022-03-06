import { Group } from "three";

/**
 *
 * @param {Group} group
 * @param {*} elementDistance
 * @param {*} xAmount
 * @param {*} yAmount
 */
export default function (
  group,
  elementDistance = 1,
  xAmount = 3,
  yAmount = 3,
  elementVerticalDistance = null
) {
  const container = new Group();
  container.add(group.clone(true));
  for (let x = 0; x < xAmount; x++) {
    for (let y = 0; y < yAmount; y++) {
      if (x > 0 || y > 0) {
        const clone = group.clone(true);
        clone.position.set(
          group.position.x + x * elementDistance,
          group.position.y + y * (elementVerticalDistance || elementDistance),
          group.position.z
        );
        container.add(clone);
      }
    }
  }
  return container;
}
