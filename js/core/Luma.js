/**
 * LumaJS browser runtime — zero production dependencies.
 * Template HTML is trusted, same-origin application code. Never interpolate user data into it.
 */
export class Luma {
  constructor({ base = "/", theme = "core-default", fallback = "core-default", onError = console.error } = {}) {
    this.base = base.endsWith("/") ? base : base + "/";
    this.theme = theme;
    this.fallback = fallback;
    this.onError = onError;
    this.registry = new Map();
    this.instances = new Map();
    this.inFlight = new Map();
    this.generation = 0;
    this.revisions = new WeakMap();
  }
  register(name, definition) {
    if (!/^[A-Za-z][\w-]*$/.test(name)) throw new Error("Invalid component name");
    if (!definition || typeof definition.load !== "function") throw new TypeError("Component requires load()");
    this.registry.set(name, definition);
    return this;
  }
  async text(path) {
    const url = new URL(path.replace(/^\//, ""), new URL(this.base, location.href));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url.pathname}`);
    return response.text();
  }
  async template(name) {
    for (const theme of new Set([this.theme, this.fallback])) {
      try { return await this.text(`themes/${theme}/dependency/Global/${name}/${name}.html`); }
      catch (error) { if (theme === this.fallback) throw error; }
    }
  }
  async style(name) {
    // Missing CSS is not a fatal component failure.
    for (const theme of new Set([this.theme, this.fallback])) {
      const href = new URL(`themes/${theme}/dependency/Global/${name}/${name}.css`, new URL(this.base, location.href)).href;
      if (document.querySelector(`link[data-luma-style="${name}:${theme}"]`)) return;
      try {
        const response = await fetch(href);
        if (!response.ok) continue;
        const style = document.createElement("style");
        style.dataset.lumaStyle = `${name}:${theme}`;
        style.textContent = await response.text();
        document.head.append(style);
        return;
      } catch (error) { /* Optional CSS; try fallback. */ }
    }
  }
  async mount(host) {
    if (!(host instanceof Element)) throw new TypeError("Host must be an Element");
    if (this.instances.has(host)) return this.instances.get(host);
    if (this.inFlight.has(host)) return this.inFlight.get(host);
    const name = host.getAttribute("data-luma");
    const definition = this.registry.get(name);
    if (!definition) {
      this.fail(host, new Error(`Unregistered component: ${name}`));
      return null;
    }
    const version = this.revisions.get(host) || 0;
    const current = () => (this.revisions.get(host) || 0) === version;
    const task = (async () => {
      host.dataset.loadState = "loading";
      let instance;
      try {
        const [html, module] = await Promise.all([this.template(name), definition.load()]);
        if (!current() || !host.isConnected) return null;
        // HTML comes only from trusted application theme files.
        host.innerHTML = html;
        await this.style(name);
        if (!current() || !host.isConnected) return null;
        const root = host.querySelector('[data-id="root"]') || host;
        const factory = module[definition.exportName || "create"];
        if (typeof factory !== "function") throw new Error(`Invalid component factory: ${name}`);
        instance = await factory(root, { runtime: this, host, name });
        if (!instance || typeof instance.destroy !== "function") throw new Error(`${name} must return a destroyable instance`);
        if (!current() || !host.isConnected) {
          await instance.destroy();
          return null;
        }
        this.instances.set(host, instance);
        host.dataset.loadState = "ready";
        await this.hydrate(host);
        return instance;
      } catch (error) {
        try { await instance?.destroy?.(); } catch (cleanupError) { this.onError(cleanupError, host); }
        if (current()) this.fail(host, error);
        return null;
      }
    })();
    this.inFlight.set(host, task);
    try { return await task; } finally { this.inFlight.delete(host); }
  }
  fail(host, error) {
    host.dataset.loadState = "error";
    this.onError(error, host);
    host.dispatchEvent(new CustomEvent("luma:error", { detail: { error }, bubbles: true }));
  }
  async hydrate(scope = document) {
    const hosts = [...scope.querySelectorAll("[data-luma]")].filter(host => !host.parentElement?.closest("[data-luma]"));
    return Promise.allSettled(hosts.map(host => this.mount(host)));
  }
  async destroy(scope = document) {
    const inside = host => scope === document || scope === host || scope.contains(host);
    const affected = new Set([...this.instances.keys(), ...this.inFlight.keys()].filter(inside));
    for (const host of affected) this.revisions.set(host, (this.revisions.get(host) || 0) + 1);
    const pending = [...this.inFlight.entries()].filter(([host]) => affected.has(host)).map(([, task]) => task);
    const entries = [...this.instances].filter(([host]) => affected.has(host));
    await Promise.allSettled(entries.map(async ([host, instance]) => {
      this.instances.delete(host);
      try { await instance.destroy(); }
      catch (error) { this.onError(error, host); }
      delete host.dataset.loadState;
    }));
    await Promise.allSettled(pending);
  }
  async restart(scope = document) {
    await this.destroy(scope);
    return this.hydrate(scope);
  }
}
