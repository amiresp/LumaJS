# Creating a LumaJS Component

Create these three files while preserving the exact matching names:

```text
js/dependency/global/GlobalComponents/Counter/Counter.js
themes/core-default/dependency/Global/Counter/Counter.html
themes/core-default/dependency/Global/Counter/Counter.css
```

**Counter.html**

```html
<section data-id="root">
  <button type="button" data-id="increment">Increase</button>
  <output data-id="value" aria-live="polite">0</output>
</section>
```

**Counter.js**

```js
export class Counter {
  constructor(root) {
    this.root = root;
    this.count = 0;
    this.controller = new AbortController();
    root.querySelector('[data-id="increment"]').addEventListener("click", () => {
      root.querySelector('[data-id="value"]').textContent = String(++this.count);
    }, {signal: this.controller.signal});
  }
  destroy() { this.controller.abort(); }
}
export const create = root => new Counter(root);
```

**Counter.css** controls the presentation only. Never select behavior elements by CSS class or database-specific IDs.

Mount it in a page:

```html
<div data-luma="Counter"></div>
<script type="module">
import {Luma} from "/js/core/Luma.js";
const runtime = new Luma({base:"/",theme:"your-theme"});
runtime.register("Counter",{load:()=>import("/js/dependency/global/GlobalComponents/Counter/Counter.js")});
await runtime.hydrate();
window.addEventListener("pagehide",()=>void runtime.destroy(),{once:true});
</script>
```

If `your-theme` has no Counter.html, the default HTML from **core-default** is loaded automatically. Keep `data-id` contract stable across skins. `create(root)` must return an object with an idempotent `destroy()`; clean timers, network requests, subscriptions, observers and listeners.

Do not inject API values via `innerHTML`: render untrusted data with `textContent`, validated attributes or safe DOM nodes. Components must be backend agnostic and tested in DOM and real browsers.

For architecture examples see `examples/structure/`, `js/Features/Sample/`, `js/Option/Sample/`, `apps/website/pages/`, `js/dependency/global/GlobalApp.js` and `GlobalCaller.js`. Standalone customSelect uses `js/shared/widgets/customSelect/` instead of the themed global pattern.


## Using shared Tabler icons

For a control, import `createIconElement` from `../Icon/Icon.js` (adjust relative paths) and append the returned SVG. Give buttons their own `aria-label`, and keep the icon decorative unless a readable label is required. Avoid arbitrary SVG strings, external icon fonts and CDN calls. See `docs/icons.md`.
