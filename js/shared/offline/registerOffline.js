/**
 * Opt-in offline support. Never registers itself automatically.
 * Must be served from a suitable same-origin /service-worker.js path.
 */
export async function registerOffline({ url = "/service-worker.js", scope = "/", enabled = true } = {}) {
  if (!enabled || !("serviceWorker" in navigator) || !globalThis.isSecureContext) return null;
  const destination = new URL(url, location.href);
  if (destination.origin !== location.origin) throw new Error("Service worker must be same-origin");
  return navigator.serviceWorker.register(destination.href, { scope, updateViaCache: "none" });
}
