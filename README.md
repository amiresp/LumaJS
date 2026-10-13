# LumaJS

**A zero-build, browser-first frontend runtime.** Native ES modules; no Node.js or npm required for the browser runtime. Node.js is used locally for the playground server, tests and CI.

> **Project state:** alpha. The runtime and selected components are functional demonstrations, not a production compatibility guarantee. The old wwwroot implementation has not been fully migrated. A license has not yet been selected.

## 1. Requirements and run the playground (ELI5)

Install **Node.js 20+** from https://nodejs.org/ . Check that it works:

```bash
node --version
npm --version
```

Clone the repository and enter its directory:

```bash
git clone https://github.com/amiresp/LumaJS.git
cd LumaJS
```

**To view the playground:** no dependency installation is necessary. Start the included Node static server:

```bash
npm run playground
```

Open **http://127.0.0.1:8765/examples/basic/** in your browser. It demonstrates Slider, Stories, Toast, Alert and Dialog. Stop the server with **Ctrl+C**.

If your version of the repository predates `npm run playground`, use `node tools/serve-static.js` instead. Do **not** open HTML directly with `file://`; ES module imports and template requests need HTTP.

To run automated tests (these are development-only dependencies):

```bash
npm install
npm run check
npx playwright install chromium
npm run test:browser
```

`npm run check` runs repository HTML validation, Node tests and source-security checks. `test:browser` runs Playwright; on some platforms Playwright may require extra system browser libraries.

## 2. How the directories fit together

```text
js/core/                                      generic browser runtime and infrastructure
js/dependency/global/GlobalComponents/         component JavaScript
  Slider/Slider.js
  Stories/Stories.js
  Toast/Toast.js
  Alert/Alert.js
  Dialog/Dialog.js
themes/core-default/dependency/Global/         default HTML and CSS for the components
apps/                                          separate app-level routing and composition
examples/basic/index.html                      interactive playground
tools/serve-static.js                          development-only Node HTTP server
```

**Architectural rule:** if active theme HTML is missing, LumaJS loads it from **core-default** automatically. Do not duplicate the default template in every theme. A custom theme should override **HTML/CSS only**, preserve the `data-id` hooks, and never fork generic component behavior unnecessarily. Business paths belong in application manifests, not Core.

## 3. Embed LumaJS into an existing project

LumaJS can be deployed as **plain static files**, independently of your backend framework. Copy the `js/` and `themes/` folders to your application's publicly served directory, preserving their **relative paths**. A server must serve `.js` as JavaScript, `.html` as HTML and `.css` as CSS. You do **not** need to publish `node_modules/`, `tests/`, `tools/`, `apps/`, or `examples/` for runtime operation.

Example: your site publishes its static files at `https://example.com/ui/`. Place the structure at:

```text
public/ui/
  js/core/Luma.js
  js/shared/ThemeResolver.js
  js/core/HttpClient.js
  js/dependency/global/GlobalComponents/Toast/Toast.js
  js/dependency/global/GlobalComponents/Alert/Alert.js
  js/dependency/global/GlobalComponents/Dialog/Dialog.js
  themes/core-default/dependency/Global/Toast/Toast.html
  themes/core-default/dependency/Global/Toast/Toast.css
  ... corresponding Alert / Dialog theme files ...
```

In a page rendered by **Express, PHP, ASP.NET Core, a plain HTML site or any HTTP server**, add:

