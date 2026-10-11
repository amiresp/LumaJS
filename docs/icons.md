# Tabler SVG Icon component

The `Icon` component uses a **curated local subset** of the official [Tabler Icons](https://github.com/tabler/tabler-icons) outline SVGs, licensed under MIT by Paweł Kuna. See `third_party/tabler-icons-LICENSE`. No font, CDN, npm dependency, browser build step, or runtime network request is required for icons.

## Playground

Run `npm run playground` and open http://127.0.0.1:8765/examples/icons/ . Search icons by name and click to copy names.

## Standalone rendering

```js
import { createIconElement, renderIcon, iconNames } from
  "/js/dependency/global/GlobalComponents/Icon/Icon.js";
const icon = createIconElement("arrow-left", { size: 20, label: "Back" });
document.querySelector("#back").prepend(icon);
renderIcon(document.querySelector("#status-icon"), "circle-check", {size:22});
```

For decorative icons omit `label`: output uses `aria-hidden=true`. Give the containing button/link an accessible name such as `aria-label="Close"`. Every name is validated against the bundled allowlist; arbitrary SVG/HTML is never accepted.

## Luma component

```html
<div data-luma="Icon" data-icon="home"></div>
```

```js
runtime.register("Icon", {load:() =>
 import("/js/dependency/global/GlobalComponents/Icon/Icon.js")});
await runtime.hydrate();
const component=runtime.instances.get(document.querySelector('[data-luma="Icon"]'));
component.set("arrow-right",{size:24});
```

Theme HTML uses `themes/core-default/dependency/Global/Icon/Icon.html` and CSS with mandatory fallback. Registering `GlobalApp` also registers Icon automatically.

## Packs and naming

`packs/arrows.js`, `navigation.js`, `account.js`, `social.js`, `actions.js`, `utilities.js`, `tools.js`, `misc0.js`, `misc1.js`, and `misc2.js` contain approved official Tabler outline SVGs. These are re-exported through `Icon.js` as `icons` and `iconNames`. All are bundled statically; bundlers may tree-shake only if importing individual packs directly. The public Icon API does not promise per-icon tree shaking.

Useful examples: `arrow-left`, `arrow-up-right`, `chevron-down`, `menu-2`, `credit-card`, `user-circle`, `login`, `logout`, `info-circle`, `alert-triangle`, `wallet`, `currency-dollar`, `language`, `dots`, `brand-telegram`, `brand-whatsapp`, `brand-linkedin`, `brand-youtube`, `brand-facebook`, `home`, `layout-dashboard`, `player-play`, `player-pause`, `search`, `map-pin`, `check`, `square-check`, `square-x`, `plus`, `minus`, `x`, `phone-call`, `edit`, `eye`, `download`, `copy`, `moon`, `sun`, `share`, `zoom-in`, `zoom-out`, `chart-bar`, `clock`, and more.

Aliases: `info` → `info-circle`, `danger` → `alert-triangle`, `hamburger` → `menu-2`, `close` → `x`, `pin` → `map-pin`, `play` → `player-play`, `pause` → `player-pause`, `chart` → `chart-bar`, `back` → `arrow-left`, `forward` → `arrow-right`. Prefer canonical Tabler names in source code.

When updating icon assets, download from the **official Tabler source**, preserve `third_party/tabler-icons-LICENSE`, update this document, verify all SVGs parse and contain no unsafe embedded content, then run `npm run check` and `npm run test:browser`. Avoid auto-loading the entire upstream icon library.
