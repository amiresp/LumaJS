/** Slider: selectors are data-id hooks, never class or id. */
export class Slider {
  constructor(root, { interval = 5000, autoplay = false, loop = true } = {}) {
    this.root = root;
    const attr = root.dataset;
    this.interval = Number(attr.autoplayDelay) > 0 ? Number(attr.autoplayDelay) : interval;
    this.speed = Math.max(0, Number(attr.speed) || 650);
    this.navigation = attr.navigation !== "false";
    this.pagination = attr.pagination !== "false";
    this.paginationClickable = attr.paginationClickable !== "false";
    this.disableOnInteraction = attr.autoplayDisableOnInteraction === "true";
    this.slidesPerView = Math.max(1, Number(attr.slidesPerView) || 1);
    this.spaceBetween = Math.max(0, Number(attr.spaceBetween) || 0);
    this.effect = ["slide","fade"].includes(attr.effect) ? attr.effect : "slide";
    this.breakpoints = {};
    this.maxItems = Math.max(0, Number(attr.maxItems) || 0);
    this.galleryType = attr.galleryType || 'Slider';
    this.autoplay = autoplay;
    this.paused = false;
    this.observer = null;
    this.visibleVideos = new Set();
    this.swipeStart = null;
    this.loop = attr.loop === undefined ? loop : attr.loop !== "false";
    this.autoplay = attr.autoplay === undefined ? this.autoplay : attr.autoplay !== "false";
    this.index = 0;
    this.timer = null;
    this.controller = new AbortController();
    this.slides = [...root.querySelectorAll('[data-id="slide"]')];
    const signal = this.controller.signal;
    root.querySelector('[data-id="next"]')?.addEventListener("click", () => this.interact("next"), { signal });
    root.querySelector('[data-id="pagination"]')?.addEventListener("click", event => {
      const button=event.target.closest('[data-id="page"]');
      if (button && this.paginationClickable) this.interact(Number(button.dataset.index));
    },{signal});
    root.querySelector('[data-id="previous"]')?.addEventListener("click", () => this.interact("previous"), { signal });
    root.addEventListener("keydown", event => {
      if (event.key === "ArrowRight") this.interact("next");
      if (event.key === "ArrowLeft") this.interact("previous");
    }, { signal });
    root.addEventListener("pointerdown", event => {
      if(event.target.closest("button, a, input, textarea, select"))return;
      this.swipeStart={x:event.clientX,y:event.clientY};
    }, { signal });
    root.addEventListener("pointerup", event => {
      if(!this.swipeStart)return;
      const dx=event.clientX-this.swipeStart.x;
      const dy=event.clientY-this.swipeStart.y;
      this.swipeStart=null;
      if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.25) this.interact(dx<0?"next":"previous");
    }, { signal });
    root.addEventListener("pointercancel", () => {this.swipeStart=null;}, {signal});
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
    this.applyOptions();
    this.show(0);
    this.start();
  }
  show(index) {
    if (!this.slides.length) return;
    this.index = this.loop ? (index % this.slides.length + this.slides.length) % this.slides.length : Math.max(0, Math.min(index, this.slides.length - 1));
    const count=this.activeSlidesPerView();
    this.slides.forEach((slide,i)=>{
      const offset=(i-this.index+this.slides.length)%this.slides.length;
      const visible=this.loop ? offset<count : i>=this.index && i<this.index+count;
      slide.hidden=!visible;
      slide.setAttribute("aria-hidden",String(!visible));
      slide.style.setProperty("--luma-slide-spacing",this.spaceBetween+"px");
      slide.style.setProperty("--luma-slide-speed",this.speed+"ms");
      slide.dataset.effect=this.effect;
    });
    this.renderPagination();
    this.syncMedia();
    const counter = this.root.querySelector('[data-id="counter"]');
    if (counter) counter.textContent = `${this.index + 1} / ${this.slides.length}`;
    this.root.dispatchEvent(new CustomEvent("slider:change", { detail: { index: this.index }, bubbles: true }));
  }
  activeSlidesPerView() {
    const width=this.root.getBoundingClientRect?.().width||0;
    let per=this.slidesPerView;
    for(const [breakpoint,opts] of Object.entries(this.breakpoints)) {
      if(width>=Number(breakpoint)&&Number(opts.slidesPerView)>0)per=Number(opts.slidesPerView);
    }
    return Math.max(1,Math.floor(per));
  }
  configure(options={}) {
    for(const key of ["speed","spaceBetween","interval","slidesPerView"])
      if(options[key]!==undefined&&Number.isFinite(Number(options[key])))this[key]=Math.max(0,Number(options[key]));
    for(const key of ["loop","autoplay","pagination","navigation","paginationClickable","disableOnInteraction"])
      if(typeof options[key]==="boolean")this[key]=options[key];
    if(options.effect&&["slide","fade"].includes(options.effect))this.effect=options.effect;
    if(options.breakpoints&&typeof options.breakpoints==="object")this.breakpoints=options.breakpoints;
    this.applyOptions();this.show(this.index);this.start();return this;
  }
  applyOptions() {
    const controls=this.root.querySelector('[data-id="controls"]');
    if(controls)controls.hidden=!this.navigation;
    const pages=this.root.querySelector('[data-id="pagination"]');
    if(pages)pages.hidden=!this.pagination;
  }
  renderPagination() {
    const host=this.root.querySelector('[data-id="pagination"]');
    if(!host||!this.pagination)return;
    host.replaceChildren();
    for(let i=0;i<this.slides.length;i++){
      const button=this.root.ownerDocument.createElement("button");
      button.type="button";button.dataset.id="page";button.dataset.index=String(i);
      button.setAttribute("aria-label","Go to slide "+(i+1));
      button.setAttribute("aria-current",String(this.index===i));
      host.append(button);
    }
  }
  interact(action) {
    if(action==="next")this.next();
    else if(action==="previous")this.previous();
    else this.show(action);
    if(this.disableOnInteraction)this.pause();else this.start();
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
    const selected = this.maxItems ? items.slice(0,this.maxItems) : items;
    const nodes = selected.map(item => {
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
        if(item.type==="image")media.loading="lazy";
        if(item.type==="video" && item.poster){
          try { const poster=new URL(String(item.poster),doc.baseURI);if(["https:","http:"].includes(poster.protocol))media.poster=poster.href; } catch {}
        }
        if (media.tagName === "VIDEO") { media.muted = true; media.playsInline = true; media.preload = "metadata"; }
        slide.append(media);
      }
      const title = doc.createElement("h2"); title.textContent = String(item.title ?? "");
      const paragraph = doc.createElement("p"); paragraph.textContent = String(item.text ?? "");
      slide.append(title, paragraph);
      if(item.overlay){
        const shade=doc.createElement("div");shade.dataset.id="slider-shade";shade.className="luma-slider-shade";slide.prepend(shade);
      }
      if(item.link){
        try {
          const href=new URL(String(item.link),doc.baseURI);
          if(["http:","https:"].includes(href.protocol)){
            const anchor=doc.createElement("a");anchor.href=href.href;anchor.dataset.id="slider-link";
            anchor.textContent=String(item.linkText??"Learn more");
            if(href.origin!==doc.location?.origin)anchor.rel="noopener noreferrer";
            slide.append(anchor);
          }
        }catch {}
      }
      return slide;
    });
    this.setSlides(nodes);
  }
  async loadItems(loader,{signal}={}) {
    if(typeof loader!=="function")throw new TypeError("loadItems requires a function");
    const data=await loader({galleryType:this.galleryType,maxItems:this.maxItems,signal});
    if(signal?.aborted)return;
    if(!Array.isArray(data))throw new TypeError("Gallery loader must return an array");
    this.setItems(data);
    return data;
  }
  pause() { this.paused = true; this.stop(); this.syncMedia(); }
  resume() { this.paused = false; this.start(); this.syncMedia(); }
  next() { this.show(this.index + 1); }
  previous() { this.show(this.index - 1); }
  start() {
    this.stop();
    if (this.paused || !this.autoplay || this.slides.length < 2 || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    this.timer = setInterval(() => this.next(), this.interval);
  }
  stop() { if (this.timer !== null) clearInterval(this.timer); this.timer = null; }
  destroy() { this.pause(); this.controller.abort(); this.observer?.disconnect(); }
}
export function create(root) { return new Slider(root, { autoplay: true }); }
