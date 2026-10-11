/**
 * Optional same-origin JS/CSS loader. Separate keys per resource type and URL.
 * Does not require Node or external libraries; consumers own third-party cleanup.
 */
export class LibraryManager {
  constructor({ documentRef = globalThis.document } = {}) {
    this.document = documentRef;
    this.pending = new Map();
    this.loaded = new Set();
  }
  ensureLoadedJS(name, src, check) { return this.load("js", name, src, check); }
  ensureLoadedCSS(name, href) { return this.load("css", name, href); }
  async load(type, name, url, check) {
    if (!name || !url) throw new TypeError("Library name and URL are required");
    const key = [type, name, url].join(":");
    if (this.loaded.has(key)) return true;
    if (this.pending.has(key)) return this.pending.get(key);
    const promise = new Promise((resolve, reject) => {
      const el = this.document.createElement(type === "js" ? "script" : "link");
      el.dataset.lumaLibrary = key;
      if (type === "js") { el.src = url; el.async = true; }
      else { el.rel = "stylesheet"; el.href = url; }
      el.onload = () => {
        if (check && !check()) { el.remove(); reject(new Error("Library validation failed: " + name)); return; }
        this.loaded.add(key); resolve(true);
      };
      el.onerror = () => { el.remove(); reject(new Error("Failed to load library: " + name)); };
      this.document.head.append(el);
    });
    this.pending.set(key, promise);
    try { return await promise; }
    finally { this.pending.delete(key); }
  }
}
