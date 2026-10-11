# Public Slider and Stories contracts

Both widgets use plain JavaScript and support optional theme HTML/CSS with stable `data-id` selectors; there is no flight, city or backend data dependency.

## Slider

`new Slider(root, { autoplay, interval, loop })`
- `show(index)`, `next()`, `previous()`, `pause()`, `resume()`, `destroy()`.
- `setItems([{ type: "image"|"video", src, title, text, alt }])`: builds safe DOM nodes; needs `data-id="slides"` host.
- `setSlides([...DOMNodes])`: advanced user-controlled DOM nodes. Caller must ensure they are trusted.
- Automatic browser visibility handling, reduced-motion checks, video visibility observer (where supported), and playback cleanup.
- Events: `slider:change` bubbling with `detail.index`.

## Stories

`new Stories(root, { interval })`
- `open()`, `close()`, `show(index)`, `next()`, `previous()`, `pause()`, `resume()`, `toggleMute()`, `destroy()`.
- `setGalleries([{title, items:[{type:"image"|"video", src, alt, title, duration}]}])`.
- `setGallery(index)`, `nextGallery()`, `previousGallery()`.
- Optional `data-id="gallery-list"` and `data-id="progress-bar"` in the theme.
- Bubble events `story:open`, `story:change`, `story:close`, `story:mute`.
- Safe DOM-only user content rendering, no injected remote HTML.

## Scope of migration

This is a **general-purpose feature implementation**, NOT one-to-one parity with the original `wwwroot` widgets. The old implementation used Swiper, API-specific galleries, rich localized overlays/tooltips and cache versioning; those specifics are intentionally not copied. Additional optional adapters and accessibility tests are needed before promising feature parity. Theme fallback to `core-default` is mandatory at runtime.

Legacy BindEngine was removed by project decision; integrations must use component APIs or safe DOM methods.

## Immersive Stories viewer

The default `core-default` theme now renders the viewer as a full-viewport overlay with a dark backdrop. On mobile the media stage fills the viewport, while larger screens show a centered 9:16-style stage against the backdrop. Every gallery is represented by a circular picture with a gradient ring. Supply `cover` or `avatar` on each gallery; if absent, an image from the gallery is used, then a letter placeholder.

```js
stories.setGalleries([
  {title:"Highlights", cover:"/images/highlights.jpg", items:[
    {type:"image", src:"/images/story-1.jpg", duration:5000, title:"First"},
    {type:"video", src:"/videos/story-2.mp4", title:"Second"}
  ]}
]);
```

The segmented timeline displays a bar per story, updates with elapsed playback time, and resumes after pause. Tap/click the left or right sides of the stage to navigate; use Escape or Close to exit. Opening prevents body scrolling and closing restores it. Video mute/pause controls remain available. Theme overrides must preserve the documented `data-id` hooks.

## Slider configuration compared with the legacy ZIP

Original `wwwroot` used Swiper with `slides-per-view="1"`, `loop="true"`, `speed="650"`, `autoplay-delay="6000"`, pagination, navigation and clickable pagination. This zero-dependency component offers compatible *basic* controls through HTML `data-*` options, but **does not embed Swiper or claim identical transitions/events**.

```html
<section data-id="root" data-autoplay="true" data-autoplay-delay="6000"
  data-loop="true" data-speed="650" data-slides-per-view="1"
  data-pagination="true" data-pagination-clickable="true"
  data-navigation="true" data-effect="fade"></section>
```

Via JS:

```js
slider.configure({
  autoplay:true, interval:6000, loop:true, speed:650,
  pagination:true, paginationClickable:true, navigation:true,
  slidesPerView:1, spaceBetween:12,
  breakpoints:{"768":{slidesPerView:2}}
});
slider.setItems([
  {type:"image",src:"/images/banner.webp",title:"New collection",
    link:"/products",linkText:"Explore",overlay:true},
  {type:"video",src:"/videos/intro.mp4",poster:"/images/intro.webp"}
]);
// An app supplies its own caller; no business schema is baked into Core.
await slider.loadItems(async ({galleryType,maxItems,signal}) =>
  await fetch("/api/galleries?type="+encodeURIComponent(galleryType),{signal}).then(r=>r.json())
);
```

The `loadItems` callback is responsible for validating/normalizing API data to the generic slide array shape. Autoplay pause on hover/focus, reduced-motion handling, media cleanup and safe public URL checks are built in. Remaining parity gaps include native Swiper's swipe gestures, shadow DOM features and slide transition engine; add an optional Swiper adapter rather than making it mandatory in Core.
