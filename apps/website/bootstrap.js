import { Luma } from "../../js/core/Luma.js";
import { ApplicationRegistry } from "../../js/shared/ApplicationRegistry.js";
import { logger } from "../../js/shared/Logger.js";
import { config } from "./config.js";

/**
 * Application-level logging, never a Core, Page or Component dependency.
 * The shared logger can also be adjusted externally after bootstrap.
 */
export function createWebsite({ base = "/", onError, logging } = {}) {
  if (logging) {
    if (logging.level !== undefined) logger.setLevel(logging.level);
    if (logging.enabled !== undefined) logger.setEnabled(logging.enabled);
  }
  const reportError = (error, host) => {
    logger.error(config.name, host?.dataset?.luma ?? "runtime", error);
    onError?.(error, host);
  };
  const runtime = new Luma({ base, theme: config.theme, fallback: config.fallback, onError: reportError });
  const app = new ApplicationRegistry({ name: config.name, routes: config.routes });
  logger.debug(config.name, "initialized");
  return { runtime, app, logger };
}
