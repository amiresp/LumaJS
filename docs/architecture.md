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

Behavioral DOM selectors use `data-id` exclusively; component hosts use `data-luma`. No class selectors, DOM ID selectors or `getElementById` should be used to bind UI behavior. `npm run check:hooks` enforces the rule on runtime, examples and tests.


## General starter UI layer

Eleven additional optional components reside in `js/dependency/global/GlobalComponents/`: EmptyState, Loading, Button, DataGrid, Select, Sidebar, Breadcrumb, Pagination, Card, Accordion, Badge. Each has matching core-default HTML/CSS. GlobalApp registers them lazily. Select uses the standalone customSelect via adapter; DataGrid is local-data only. See `docs/starter-components.md` and `examples/starter/`. No dependencies are added to Core.


## Playground front door / example admin (PR #8)

`index.html` is a lightweight directory of demos served by the Node static playground at `/`. `examples/admin/index.html` is an explicitly unauthenticated, in-memory demonstration combining GlobalApp and the existing starter components; it is not the app's auth system or a production admin template. The dashboard does not add any endpoint, session, or route into Core. All DOM behavior uses `data-id` and component hosts `data-luma`. See `docs/admin-playground.md`.


## Composition of shared controls

Shared UI primitives may be composed by JavaScript class instances where nesting separate runtime mounts is unnecessary. Button accepts an existing semantic button as well as its themed root; Dialog/Toast/Alert/Badge/EmptyState/Sidebar and DataGrid use it. DataGrid internally owns a Pagination instance and destroys it with the grid. Select obtains its CSS through a module-relative URL with document-scoped reference counting, making it functional outside demos. This avoids duplicate grids/pagination and keeps Core neutral. See docs/starter-components.md.


## Starter UI visual composition

DataGrid column headers use accessible focusable non-button sorting labels rather than the visually prominent global Button component; its Pagination remains shared. Button's ghost variant is the standard background-free control for icon-only dismiss actions. Sidebar implements hierarchical expandable menus with `data-id=expand` and `data-id=children` hooks. The starter showroom includes Toast, Dialog, Alert and Button variants. These presentation rules do not alter Core or the core-default fallback contract.


## Caller ownership and avoiding useless wrappers

The unit of ownership for remote data is the **Feature/Option**, not a GlobalComponent: `FeatureApp → FeatureCaller → transport/API` and `FeatureApp → normalized data → GlobalComponents`. Each Feature with network needs may have its own Caller; a distinct Option may have one too. A presentational Feature needs no Caller. GlobalComponents only receive normalized inputs/callbacks and never import domain Callers. `GlobalCaller`, where used, provides optional shared HTTP transport and does not imply a Caller for every widget. Pages assemble Features/Options and existing UI components rather than acting as API clients.

An import-and-re-export-only module or one-line component forwarding an existing implementation without additional lifecycle, behavior, adapter boundary or tested presentation is architectural waste and must not be added. Legitimate component adapters must perform meaningful work (for example: Select owns stylesheet lifecycle and exposes a stable widget API). Registry lazy-import callbacks are registration logic, not wrapper files. See `AGENTS.md` rules 29–30 and `docs/structure-guide.md`.

**Current state clarification:** Core does include `RouteResolver`, `LibraryManager` and `HttpClient`, plus optional offline support outside Core; earlier alpha scope notes above describing those items as absent are historical and superseded. `GlobalApp` does not own or automatically instantiate any Caller. Caller ownership is strictly at networking Feature/Option boundaries; `GlobalCaller` is an opt-in generic transport helper.


## Pages are exclusively presentational

Pages receive prepared view models and UI action callbacks from their owning Feature, Option, or application orchestrator. A Page renders this supplied state with data-id hooks and cleans up presentation listeners only. It must never import, instantiate, call, or dispose a Caller, fetch business data, use an HTTP client, or map backend responses. Correct flow: OrdersCaller -> OrdersApp -> OrdersPage.render(viewModel, actions). A Page may emit navigation intent but does not retrieve its next page's business records.


## Rendering ownership (no separate Renderer layer)

LumaJS has no standalone Renderer/Rendering tier. A Feature/Option obtains and prepares data; a Page presents the supplied view model and composes GlobalComponents; each UI component renders its own state. Local `render()` methods are normal. Avoid `FeatureRenderer.js`, `PageRenderer.js` or one-line rendering forwarding modules: they add an unnecessary layer. An independently useful rendering infrastructure would need explicit architectural justification and tests, not automatic scaffolding.
