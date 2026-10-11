# LumaJS core foundation contract

Core has no knowledge of flight, blog, hotel, shop, customer or admin domain routes. Route declarations live in `apps/<name>/config.js` or a separate application manifest. `js/core/RouteResolver.js` only resolves generic declarative patterns.

`js/core/LibraryManager.js` handles optional script and stylesheet loading. The cache key contains resource type, library name and URL, avoiding JS/CSS conflicts present in the old implementation. Third-party library lifecycle and destruction remain the responsibility of the widget adapter.

`js/shared/ThemeResolver.js` searches app-configured themes in order using the original `themes/<theme>/dependency/Global/<Component>/` layout. No hardcoded client themes. A failed resource is retriable and can fall back. Theme content is trusted application-owned HTML/CSS, not an API payload.

These files are reusable foundations, not a full port of the legacy `BootLoader`, `BindEngine`, feature controllers or offline resilience. Before the alpha is declared complete, connect them to the main runtime and validate navigation, accessibility, security and real browser cases.