```html
<div data-luma="Toast"></div>
<div data-luma="Alert"></div>
<div data-luma="Dialog"></div>

<button data-id="notify">Notify</button>
<button data-id="ask">Ask</button>

<script type="module">
  import { Luma } from "/ui/js/core/Luma.js";
  const luma = new Luma({ base: "/ui/", theme: "my-theme" });

  luma.register("Toast", {
    load: () => import("/ui/js/dependency/global/GlobalComponents/Toast/Toast.js")
  });
  luma.register("Alert", {
    load: () => import("/ui/js/dependency/global/GlobalComponents/Alert/Alert.js")
  });
  luma.register("Dialog", {
    load: () => import("/ui/js/dependency/global/GlobalComponents/Dialog/Dialog.js")
  });

  await luma.hydrate();
  const get = name => luma.instances.get(document.querySelector('[data-luma="' + name + '"]'));
  document.querySelector('[data-id="notify"]').addEventListener("click", () => {
    get("Toast")?.show("Operation completed", { type: "success" });
    get("Alert")?.show("Details saved", { type: "info" });
  });
  document.querySelector('[data-id="ask"]').addEventListener("click", async () => {
    const confirmed = await get("Dialog")?.open({
      title: "Continue?", message: "Do you want to continue?"
    });
    console.log({ confirmed });
  });
  window.addEventListener("pagehide", () => { void luma.destroy(); }, { once: true });
</script>
```

For `theme: "my-theme"`, Luma first checks `themes/my-theme/dependency/Global/<Name>/<Name>.html` and falls back to `themes/core-default/...` if missing. Styles also use fallback. You can start with no custom theme at all.

### Backend examples

- **Node.js/Express:** expose the copied `public/ui/` directory with `express.static`. Express is the **application server**, not an LumaJS browser dependency.
- **ASP.NET Core:** copy under `wwwroot/ui/`; enable static-file serving as appropriate to your ASP.NET Core configuration.
- **PHP/Apache/nginx:** copy under your document root (`public/ui/` or equivalent); no PHP package or special LumaJS backend adapter is necessary.
- **Subpath deployment:** set `base` to the **public URL prefix**, including the trailing slash, and keep module import URLs aligned.

Do not embed API/user-generated HTML into theme files via string concatenation. API data should be displayed using safe DOM APIs such as `textContent`.

## 4. Component APIs

| Component | Methods | Theme paths |
| --- | --- | --- |
| Toast | `show(message,{type,duration})`, `clear()`, `destroy()` | `Global/Toast/Toast.html` and `.css` |
| Alert | `show(message,{type,dismissible})`, `hide()`, `destroy()` | `Global/Alert/Alert.html` and `.css` |
| Dialog | `await open({title,message,confirmText,cancelText})`, `close(false)`, `destroy()` | `Global/Dialog/Dialog.html` and `.css` |

The three components use safe text-only APIs, default `data-id` selectors and cleanup on destroy. Their templates are replaceable by a theme that honors the documented hooks. Toast is nonmodal, Alert inline, and Dialog modal. All are backend-agnostic.

## 5. Deploy and troubleshoot

1. The HTML page and `js/` and `themes/` assets must share a reachable HTTP origin (unless you explicitly configure cross-origin modules/CORS).
2. A **404** for a Theme HTML file is expected if it is intentionally overridden by a fallback; a 404 from **both** current theme and `core-default` is an error.
3. An error such as **Failed to fetch dynamically imported module** usually means a wrong import URL, MIME type or server rewrite.
4. Use your browser's Network tab to verify `/ui/themes/core-default/dependency/Global/.../*.html` and `*.css` paths.
5. Build tooling is optional. Never assume a Node bundle or SSR is required.
6. Offline Service Worker is optional and must be explicitly registered. Only public static files may be cached.

## 6. Docs and limitations

See [AGENTS.md](AGENTS.md), [architecture](docs/architecture.md), [media components](docs/media-components.md), [routing](docs/routing.md), and [security](docs/security.md).

Current integration is alpha: it needs further accessibility, network and real-user browser validation before a production claim. Open-source license selection is pending.


## More runnable examples and authoring conventions

The project now preserves and demonstrates the original `wwwroot.zip` separation between **GlobalApp / GlobalCaller**, **Feature / Caller**, **Option / Caller**, and app-owned **Pages** without copying business-specific endpoints or framework globals.

Run `npm run playground`, then open:

