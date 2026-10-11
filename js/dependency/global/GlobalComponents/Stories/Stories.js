/** Story viewer: lifecycle and DOM ownership are restricted to root. */
export class Stories {
  constructor(root, { interval = 6000 } = {}) {
    this.root = root;
    this.interval = interval;
    this.items = [...root.querySelectorAll('[data-id="story-item"]')];
    this.galleries = [];
    this.galleryIndex = 0;
    this.progressFrame = null;
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
    this.cancelProgress();
    const media = this.items[this.index]?.querySelector("video");
    this.remaining = Number(this.items[this.index]?.dataset.duration) || (media?.duration > 0 ? media.duration * 1000 : this.interval);
    this.updateProgress();
    if (!this.paused) this.resume();
  }
  /**
   * Supply gallery-agnostic media data; render using safe DOM APIs.
   * Item: {src, type:'image'|'video', alt, duration, title}.
   */
  setGalleries(galleries = []) {
    if (!Array.isArray(galleries)) throw new TypeError("Galleries must be an array");
    this.close();
    this.galleries = galleries.map(gallery => ({
      title: String(gallery.title ?? ""),
      items: Array.isArray(gallery.items) ? gallery.items : []
    }));
    this.galleryIndex = 0;
    this.setGallery(0);
  }
  setGallery(index) {
    const gallery = this.galleries[index];
    if (!gallery) return;
    this.galleryIndex = index;
    const container = this.root.querySelector('[data-id="story-items"]') || this.viewer;
    for (const item of [...container.querySelectorAll('[data-id="story-item"]')]) item.remove();
    const doc = this.root.ownerDocument;
    for (const data of gallery.items) {
      const element = doc.createElement("article");
      element.dataset.id = "story-item";
      if (Number.isFinite(data.duration) && data.duration > 0) element.dataset.duration = String(data.duration);
      if (data.type === "video" || data.type === "image") {
        const media = doc.createElement(data.type === "video" ? "video" : "img");
        const raw = String(data.src ?? "");
        const url = new URL(raw, doc.baseURI);
        if (url.protocol === "https:" || url.protocol === "http:") media.src = url.href;
        media.setAttribute("aria-label", String(data.alt ?? data.title ?? ""));
        if (media.tagName === "VIDEO") { media.playsInline = true; media.muted = this.muted; media.preload = "metadata"; }
        element.append(media);
      }
      const caption = doc.createElement("p");
      caption.textContent = String(data.title ?? "");
      element.append(caption);
      container.append(element);
    }
    this.items = [...container.querySelectorAll('[data-id="story-item"]')];
    this.show(0);
  }
  nextGallery() { if (this.galleryIndex + 1 < this.galleries.length) this.setGallery(this.galleryIndex + 1); else this.close(); }
  previousGallery() { if (this.galleryIndex > 0) this.setGallery(this.galleryIndex - 1); }
  updateProgress() {
    const progress = this.root.querySelector('[data-id="progress-bar"]');
    if (!progress) return;
    const fraction = this.interval > 0 ? Math.min(1, Math.max(0, 1 - this.remaining / this.interval)) : 0;
    progress.style.setProperty("--luma-progress", String(fraction));
  }
  cancelProgress() {
    if (this.progressFrame != null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this.progressFrame);
    this.progressFrame = null;
  }
  pause() {
    if (this.paused) return;
    this.paused = true;
    if (this.timer != null) this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
    this.stop();
    this.cancelProgress();
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
  destroy() { this.cancelProgress(); this.stop(); this.controller.abort(); if (this.viewer) this.viewer.hidden = true; }
}
export function create(root) { return new Stories(root); }
