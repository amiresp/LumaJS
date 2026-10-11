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
