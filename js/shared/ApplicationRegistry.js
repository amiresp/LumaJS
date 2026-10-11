import { RouteResolver } from "../core/RouteResolver.js";
/**
 * Application-scoped feature / option / caller dependency registry.
 * This module is not imported by Core; apps opt into composition.
 */
export class ApplicationRegistry {
  constructor({ name, routes = [] } = {}) {
    if (!name || !/^[a-z][\w-]*$/i.test(name)) throw new Error("Invalid app name");
    this.name = name;
    this.routes = [];
    this.router = new RouteResolver();
    this.features = new Map();
    this.options = new Map();
    this.callers = new Map();
    this.addRoutes(routes);
  }
  addRoutes(routes) {
    for (const route of routes) {
      if (!route || typeof route.path !== "string" || !route.path.startsWith("/")) throw new TypeError("Route needs absolute path");
      if (this.routes.some(existing => existing.path === route.path)) throw new Error("Duplicate app route: " + route.path);
      this.router.register(route);
      this.routes.push(Object.freeze({ ...route }));
    }
    return this;
  }
  registerFeature(name, factory) { return this.register(this.features, name, factory); }
  registerOption(name, factory) { return this.register(this.options, name, factory); }
  registerCaller(name, factory) { return this.register(this.callers, name, factory); }
  register(map, name, factory) {
    if (!/^[\w-]+$/.test(name) || typeof factory !== "function") throw new TypeError("Invalid module registration");
    if (map.has(name)) throw new Error("Already registered: " + name);
    map.set(name, factory);
    return this;
  }
  resolve(path) {
    return this.router.resolve(path)?.route ?? null;
  }
  async loadFeature(name, context = {}) {
    const factory = this.features.get(name);
    if (!factory) throw new Error("Unknown feature: " + name);
    return factory({ app: this, ...context });
  }
  async loadOption(name, context = {}) {
    const factory = this.options.get(name);
    if (!factory) throw new Error("Unknown option: " + name);
    return factory({ app: this, ...context });
  }
  async call(name, ...args) {
    const factory = this.callers.get(name);
    if (!factory) throw new Error("Unknown caller: " + name);
    return factory(...args);
  }
}
