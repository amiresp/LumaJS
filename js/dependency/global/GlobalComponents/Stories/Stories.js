/** Story viewer: lifecycle and DOM ownership are restricted to root. */
export class Stories {
  constructor(root, { interval = 6000 } = {}) {
    this.root = root;
    this.interval = interval;
    this.items = [...root.querySelectorAll('[data-id="story-item"]')];
    this.viewer = root.querySelector('[data-id="viewer"]');
    this.index = 0;
    this.paused = false;
    this.muted = true;
    this.remaining = this.interval;
    this.startedAt = 0;
    this.timer = null;
    this.lastFocused = null;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    for (const [id, action] of [["open", () => this.open()], ["close", () => this.close()], ["next", () => this.next()], ["previous", () => this.previous()], ["pause", () => this.togglePause()], ["mute", () => this.toggleMute()]]) {
      root.querySelector(`[data-id="${id}"]`)?.addEventListener("click", action, { signal });
    }
    root.addEventListener("keydown", event => {
      if (this.viewer?.hidden !== false) return;
      if (event.key === "Escape") this.close();
      if (event.key === "ArrowRight") this.next();
      if (event.key === "ArrowLeft") this.previous();
    }, { signal });
    root.ownerDocument.addEventListener("visibilitychange", () => {
      if (root.ownerDocument.hidden) this.pause();
      else if (this.viewer && !this.viewer.hidden) this.resume();
    }, { signal });
    if (this.viewer) this.viewer.hidden = true;
    this.show(0);
  }
  emit(type) { this.root.dispatchEvent(new CustomEvent(`story:${type}`, { detail: { index: this.index }, bubbles: true })); }
  open() {
    if (!this.viewer || !this.items.length) return;
    this.lastFocused = document.activeElement;
    this.viewer.hidden = false;
    this.paused = false;
    this.show(0);
    this.root.querySelector('[data-id="close"]')?.focus();
    this.emit("open");
  }
  show(index) {
    if (!this.items.length) return;
    if (index >= this.items.length) { this.close(); return; }
    this.index = Math.max(0, index);
    this.items.forEach((item, i) => {
      item.hidden = i !== this.index;
      for (const video of item.querySelectorAll("video")) {
        video.muted = this.muted;
        if (i === this.index && !this.paused && this.viewer && !this.viewer.hidden) video.play()?.catch?.(() => {});
        else video.pause();
      }
    });
    const progress = this.root.querySelector('[data-id="progress"]');
    if (progress) progress.textContent = `${this.index + 1} / ${this.items.length}`;
    this.emit("change");
    this.stop();
    const media = this.items[this.index]?.querySelector("video");
    this.remaining = Number(this.items[this.index]?.dataset.duration) || (media?.duration > 0 ? media.duration * 1000 : this.interval);
    if (!this.paused) this.resume();
  }
  pause() {
    if (this.paused) return;
    this.paused = true;
    if (this.timer != null) this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
    this.stop();
    this.items[this.index]?.querySelector("video")?.pause();
  }
  resume() {
    if (!this.viewer || this.viewer.hidden || !this.items.length) return;
    this.paused = false;
    this.startedAt = Date.now();
    const video = this.items[this.index]?.querySelector("video");
    if (video) { video.muted = this.muted; video.play()?.catch?.(() => {}); }
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.stop();
    this.timer = setTimeout(() => this.next(), this.remaining);
  }
  togglePause() { if (this.paused) this.resume(); else this.pause(); }
  toggleMute() {
    this.muted = !this.muted;
    for (const video of this.root.querySelectorAll("video")) video.muted = this.muted;
    this.emit("mute");
  }
  next() { this.show(this.index + 1); }
  previous() { this.show(this.index - 1); }
  stop() { if (this.timer !== null) clearTimeout(this.timer); this.timer = null; }
  close() {
    this.stop();
    this.items[this.index]?.querySelector('video')?.pause();
    if (this.viewer) this.viewer.hidden = true;
    if (this.lastFocused?.isConnected) this.lastFocused.focus();
    this.emit("close");
  }
  destroy() { this.stop(); this.controller.abort(); if (this.viewer) this.viewer.hidden = true; }
}
export function create(root) { return new Stories(root); }
