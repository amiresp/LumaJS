/** Swiper Element based slider; caller stays in Feature/Option/app orchestration. */
const vendorUrl = new URL("../../../../../third_party/swiper/swiper-element-bundle.min.js", import.meta.url);
let registration;
function ensureSwiper() {
  // Lazy registration: importing this file never requires browser globals.
  registration ??= import(vendorUrl.href).catch(error => { registration = undefined; throw error; });
  return registration;
}
function safeURL(raw,doc) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try { const url = new URL(raw,doc.baseURI); return ["http:","https:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
export class SwiperSlider {
  constructor(root) {
    this.root=root;
    this.host=root.querySelector('[data-id="swiper"]');
    this.template=root.querySelector('[data-id="slide-template"]');
    this.status=root.querySelector('[data-id="status"]');
    if (!this.host || !this.template?.content?.querySelector('[data-id="slide"]'))
      throw new Error("SwiperSlider requires data-id=swiper and slide-template with data-id=slide");
    this.controller=new AbortController();
    this.destroyed=false;this.initialized=false;this.items=[];
    this.options={pagination:true,navigation:true,slidesPerView:1,spaceBetween:12,loop:false};
    this.ready=ensureSwiper().then(()=>{
      if(this.destroyed)return;
      this.syncOptions();
      if(!this.initialized){this.host.initialize?.();this.initialized=true;}
    }).catch(error=>{
      if(this.destroyed)return;
      this.status && (this.status.textContent="Unable to initialize slider.");
      this.root.dispatchEvent(new CustomEvent("swiper-slider:error",{detail:{error},bubbles:true}));
    });
  }
  syncOptions(){
    if(this.destroyed)return;
    Object.assign(this.host,this.options);
    if(this.initialized)this.host.swiper?.update?.();
  }
  configure(options={}){
    const permitted=["pagination","navigation","slidesPerView","spaceBetween","loop","speed","autoplay","breakpoints"];
    for(const key of permitted)if(Object.hasOwn(options,key))this.options[key]=options[key];
    this.syncOptions();return this;
  }
  setItems(items=[]){
    if(this.destroyed)return this;
    if(!Array.isArray(items))throw new TypeError("SwiperSlider items must be an array");
    const doc=this.root.ownerDocument;
    const slides=items.map(item=>{
      const node=this.template.content.cloneNode(true);
      const slide=node.querySelector('[data-id="slide"]');
      slide.querySelector('[data-id="title"]').textContent=String(item.title??"");
      slide.querySelector('[data-id="text"]').textContent=String(item.text??"");
      const src=safeURL(item.src,doc),href=safeURL(item.link,doc);
      if(src){
        const img=slide.querySelector(href?'[data-id="image"]':'[data-id="standalone-image"]');
        img.src=src;img.alt=String(item.alt??item.title??"");img.hidden=false;
      }
      if(href){
        const anchor=slide.querySelector('[data-id="link"]');anchor.href=href;anchor.hidden=false;
        if(new URL(href).origin!==doc.location?.origin)anchor.rel="noopener noreferrer";
        if(!src)anchor.textContent=String(item.linkText??"Open");
        else anchor.setAttribute("aria-label",String(item.linkText??item.title??"Open slide"));
      }
      return node;
    });
    this.host.replaceChildren(...slides);
    this.items=[...items];
    if(this.status)this.status.textContent=items.length?"":"No slides available.";
    this.host.swiper?.update?.();
    return this;
  }
  async loadItems(loader,{signal}={}){
    if(typeof loader!=="function")throw new TypeError("SwiperSlider requires an injected loader");
    const active=signal??this.controller.signal;
    if(this.status)this.status.textContent="Loading slides…";
    try{
      const items=await loader({signal:active});
      if(active.aborted||this.destroyed)return;
      this.setItems(items);
      return items;
    }catch(error){
      if(active.aborted||this.destroyed)return;
      if(this.status)this.status.textContent="Unable to load slides.";
      this.root.dispatchEvent(new CustomEvent("swiper-slider:error",{detail:{error},bubbles:true}));
      throw error;
    }
  }
  next(){this.host.swiper?.slideNext?.();}
  previous(){this.host.swiper?.slidePrev?.();}
  destroy(){
    if(this.destroyed)return;
    this.destroyed=true;this.controller.abort();
    this.host.swiper?.destroy?.(true,true);
    this.items=[];
  }
}
export const create=root=>new SwiperSlider(root);
