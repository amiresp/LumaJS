/**
 * Shared Button behavior. Supports the themed component root and existing
 * semantic <button data-id="..."> controls inside composite components.
 */
export class Button {
  constructor(root) {
    this.root = root;
    this.button = root.matches?.("button") ? root : root.querySelector('[data-id="button"]');
    if (!this.button) throw new Error("Button requires a native button");
    this.label = root.querySelector?.('[data-id="label"]') || null;
    this.loading = root.querySelector?.('[data-id="loading"]') || null;
    this.controller = new AbortController();
    this.callback = null;
    this.busy = false;
    this.disabled = Boolean(this.button.disabled);
    this.button.classList.add("luma-action-button");
    this.button.addEventListener("click", event => {
      if (!this.busy && !this.button.disabled) this.callback?.(event);
    }, { signal: this.controller.signal });
  }
  configure({ label, variant = "primary", disabled = false, loading = false, onClick } = {}) {
    if (label !== undefined) {
      if (this.label) this.label.textContent = String(label);
      else this.button.textContent = String(label);
    }
    this.button.dataset.variant = variant;
    if (onClick !== undefined) this.callback = onClick;
    this.disabled = Boolean(disabled);
    this.setLoading(loading);
    return this;
  }
  setLoading(busy) {
    this.busy = Boolean(busy);
    if (this.loading) this.loading.hidden = !this.busy;
    this.button.disabled = this.disabled || this.busy;
    this.button.setAttribute("aria-busy", String(this.busy));
  }
  destroy() {
    this.controller.abort();
    this.callback = null;
  }
}
export const create = root => new Button(root);
