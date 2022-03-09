export default {
  orthoCubes: async (r) => (await import("./ortho-cubes")).default(r),
  waving: async (r) => (await import("./waving")).default(r),
  mouselight: async (r) => (await import("./mouselight")).default(r),
  planimetry: async (r) => (await import("./planimetry")).default(r),
  circles: async (r) => (await import("./circles")).default(r),
  'hud-test': async (r) => (await import("./hud-test")).default(r),
  'bloom': async (r) => (await import("./bloom")).default(r),
};
