/** Story viewer: lifecycle and DOM ownership are restricted to root. */
export class Story {
  constructor(root, { interval = 6000 } = {}) {
    this.root = root;
    this.interval = interval;
    this.items = [...root.querySelectorAll('[data-id="story-item"]')];
    this.viewer = root.querySelector('[data-id="viewer"]');
    this.index = 0;
    this.timer = null;
    this.lastFocused = null;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    for (const [id, action] of [["open", () => this.open()], ["close", () => this.close()], ["next", () => this.next()], ["previous", () => this.previous()]]) {
      root.querySelector(`[data-id="${id}"]`)?.addEventListener("click", action, { signal });
    }
    root.addEventListener("keydown", event => {
      if (this.viewer?.hidden !== false) return;
      if (event.key === "Escape") this.close();
      if (event.key === "ArrowRight") this.next();
      if (event.key === "ArrowLeft") this.previous();
    }, { signal });
    if (this.viewer) this.viewer.hidden = true;
    this.show(0);
  }
  emit(type) { this.root.dispatchEvent(new CustomEvent(`story:${type}`, { detail: { index: this.index }, bubbles: true })); }
  open() {
    if (!this.viewer || !this.items.length) return;
    this.lastFocused = document.activeElement;
    this.viewer.hidden = false;
    this.show(0);
    this.root.querySelector('[data-id="close"]')?.focus();
    this.emit("open");
  }
  show(index) {
    if (!this.items.length) return;
    if (index >= this.items.length) { this.close(); return; }
    this.index = Math.max(0, index);
    this.items.forEach((item, i) => { item.hidden = i !== this.index; });
    const progress = this.root.querySelector('[data-id="progress"]');
    if (progress) progress.textContent = `${this.index + 1} / ${this.items.length}`;
    this.emit("change");
    this.stop();
    if (this.viewer && !this.viewer.hidden && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.timer = setTimeout(() => this.next(), this.interval);
    }
  }
  next() { this.show(this.index + 1); }
  previous() { this.show(this.index - 1); }
  stop() { if (this.timer !== null) clearTimeout(this.timer); this.timer = null; }
  close() {
    this.stop();
    if (this.viewer) this.viewer.hidden = true;
    if (this.lastFocused?.isConnected) this.lastFocused.focus();
    this.emit("close");
  }
  destroy() { this.stop(); this.controller.abort(); if (this.viewer) this.viewer.hidden = true; }
}
export function create(root) { return new Story(root); }
