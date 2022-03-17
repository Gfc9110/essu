export default {
  orthoCubes: async (r) => (await import("./ortho-cubes")).default(r),
  waving: async (r) => (await import("./waving")).default(r),
  mouselight: async (r) => (await import("./mouselight")).default(r),
  planimetry: async (r) => (await import("./planimetry")).default(r),
  circles: async (r) => (await import("./circles")).default(r),
  "hud-test": async (r) => (await import("./hud-test")).default(r),
  bloom: async (r) => (await import("./bloom")).default(r),
  "scrolling-terrain": async (r) => (await import("./scrolling-terrain")).default(r),
  particles: async (r) => (await import("./particles")).default(r),
  gpuParticles: async (r) => (await import("./gpuParticles")).default(r),
  gameOfLife: async (r) => (await import("./gameOfLife")).default(r),
  mandelbrot: async (r) => (await import("./mandelbrot")).default(r),
};
