# Structure mapping from original wwwroot.zip

Original paths **js/dependency/global/GlobalApp.js**, **GlobalCaller.js**, **js/Features/<Domain>/<Domain>App.js**, **js/Features/<Domain>/<Domain>Caller.js**, **js/Option/<Module>/<Module>App.js**, **themes/core-default/Features/**, **themes/core-default/Option/** and **themes/core-default/Option/<Module>/pages/** describe three distinct responsibilities:

- `GlobalApp`: application-level orchestrator that registers shared UI components. New `GlobalApp` is smaller, dependency-free, instance scoped; it is **not a 1:1 port** of the monolithic original, which also knew specific headers, auth, languages and many extra widgets.
- `GlobalCaller`: shared HTTP adapter and disposable AbortController; **no fixed API endpoints**, session secrets or domain knowledge are required in a generic starter.
- **Feature**: domain functionality and its own Caller (when needed), components and routes. `js/Features/Sample/` shows a simple Feature with mock data and UI; it is not implicitly loaded into Core.
- **Option**: optional/integrated module with its own App and Caller. `js/Option/Sample/` is explicitly mounted by its parent application.
- **Page**: belongs in `apps/<app>/pages/` or inside a Feature/Option `pages/`. The route manifest is app-owned at `apps/website/routes.js`, not hardcoded inside Core.
- **Theme**: HTML/CSS overlays. Sample Feature and Option templates are in `themes/core-default/Features/Sample/` and `themes/core-default/Option/Sample/`. Always preserve the mandatory default HTML fallback.

## Run

```bash
npm run playground
# http://127.0.0.1:8765/examples/structure/
# http://127.0.0.1:8765/examples/custom-select/
```

The structure playground includes working Home/Sample pages, Feature/Option instances, and shared Alert through GlobalApp. For production apps, wire Page/Feature/Option templates through application-specific loaders with explicit lifecycle cleanup and fallback policies; this example intentionally avoids a second hidden routing engine. `ApplicationRegistry` already provides app-owned declarative route resolution.

Legacy BindEngine is intentionally **not** migrated. Presentation hooks use `data-id` and JS writes use safe DOM APIs.


## Caller ownership rule (mandatory)

```text
Features/Orders/
  OrdersApp.js      # owns business orchestration and maps responses into UI inputs
  OrdersCaller.js   # owns orders-specific API requests (only if needed)
  components/       # feature-specific UI, no separate Caller per widget

Option/Reports/
  ReportsApp.js
  ReportsCaller.js  # only when this Option has independent network responsibilities
```

Correct flow: `OrdersApp → OrdersCaller → backend`; `OrdersApp → Global DataGrid/Toast/Select`. Incorrect flow: `DataGrid → DataGridCaller`, `Toast → ToastCaller`, or one Caller per row, button or visual element. A display-only Feature requires no Caller. `GlobalCaller` can be reused as a generic transport **inside a Feature Caller** but should not be blindly injected into every component.

Do not add components or files merely to wrap a single import/re-export. Use existing GlobalComponents directly unless the new adapter contributes a verifiable responsibility (behavior, lifecycle, state, domain composition, configuration, or theme presentation). This applies equally to Feature, Option and Page scaffolding.

**Implementation update:** `GlobalApp` now registers/hydrates UI components without constructing, retaining, or destroying `GlobalCaller`. Networking Feature/Option owners create and dispose their own domain Caller when network access is actually needed; display-only modules create none.


## Page boundary: presentation only

Pages under `apps/<app>/pages/`, `js/Features/<name>/pages/` and `js/Option/<name>/pages/` **must not** contain a Caller, import Callers or HTTP clients, use `fetch`, load business records, or normalize backend responses. The owning Feature/Option (or application orchestrator) fetches and maps data and passes ready-to-render view models and callbacks. Pages render and emit UI intent only. The required flow is `FeatureCaller -> FeatureApp -> Page(viewModel, actions)`. Do not create `PageCaller.js`.


## No Renderer file convention

Use `FeatureCaller -> FeatureApp -> Page -> GlobalComponents/Theme`. Do not scaffold `FeatureRenderer.js`, `PageRenderer.js` or a separate Rendering directory. Pages and components own rendering of supplied data using `data-id`, safe DOM APIs, and local `render()` methods when appropriate. Features/Options own domain orchestration, not a duplicate presentation layer.


## Consumer applications

Pin the upstream Core version and do not patch consumer Core. Pages explicitly compose data-luma components from Theme markup, using data supplied by Feature/Option orchestration. Callers belong to Feature/Option, not Pages or components. No standalone Renderer, inferred feature injection or pass-through wrappers. For new consumer UI, use Theme HTML templates for repeated markup. See docs/consumer-architecture-contract.md.
