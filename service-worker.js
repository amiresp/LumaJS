/* LumaJS optional static-asset offline cache.
 * Must never cache API, personalized responses or cross-origin content.
 * Set LUMA_STATIC_VERSION in a new release to invalidate old entries.
 */
const VERSION = "luma-static-v1";
const ROOT = new URL(self.registration.scope);
const ALLOWED = /\.(?:js|css|html|png|jpg|jpeg|webp|svg|gif|woff2?)$/i;
const PUBLIC_DIR = /^\/(?:js\/|themes\/|assets\/|images\/|css\/)/i;
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith("luma-static-") && key !== VERSION) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(ROOT.pathname)) return;
  if (!ALLOWED.test(url.pathname) || !PUBLIC_DIR.test(url.pathname)) return;
  if (url.pathname.endsWith(".html") && !url.pathname.startsWith("/themes/")) return;
  if (url.pathname.includes("/api/") || request.headers.has("authorization")) return;
  if (request.mode === "navigate") return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const response = await fetch(request);
      // Only cache explicitly public assets. Never cache Set-Cookie, opaque or private responses.
      const policy = (response.headers.get("cache-control") || "").toLowerCase();
      if (response.ok && response.type === "basic" &&
          !/(?:private|no-store|no-cache)/.test(policy) &&
          !response.headers.has("set-cookie")) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw error;
    }
  })());
});
