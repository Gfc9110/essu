export default {
  /**
   *
   * @param {Number} x
   * @param {Number} y
   */
  sample1D({ x }, frequencyScale = 1, amplitude = 1, offset = 0) {
    return Math.sin((x + offset) * frequencyScale) * amplitude;
  },
};
