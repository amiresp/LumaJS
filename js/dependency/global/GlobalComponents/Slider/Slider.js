/** Slider: selectors are data-id hooks, never class or id. */
export class Slider {
  constructor(root, { interval = 5000, autoplay = false, loop = true } = {}) {
    this.root = root;
    this.interval = interval;
    this.autoplay = autoplay;
    this.paused = false;
    this.observer = null;
    this.visibleVideos = new Set();
    this.loop = loop;
    this.index = 0;
    this.timer = null;
    this.controller = new AbortController();
    this.slides = [...root.querySelectorAll('[data-id="slide"]')];
    const signal = this.controller.signal;
    root.querySelector('[data-id="next"]')?.addEventListener("click", () => this.next(), { signal });
    root.querySelector('[data-id="previous"]')?.addEventListener("click", () => this.previous(), { signal });
    root.addEventListener("keydown", event => {
      if (event.key === "ArrowRight") this.next();
      if (event.key === "ArrowLeft") this.previous();
    }, { signal });
    root.addEventListener("mouseenter", () => this.stop(), { signal });
    root.addEventListener("mouseleave", () => this.start(), { signal });
    root.addEventListener("focusin", () => this.stop(), { signal });
    root.addEventListener("focusout", event => { if (!root.contains(event.relatedTarget)) this.start(); }, { signal });
    root.ownerDocument.addEventListener("visibilitychange", () => {
      if (root.ownerDocument.hidden) this.stop(); else this.start();
      this.syncMedia();
    }, { signal });
    if (typeof IntersectionObserver === "function") {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) this.visibleVideos.add(entry.target);
          else this.visibleVideos.delete(entry.target);
        });
        this.syncMedia();
      }, { threshold: 0.5 });
      this.observeVideos();
    }
    this.show(0);
    this.start();
  }
  show(index) {
    if (!this.slides.length) return;
    this.index = this.loop ? (index % this.slides.length + this.slides.length) % this.slides.length : Math.max(0, Math.min(index, this.slides.length - 1));
    this.slides.forEach((slide, i) => { slide.hidden = i !== this.index; slide.setAttribute("aria-hidden", String(i !== this.index)); });
    this.syncMedia();
    const counter = this.root.querySelector('[data-id="counter"]');
    if (counter) counter.textContent = `${this.index + 1} / ${this.slides.length}`;
    this.root.dispatchEvent(new CustomEvent("slider:change", { detail: { index: this.index }, bubbles: true }));
  }
  observeVideos() {
    this.observer?.disconnect();
    this.visibleVideos.clear();
    if (this.observer) {
      this.slides.flatMap(slide => [...slide.querySelectorAll("video")])
        .forEach(video => this.observer.observe(video));
    }
  }
  syncMedia() {
    this.slides.forEach((slide, i) => {
      for (const video of slide.querySelectorAll("video")) {
        if (i === this.index && !this.paused && !this.root.ownerDocument.hidden && (!this.observer || this.visibleVideos.has(video))) {
          video.muted = true;
          const playing = video.play();
          playing?.catch?.(() => {});
        } else video.pause();
      }
    });
  }
  setSlides(nodes) {
    const host = this.root.querySelector('[data-id="slides"]');
    if (!host) throw new Error("Missing data-id=slides");
    host.replaceChildren(...nodes);
    this.slides = [...host.querySelectorAll('[data-id="slide"]')];
    this.observeVideos();
    this.show(0);
  }
  /**
   * Data-driven slides; no backend-specific response shape.
   * { title, text, src, alt, type:'image'|'video', link }
   */
  setItems(items = []) {
    const doc = this.root.ownerDocument;
    if (!Array.isArray(items)) throw new TypeError("Slider items must be an array");
    const nodes = items.map(item => {
      const slide = doc.createElement("section");
      slide.dataset.id = "slide";
      if (item.type === "image" || item.type === "video") {
        const media = doc.createElement(item.type === "video" ? "video" : "img");
        const src = String(item.src ?? "");
        try {
          const url = new URL(src, doc.baseURI);
          if (["http:", "https:"].includes(url.protocol)) media.src = url.href;
        } catch { /* Skip invalid media URL. */ }
        media.setAttribute("aria-label", String(item.alt ?? ""));
        if (media.tagName === "VIDEO") { media.muted = true; media.playsInline = true; media.preload = "metadata"; }
        slide.append(media);
      }
      const title = doc.createElement("h2"); title.textContent = String(item.title ?? "");
      const paragraph = doc.createElement("p"); paragraph.textContent = String(item.text ?? "");
      slide.append(title, paragraph);
      return slide;
    });
    this.setSlides(nodes);
  }
  pause() { this.paused = true; this.stop(); this.syncMedia(); }
  resume() { this.paused = false; this.start(); this.syncMedia(); }
  next() { this.show(this.index + 1); }
  previous() { this.show(this.index - 1); }
  start() {
    this.stop();
    if (this.paused || !this.autoplay || this.slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.timer = setInterval(() => this.next(), this.interval);
  }
  stop() { if (this.timer !== null) clearInterval(this.timer); this.timer = null; }
  destroy() { this.pause(); this.controller.abort(); this.observer?.disconnect(); }
}
export function create(root) { return new Slider(root, { autoplay: true }); }
