/**
 * Resolve component presentation with ordered app-owned theme fallback.
 * Compatible with wwwroot/dependency/Global/ directory conventions.
 */
export class ThemeResolver {
  constructor({ base = "/", themes = ["core-default"], fetcher = fetch } = {}) {
    this.base = base.endsWith("/") ? base : base + "/";
    this.themes = [...new Set(themes)];
    this.fetcher = fetcher;
    this.cache = new Map();
  }
  async resolve(name, kind = "html") {
    if (!/^[a-z][\w-]*$/i.test(name) || !["html", "css"].includes(kind)) throw new TypeError("Invalid theme resource");
    for (const theme of this.themes) {
      if (!/^[a-z][\w-]*$/i.test(theme)) throw new TypeError("Invalid theme");
      const path = `themes/${theme}/dependency/Global/${name}/${name}.${kind}`;
      const url = new URL(path, new URL(this.base, globalThis.location?.href || "https://localhost/"));
      const key = url.href;
      if (!this.cache.has(key)) {
        this.cache.set(key, Promise.resolve().then(() => this.fetcher(url.href)).then(async response => {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.text();
        }));
      }
      try { return { theme, content: await this.cache.get(key), url: url.href }; }
      catch { this.cache.delete(key); }
    }
    throw new Error(`No ${kind} found for component ${name}`);
  }
}
