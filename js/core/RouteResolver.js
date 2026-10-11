/**
 * Route resolution primitive. No domain names or business paths in Core.
 * Apps provide their own route manifests.
 */
const normalize = path => {
  const url = new URL(path, "https://lumajs.invalid");
  return decodeURI(url.pathname).replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
};
const tokenize = pattern => normalize(pattern).split("/").filter(Boolean);
export class RouteResolver {
  constructor(routes = [], { notFound = null } = {}) {
    this.routes = [];
    this.notFound = notFound;
    this.registerMany(routes);
  }
  registerMany(routes) { for (const route of routes) this.register(route); return this; }
  register(route) {
    if (!route || typeof route.path !== "string" || !route.path.startsWith("/")) throw new TypeError("Route path must start with /");
    if (this.routes.some(x => normalize(x.path) === normalize(route.path))) throw new Error("Duplicate route: " + route.path);
    this.routes.push(Object.freeze({ ...route }));
    return this;
  }
  resolve(path) {
    const parts = tokenize(path);
    for (const route of this.routes) {
      const candidate = tokenize(route.path);
      if (candidate.length !== parts.length) continue;
      const params = {};
      let valid = true;
      for (let i = 0; i < candidate.length; i++) {
        if (candidate[i].startsWith(":")) {
          params[candidate[i].slice(1)] = parts[i];
        } else if (candidate[i] !== parts[i]) { valid = false; break; }
      }
      if (valid) return { route, params, path: normalize(path) };
    }
    return this.notFound ? { route: this.notFound, params: {}, path: normalize(path) } : null;
  }
}
