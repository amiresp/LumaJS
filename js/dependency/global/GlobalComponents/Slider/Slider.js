/** Slider: selectors are data-id hooks, never class or id. */
export class Slider {
  constructor(root, { interval = 5000, autoplay = false, loop = true } = {}) {
    this.root = root;
    this.interval = interval;
    this.autoplay = autoplay;
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
    this.show(0);
    this.start();
  }
  show(index) {
    if (!this.slides.length) return;
    this.index = this.loop ? (index % this.slides.length + this.slides.length) % this.slides.length : Math.max(0, Math.min(index, this.slides.length - 1));
    this.slides.forEach((slide, i) => { slide.hidden = i !== this.index; slide.setAttribute("aria-hidden", String(i !== this.index)); });
    const counter = this.root.querySelector('[data-id="counter"]');
    if (counter) counter.textContent = `${this.index + 1} / ${this.slides.length}`;
    this.root.dispatchEvent(new CustomEvent("slider:change", { detail: { index: this.index }, bubbles: true }));
  }
  next() { this.show(this.index + 1); }
  previous() { this.show(this.index - 1); }
  start() {
    this.stop();
    if (!this.autoplay || this.slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.timer = setInterval(() => this.next(), this.interval);
  }
  stop() { if (this.timer !== null) clearInterval(this.timer); this.timer = null; }
  destroy() { this.stop(); this.controller.abort(); }
}
export function create(root) { return new Slider(root, { autoplay: true }); }
