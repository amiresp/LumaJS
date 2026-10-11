# Resilience model

The production browser runtime has no mandatory Node.js or build requirement. `HttpClient` adds abort propagation, timeout and bounded GET/HEAD retries. It does **not** persist sensitive responses or automatically cache API data.

Static assets can be served with immutable versioned URLs and HTTP caching. Any Service Worker must be **opt-in**, scoped to each app, and must never cache authenticated API responses by default. Offline caching and UI recovery are still integration work, not implemented by the HTTP client.