- **Architecture demo:** http://127.0.0.1:8765/examples/structure/ (shared GlobalApp, Feature, Option, Home/Sample Page)
- **customSelect demo:** http://127.0.0.1:8765/examples/custom-select/ (searching optional attributes, single and multi-select)
- **Components demo:** http://127.0.0.1:8765/examples/basic/
- **Offline fallback:** `/offline.html` (the opt-in Service Worker precaches it and serves it for offline navigations, when previously installed online)

For an end-to-end tutorial to **create a component**, read [Creating a Component](docs/create-component.md). For app structure and the original ZIP mapping, see [Structure Guide](docs/structure-guide.md). For the complete `customSelect` API and remaining parity limitations, see [customSelect](docs/custom-select.md). For caching and navigation offline behavior see [Offline](docs/offline.md).

### Documentation policy

Every source/API change must update README, AGENTS and its relevant documentation together. The PR check enforces an accompanying documentation change; contributors still must check accuracy themselves. See [Maintenance](docs/maintenance.md).


## Tabler SVG Icon component

LumaJS includes a curated local collection of **120+ official Tabler outline SVG icons** under the upstream MIT license (see `third_party/tabler-icons-LICENSE`). It needs no icon font, external CDN or browser build. Try the searchable [Icon Gallery](examples/icons/) at **http://127.0.0.1:8765/examples/icons/** after `npm run playground`.

```js
import {createIconElement,renderIcon} from "./js/dependency/global/GlobalComponents/Icon/Icon.js";
button.prepend(createIconElement("arrow-left", {size:20,label:"Go back"}));
renderIcon(document.querySelector('[data-id="status-icon"]'), "circle-check", {size:20});
```

Icon is also a standard Luma component with `data-luma="Icon"`, a `core-default` template, `set(name)` and `destroy()`. Toast, Alert, Dialog, Stories and Slider controls now use the locally bundled Tabler icons. See [Icon Reference](docs/icons.md). Keep the original Tabler MIT copyright notice with redistributions.


## Starter UI: 11 ready-to-mount components

Run `npm run playground` and visit **http://127.0.0.1:8765/examples/starter/** for EmptyState, Loading/Skeleton, Button, client-side DataGrid/Table, Select (backed by customSelect), Sidebar/Navigation, Breadcrumb, Pagination, Card, Accordion, and Badge/Chip. `GlobalApp` registers them lazily. Every component has `<Name>.js`, `themes/core-default/dependency/Global/<Name>/<Name>.html` and `.css`. Use `[data-id]` for behavior, `data-luma` for component hosts, and preserve the mandatory HTML fallback. APIs/limitations: [Starter Components Guide](docs/starter-components.md). No runtime build or Node.js requirement.


## Playground landing page and no-login admin demo

After `npm run playground`, open **http://127.0.0.1:8765/** for the main Playground landing page. It links to Starter UI, the component demo (Toast, Slider, Stories), Tabler icons, customSelect, Feature/Option/Page architecture, and offline preview. The new **Admin Dashboard** is at **http://127.0.0.1:8765/examples/admin/**. No account, login page, backend or database is required. It demonstrates shared Sidebar/Breadcrumb, Card, Badge, DataGrid, Pagination, customSelect-backed Select, Button, Accordion, Loading, EmptyState, Toast and Dialog using mock users and illustrative metrics. Clicking Add Sample User mutates only in-memory data. See [Dashboard demo documentation](docs/admin-playground.md).


## Shared component composition (October 2026)

Composite UI now reuses the actual GlobalComponents rather than reimplementing buttons and pagination. DataGrid creates a nested **Pagination instance** and uses shared Button controls for sortable columns; configure DataGrid with rows/columns/pageSize and **do not mount a second independent Pagination for that grid**. Dialog, Toast, Alert, Badge, EmptyState and Sidebar use the shared Button behavior for their actions. Select wraps the existing customSelect and automatically loads its stylesheet from the module-relative path so it works in any Playground or deployment prefix. See docs/starter-components.md. Run npm run playground, open /examples/admin/ and /examples/starter/, then npm run check and npm run test:browser.


