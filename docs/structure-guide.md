# Structure mapping from original wwwroot.zip

Original paths **js/dependency/global/GlobalApp.js**, **GlobalCaller.js**, **js/Features/<Domain>/<Domain>App.js**, **js/Features/<Domain>/<Domain>Caller.js**, **js/Option/<Module>/<Module>App.js**, **themes/core-default/Features/**, **themes/core-default/Option/** and **themes/core-default/Option/<Module>/pages/** describe three distinct responsibilities:

- `GlobalApp`: application-level orchestrator that registers shared UI components. New `GlobalApp` is smaller, dependency-free, instance scoped; it is **not a 1:1 port** of the monolithic original, which also knew specific headers, auth, languages and many extra widgets.
- `GlobalCaller`: shared HTTP adapter and disposable AbortController; **no fixed API endpoints**, session secrets or domain knowledge are required in a generic starter.
- **Feature**: domain functionality and its own Caller/Renderer/components/routes. `js/Features/Sample/` shows a simple Feature with mock data and UI; it is not implicitly loaded into Core.
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
