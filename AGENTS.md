# LumaJS — mandatory contribution contract

Applies to human and AI contributors throughout this repository.

1. Browser runtime MUST work with standard ES modules, plain JavaScript and no mandatory build, npm, Node.js, TypeScript, SSR or Web Components.
2. Backends MUST remain interchangeable: Node.js, PHP, ASP.NET and ordinary static HTTP hosting all serve the same assets.
3. Core remains minimal. Implement new features outside Core via public registration and lifecycle contracts.
4. Each component has JavaScript behavior in `js/dependency/global/GlobalComponents/<Name>/<Name>.js` and default HTML/CSS in `themes/core-default/dependency/Global/<Name>/`.
5. Theme overrides MAY replace HTML/CSS only. Preserve documented `data-id` hooks. JS MUST bind to `data-id`, not CSS classes or DOM IDs.
6. A component factory MUST return an object exposing an idempotent `destroy()`. Clear all event handlers, timers, observers, subscriptions and foreign library instances.
7. Each component failure MUST be localized and reported without blocking other components.
8. Insert untrusted data only using safe DOM APIs such as `textContent`; `innerHTML` is reserved for trusted local templates, never arbitrary API or user content.
9. Third-party libraries MUST be optional, integrated through an adapter, and documented for licensing, transfer size, offline behavior and cleanup.
10. Preserve browser keyboard accessibility, focus behavior, and reduced-motion preferences.
11. Document public events, `data-id` hooks, error states and compatibility changes.
12. Before changing Core, add regression tests for existing lifecycle and navigation behavior.

Review and verify these rules in CI; prose rules alone are not a security boundary.

13. **No business routes in Core.** Route definitions belong in an application routing manifest (`apps/<app>/routes.js`) or an optional Feature-exported manifest. Core may only supply generic routing machinery.
14. **HTML validation is mandatory.** Before proposing changes, run `npm run validate:html` and `npm test`. Never emit literal `\\n` or accidental `/n` in HTML markup/text; use real newlines. See `docs/html-validation.md`.

15. **Mandatory HTML fallback:** Whenever a component HTML template is absent or unavailable in the active theme, resolve it from `themes/core-default/dependency/Global/<Component>/<Component>.html`. `core-default` is a permanent architectural fallback; never remove, disable, or require application authors to duplicate its templates. Theme overrides contain HTML/CSS only and maintain the component's `data-id` contract.
16. **Lifecycle isolation:** Dispose child components before parents, isolate error-reporting callbacks, and use bounded network/library load times. Include regression tests for fallback, pending mounts, restart, and nested cleanup.

17. Core HTML fallback must be covered by tests; never use user/API content as HTML. Keep Network Retry bounded and only automatic for idempotent methods. Run npm run check and npm run test:browser when changing components or theme handling.

18. **Structure compatibility:** preserve `js/dependency/global/GlobalApp.js`, `GlobalCaller.js`, app-owned Pages, feature/option App and Caller composition. This must remain instance scoped and backend-neutral; do not import domain-specific modules into Core.
19. **Documentation synchronization is mandatory:** every source/API/theme/route change MUST update README.md, AGENTS.md, docs/architecture.md, docs/migration-status.md and relevant feature documentation, and include tests where behavior changes. CI checks for an accompanying documentation update; reviewers must verify semantic correctness. Read docs/maintenance.md.
20. **customSelect is a supported standalone widget** at `js/shared/widgets/customSelect/`; document its optional attribute search and avoid hardcoded business data. Never claim full legacy parity before it is tested.
21. **Offline page** lives at `offline.html`. Opt-in Service Worker may precache it for offline navigations, but must not cache authenticated responses or other private data.