### Starter UI refinements

The `/examples/starter/` catalog now showcases Toast, Dialog, Alert and ghost Button variants alongside the original components. DataGrid column headings render a plain focusable sorting label (`data-id=sort`), not a styled Button; Enter/Space and pointer activation sort the table. Buttons used only as dismiss icons use the background-free `ghost` variant, including Toast and dialog Close. Sidebar supports expandable nested navigation (`children`, `expanded`, `active`) with keyboard-operable controls and polished indentation. The admin demo includes two nesting levels. Verify with `npm run check` and `npm run test:browser`.


## Caller and module ownership rules

**Use a Caller at the Feature boundary, not on every component.** A Feature that loads business data owns a domain Caller; an Option may have its own only if its network/domain requirements justify it. The Feature prepares data and passes it to shared components such as DataGrid, Select and Toast. Display-only features need no Caller. `GlobalCaller` is an optional application-level HTTP helper, not a mandatory wrapper for widgets. Never create an import-only component/file that simply forwards an existing one—reuse it directly unless your new adapter has real behavior, state, lifecycle or a defined presentation responsibility. See [structure guide](docs/structure-guide.md) and [contributor rules](AGENTS.md).

**Core and Caller ownership (reference alignment):** The runtime files in `js/core/` remain unchanged. `GlobalApp` only registers/hydrates shared UI and does not instantiate `GlobalCaller`; a networking Feature/Option owns its own domain Caller. See [architecture](docs/architecture.md) and [structure guide](docs/structure-guide.md). Avoid pass-through modules without real work.


**Pages are views only:** They must not instantiate/import Callers, fetch business data, or directly contact APIs. The owning Feature, Option, or application orchestrator prepares a view model and passes it with UI callbacks to the Page. Pages render the supplied state and dispose presentation listeners. See docs/structure-guide.md.


**Rendering convention:** LumaJS has no separate Renderer/Rendering layer. Feature/Option orchestration prepares view models; Pages and GlobalComponents render them directly. `render()` methods inside these classes are allowed, but do not scaffold `*Renderer.js` proxy files or extra wrappers. See [architecture](docs/architecture.md).


## Shared Logger

Import `logger` or `Logger` from [`js/shared/Logger.js`](js/shared/Logger.js): `logger.info('Ready')`, `logger.warn('Empty')`, `logger.error('Failed',error)`, and `logger.debug('State',state)`. Debug is off by default; call `logger.setLevel('debug')` for local debugging and `logger.setLevel('warn')` or `logger.setLevel('silent')` for production. An optional `Logger({prefix,level,sink,enabled})` gives scoped or customized output. No extra Caller, component wrapper, Core changes or runtime dependencies. See [Logger guide](docs/logger.md).


### Configuring Logger at the entry point

Use `const {logger}=createWebsite({logging:{level:"warn",enabled:true}})` or the equivalent `createAdmin` bootstrap. The returned Logger lets application code call `logger.setLevel("debug")`, `logger.setEnabled(false)` or `logger.setEnabled(true)` without modifying Core or Page files. Both application bootstraps report Luma runtime errors through this shared Logger while retaining any supplied `onError` callback. See [Logger usage and runtime limitations](docs/logger.md).


## Consumer architecture contract

The proposed 13-section contract was reviewed against the actual LumaJS source. Adopted rules and corrections: docs/consumer-architecture-contract.md. Consumer Core must match a pinned upstream revision. Page is presentation-only; Caller belongs to Feature/Option orchestration. No standalone Renderer is required. New consumer markup belongs to Theme templates, including repeated HTML template fragments. Existing framework internals still include dynamic DOM construction and require a separate migration before any blanket compliance claim. Backend remains the authority for business policy and tenant permissions.
