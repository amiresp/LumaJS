import { Luma } from "../../js/core/Luma.js";
import { ApplicationRegistry } from "../../js/shared/ApplicationRegistry.js";
import { config } from "./config.js";

export function createAdmin({ base = "/", onError } = {}) {
  const runtime = new Luma({ base, theme: config.theme, fallback: config.fallback, onError });
  const app = new ApplicationRegistry({ name: config.name, routes: config.routes });
  return { runtime, app };
}
