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
    this.currentDuration = this.interval;
    this.startedAt = 0;
    this.timer = null;
    this.lastFocused = null;
    this.destroyed = false;
    this.unlockScroll = null;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    for (const [id, action] of [["open", () => this.open()], ["close", () => this.close()], ["next", () => this.next()], ["previous", () => this.previous()], ["pause", () => this.togglePause()], ["mute", () => this.toggleMute()]]) {
      root.querySelector(`[data-id="${id}"]`)?.addEventListener("click", action, { signal });
    }
    root.querySelector('[data-id="gallery-list"]')?.addEventListener("click", event => {
      const button = event.target.closest('[data-id="gallery-button"]');
      if (!button) return;
      const index = Number(button.dataset.galleryIndex);
      if (Number.isInteger(index)) { this.setGallery(index); this.open(); }
    }, { signal });
    root.ownerDocument.addEventListener("keydown", event => {
      if (this.viewer?.hidden !== false) return;
      if (event.key === "Escape") { event.preventDefault(); this.close(); }
      if (event.key === " " && !["INPUT","TEXTAREA","BUTTON"].includes(event.target?.tagName)) { event.preventDefault(); this.togglePause(); }
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
    if (!this.viewer || !this.items.length || this.destroyed) return;
    if (!this.viewer.hidden) return;
    this.lastFocused = this.root.ownerDocument.activeElement;
    const body = this.root.ownerDocument.body;
    const oldOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    this.unlockScroll = () => {body.style.overflow = oldOverflow;};
    this.viewer.hidden = false;
    this.paused = false;
    this.remaining = this.interval;
    this.show(0);
    this.root.querySelector('[data-id="close"]')?.focus();
    this.renderTimeline();
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
    this.currentDuration = this.remaining;
    this.renderTimeline();
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
      items: Array.isArray(gallery.items) ? gallery.items : [],
      cover: gallery.cover, avatar: gallery.avatar
    }));
    this.galleryIndex = 0;
    const picker = this.root.querySelector('[data-id="gallery-list"]');
    if (picker) {
      picker.replaceChildren();
      this.galleries.forEach((gallery,index) => {
        const button = this.root.ownerDocument.createElement("button");
        button.type = "button"; button.dataset.id = "gallery-button";
        button.dataset.galleryIndex = String(index);
        button.textContent = gallery.title || String(index + 1);
        picker.append(button);
      });
    }
    this.setGallery(0);
    this.renderGalleryButtons();
  }
  setGallery(index) {
    const gallery = this.galleries[index];
    if (!gallery) return;
    this.galleryIndex = index;
    const title=this.root.querySelector('[data-id="viewer-title"]');
    if(title)title.textContent=gallery.title;
    this.root.querySelectorAll('[data-id="gallery-button"]').forEach(button => {
      button.setAttribute("aria-current", String(Number(button.dataset.galleryIndex) === index));
    });
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
    this.renderGalleryButtons();
  }
  renderGalleryButtons() {
    const rail = this.root.querySelector('[data-id="gallery-list"]');
    if (!rail) return;
    const doc = this.root.ownerDocument;
    rail.replaceChildren();
    for (let i=0;i<this.galleries.length;i++) {
      const gallery=this.galleries[i];
      const button=doc.createElement("button");button.type="button";
      button.dataset.id="gallery-button";button.dataset.galleryIndex=String(i);
      button.setAttribute("aria-label", "Open "+gallery.title);
      button.setAttribute("aria-current",String(i===this.galleryIndex));
      const ring=doc.createElement("span");ring.className="luma-story-avatar-ring";
      const photo=doc.createElement("span");photo.className="luma-story-avatar-photo";
      const raw=gallery.cover||gallery.avatar||gallery.items.find(x=>x.type==="image")?.src;
      try {if(raw){const url=new URL(String(raw),doc.baseURI);if(["http:","https:"].includes(url.protocol)){const img=doc.createElement("img");img.src=url.href;img.alt="";photo.append(img);}}}catch{}
      if(!photo.childNodes.length)photo.textContent=gallery.title.slice(0,1)||"✦";
      ring.append(photo);
      const label=doc.createElement("span");label.className="luma-story-avatar-label";label.textContent=gallery.title;
      button.append(ring,label);rail.append(button);
    }
  }
  renderTimeline() {
    const host=this.root.querySelector('[data-id="progress-segments"]');
    if(!host)return;
    host.replaceChildren();
    for(let i=0;i<this.items.length;i++){
      const segment=this.root.ownerDocument.createElement("span");segment.className="luma-story-segment";
      const fill=this.root.ownerDocument.createElement("span");fill.className="luma-story-segment-fill";
      fill.style.setProperty("--luma-story-progress",String(i<this.index?1:0));
      segment.append(fill);host.append(segment);
    }
  }
  nextGallery() { if (this.galleryIndex + 1 < this.galleries.length) this.setGallery(this.galleryIndex + 1); else this.close(); }
  previousGallery() { if (this.galleryIndex > 0) this.setGallery(this.galleryIndex - 1); }
  updateProgress() {
    const progress = this.root.querySelector('[data-id="progress-bar"]');
    const fills=[...this.root.querySelectorAll('.luma-story-segment-fill')];
    if(!progress && !fills.length)return;
    const elapsed = this.paused || this.timer == null ? 0 : Date.now() - this.startedAt;
    const fraction = this.currentDuration > 0 ?
      Math.min(1, Math.max(0, 1 - (this.remaining - elapsed) / this.currentDuration)) : 0;
    progress?.style.setProperty("--luma-progress", String(fraction));
    progress?.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
    progress?.setAttribute("aria-valuemin", "0");
    progress?.setAttribute("aria-valuemax", "100");
    fills.forEach((el,i)=>el.style.setProperty("--luma-story-progress",String(i<this.index?1:i===this.index?fraction:0)));
    if (this.viewer && !this.viewer.hidden && !this.paused && typeof requestAnimationFrame === "function") {
      this.progressFrame = requestAnimationFrame(() => this.updateProgress());
    }
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
    this.cancelProgress();
    this.timer = setTimeout(() => this.next(), this.remaining);
    this.updateProgress();
  }
  togglePause() { if (this.paused) this.resume(); else this.pause(); }
  toggleMute() {
    this.muted = !this.muted;
    for (const video of this.root.querySelectorAll("video")) video.muted = this.muted;
    this.emit("mute");
  }
  next() { if(this.index+1>=this.items.length && this.galleryIndex+1<this.galleries.length) this.setGallery(this.galleryIndex+1); else this.show(this.index+1); }
  previous() { if(this.index===0 && this.galleryIndex>0){this.setGallery(this.galleryIndex-1);this.show(this.items.length-1);} else this.show(this.index-1); }
  stop() { if (this.timer !== null) clearTimeout(this.timer); this.timer = null; }
  close() {
    this.stop();
    this.cancelProgress();
    this.unlockScroll?.();this.unlockScroll=null;
    this.items[this.index]?.querySelector('video')?.pause();
    if (this.viewer) this.viewer.hidden = true;
    if (this.lastFocused?.isConnected) this.lastFocused.focus();
    this.emit("close");
  }
  destroy() { if(this.destroyed)return;this.destroyed=true;this.close();this.controller.abort(); }
}
export function create(root) { return new Stories(root); }
