# LumaJS architecture (alpha)

LumaJS is a **browser-based, zero-build runtime**. Native ES modules load executable JavaScript. Any HTTP web server can serve the assets. Node.js is recommended for a sample backend, not required by the frontend.

## Boot sequence
1. Load `js/core/Luma.js` from an HTML module script.
2. Register components by name with lazily imported modules.
3. `runtime.hydrate()` scans outermost `[data-luma]` hosts.
4. Runtime requests `themes/<active>/dependency/Global/<Name>/<Name>.html`, falling back to `core-default`.
5. Runtime imports the controller, loads matching CSS with fallback, and invokes `create(root, context)`.
6. The controller returns a destroyable instance. Errors set `data-load-state="error"` and dispatch `luma:error`.
7. `runtime.destroy(scope)` cleans controllers. `runtime.restart(scope)` destroys then mounts them again.

## Ownership
- Runtime: loader, failure isolation, registration, component lifecycle.
- Component controller: behavior and local events, state and DOM within its root.
- Theme: only HTML/CSS presentation; required `data-id` hooks are stable.
- Feature: domain orchestration and imports (future package).
- Caller: backend-specific API requests and data mapping (future package).
- Third-party adapter: optional integration and disposal.

## Current scope and limits
This is an alpha contract demonstrator, **not** a drop-in replacement for the prior `wwwroot` system. It does not include routing, feature/caller integration, SSR, offline cache, dependency graph, Web Components, or TypeScript. Route transitions should explicitly destroy and re-hydrate affected scope. Partial same-origin template files are trusted; arbitrary HTML is unsafe.

## Public API (alpha)
`new Luma(config)`, `register(name,{load,exportName?})`, `hydrate(scope?)`, `mount(host)`, `destroy(scope?)`, `restart(scope?)`.

Controllers export `create(root,context)` returning `{destroy()}`. DOM contract: `data-luma` host, `data-id="root"` and component-defined hooks.


## ZIP-compatible composition examples (2026-10)

The Core stays neutral. Shared `GlobalApp` and `GlobalCaller` live in `js/dependency/global/`; per-domain Feature/Caller is demonstrated under `js/Features/Sample/`; independent Option/Caller under `js/Option/Sample/`; app-specific Pages and routes under `apps/website/pages/` and `routes.js`. See `examples/structure/` and `docs/structure-guide.md`.

`customSelect` is a standalone widget with optional field search, not a themed GlobalComponent; see `docs/custom-select.md`. `offline.html` is the offline navigation fallback for an optionally installed Service Worker, not an automatically enabled offline mode.


## Shared icon infrastructure

`Icon` lives at `js/dependency/global/GlobalComponents/Icon/`. It exposes `createIconElement` and `renderIcon` for existing widgets and a standard lifecycle component `data-luma="Icon"`. The curated official Tabler MIT SVGs ship locally in small source packs. No runtime dependency, icon font or CDN is needed. The `core-default` HTML/CSS fallback applies to Icon like every GlobalComponent. See `docs/icons.md`.
