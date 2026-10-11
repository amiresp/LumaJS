# Application routing — separate from Core

LumaJS Core must remain unaware of domain-specific routes such as blog, hotel, flight, shop or admin.

**Ownership**
- `js/core`: generic navigation/route matching infrastructure only, if needed.
- `apps/<app>/routes.js`: app-level composition of paths and independently imported features.
- `js/Features/<Name>/`: feature implementation; a feature may optionally export route *definitions*.
- `js/Option/<Name>/`: optional functionality.
- Each application chooses which features to install. An admin app and a public app need not share routes.

Example declarative route definitions (a **design contract**, not a shipped router API):

```js
// apps/admin/routes.js — consumed by future application bootstrap
export const routes = [
  { path: "/admin", feature: "Dashboard", page: "Overview" },
  { path: "/admin/users", feature: "Users", page: "List" }
];
```

The application bootstrap will eventually pass this manifest to a generic router. Do not register business paths inside BootLoader or Core, and do not make the browser runtime depend on Node.js for route generation.

A missing feature must not crash unrelated pages. Treat route manifests as trusted application-owned code, not arbitrary remote scripts.
