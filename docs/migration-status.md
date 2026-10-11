# Migration status — original wwwroot compatibility

The original `wwwroot.zip` is the architecture reference. This PR now uses the original **folder conventions**, but **does not yet port the original runtime and behavior**.

## Adopted paths
- `js/core/` — lightweight alpha runtime (`Luma.js`).
- `js/dependency/global/GlobalComponents/Slider/Slider.js`.
- `js/dependency/global/GlobalComponents/Stories/Stories.js`.
- `themes/core-default/dependency/Global/Slider/{Slider.html,Slider.css}`.
- `themes/core-default/dependency/Global/Stories/{Stories.html,Stories.css}`.

## Required next-stage compatibility work (not implemented)
- Port or adapt the actual `BootLoader.js`, `ThemeLoader.js`, `ComponentRegistry.js`, `LibraryManager.js`, `ClientCache.js`, and supporting APIs.
- Preserve existing Feature / Option / Caller / Page directory and runtime contracts.
- Port full Slider and Stories behavior: Swiper adapter, remote data/caller bindings, cache, i18n, image/video lifecycles, progress, pause/resume, multiple story groups, async navigation guards.
- Standardize multi-application isolation for admin/seller/customer/public environments and theme fallback.
- Introduce an optional library/adapter convention under `js/shared/`, retaining native browser execution with no mandatory npm.
- Add automated cross-browser tests and lifecycle regression checks.

## Important constraints
No TypeScript, mandatory Node.js/npm, SSR, Web Components or required build pipeline. Components own their DOM subtree and cleanup. Theme overrides are HTML/CSS only and use stable `data-id` hooks.

**Do not merge this draft as a feature-complete migration.** It is a minimal runnable skeleton with updated paths.


## Structure and documentation update

- Added neutral `GlobalApp` / `GlobalCaller`, Feature/Option/Caller starter contracts and app Pages; these preserve directory responsibilities from `wwwroot.zip`, but do not port all business logic.
- Added `examples/structure/` and standalone `examples/custom-select/`.
- Documented customSelect optional `attr_subtext` / `attr_tokens` searching and remaining advanced widget parity gaps.
- Added offline navigation fallback `offline.html` via opt-in Service Worker; no private API caching.
- Introduced documentation synchronization policy, CI documentation gate and contributor guide.
