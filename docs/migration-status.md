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


## Shared UI icon pass

- Added curated official Tabler outline icons under MIT, licensed in `third_party/tabler-icons-LICENSE`.
- New reusable `Icon` component and standalone `createIconElement` / `renderIcon` APIs.
- Replaced text glyph controls in Toast, Alert, Dialog, Slider and Stories with local Tabler icons.
- Added searchable zero-build gallery `examples/icons/` and unit tests for SVG parsing, name coverage, lifecycle and accessible labels.
- Not all 5000+ upstream Tabler icons are included; this is a deliberately curated general-purpose set.

- Enforced data-id-only behavioral selectors across runtime, examples and tests, migrated earlier ID-driven playgrounds, and added `npm run check:hooks` CI guard.


## Starter UI additions

- Introduced eleven general-purpose GlobalComponents with matching core-default templates, lifecycle cleanup and data-id hooks.
- Added interactive examples/starter playground; Node.js behavior and Chromium browser tests.
- Select reuses the existing customSelect; DataGrid supports local filtering/sorting/pagination and is **not** a complete enterprise/server-side grid.
- Documented their API contracts in docs/starter-components.md. Further production accessibility, internationalization, virtualization and server-side integrations are out of scope of this starter pass.


## Runnable Playground hub and admin example

- Added a root `index.html` hub linking starter components, the admin dashboard, the existing media/feedback demo, icons, architecture, customSelect, and the offline page.
- Added a no-login admin dashboard in `examples/admin/` using existing GlobalComponents and in-memory example data, with browser interaction coverage.
- This is a showcase of composition, not a port of a specific legacy admin backend. All example user data and metric values are fictional.


## Shared component consistency fixes

- DataGrid pagination now delegates to the shared Pagination class, and header sort actions use Button.
- Dialog, Toast, Alert, Badge, EmptyState and Sidebar now reuse shared Button instances.
- Select automatically loads customSelect.css and disposes its owned stylesheet when no Select instances remain.
- Admin dashboard switched to global Button instances for quick actions and removed redundant external Pagination for the grid. Browser regression tests and data-id hooks retained.
