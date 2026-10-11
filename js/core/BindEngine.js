/**
 * Safe data-id binder. Original wwwroot semantics, without project globals.
 * Uses textContent and safe attributes; HTML is never injected from untrusted data.
 */
const get = (data, path) => {
  if (!path || /(?:^|\.)(?:__proto__|constructor|prototype)(?:\.|$)/i.test(path)) return undefined;
  return path.split(".").reduce((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    const actual = Object.keys(value).find(candidate => candidate.toLowerCase() === key.toLowerCase());
    return actual ? value[actual] : undefined;
  }, data);
};
const values = (root, selector) => [
  ...(root.matches?.(selector) ? [root] : []),
  ...root.querySelectorAll(selector)
];
const safeAttribute = name => /^(?:aria-[\w-]+|data-[\w-]+|title|alt|placeholder|value|role)$/i.test(name);
export class BindEngine {
  get(source, path, fallback) { return get(source, path) ?? fallback; }
  bind(root, source = {}) {
    if (!root?.querySelectorAll) throw new TypeError("Expected DOM root");
    for (const element of values(root, "[data-bind-text]")) {
      element.textContent = String(get(source, element.dataset.bindText) ?? "");
    }
    for (const element of values(root, "[data-bind-attr]")) {
      for (const entry of element.dataset.bindAttr.split(",")) {
        const [name, path] = entry.split(":").map(s => s.trim());
        if (!safeAttribute(name)) throw new Error("Unsafe bind attribute: " + name);
        const value = get(source, path);
        if (value == null || value === false) element.removeAttribute(name);
        else element.setAttribute(name, String(value));
      }
    }
    for (const element of values(root, "[data-bind-hidden]")) {
      element.hidden = Boolean(get(source, element.dataset.bindHidden));
    }
    return root;
  }
}
export const bindEngine = new BindEngine();
