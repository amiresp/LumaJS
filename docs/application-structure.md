# Multi-application architecture

`js/core/` provides only generic runtime primitives. **No business route is registered in Core.**

- `apps/<name>/config.js`: app-owned route manifest and theme selection.
- `apps/<name>/bootstrap.js`: creates an isolated `Luma` instance and `ApplicationRegistry`.
- `js/Features/<Name>/`: optional business modules; lazy imports are registered from an app.
- `js/Option/<Name>/`: optional integrations registered from an app.
- `js/shared/`: reusable adapters, callers and composition utilities.
- `themes/<theme>/`: HTML and CSS overrides; fallback to `core-default`.

Each app gets separate route definitions, Feature/Option/Caller maps, and Runtime instances. This does not create a security boundary: admin privileges **must** be enforced by the backend.

`ApplicationRegistry` is intentionally outside Core. It supports exact-match routes, not nested/parameterized routing, guards, SSR, or server fallbacks. These will require separate adapters and tests.

For apps sharing a single document, always pass a root scope into `hydrate(scope)` and `destroy(scope)`. Where apps share DOM and CSS, use explicit selectors and style scoping to avoid conflicts.
