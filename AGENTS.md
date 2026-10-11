# LumaJS — mandatory contribution contract

Applies to human and AI contributors throughout this repository.

1. Browser runtime MUST work with standard ES modules, plain JavaScript and no mandatory build, npm, Node.js, TypeScript, SSR or Web Components.
2. Backends MUST remain interchangeable: Node.js, PHP, ASP.NET and ordinary static HTTP hosting all serve the same assets.
3. Core remains minimal. Implement new features outside Core via public registration and lifecycle contracts.
4. Each component has JavaScript behavior in `components/<Name>/<Name>.js` and default HTML/CSS in `themes/core-default/<Name>/`.
5. Theme overrides MAY replace HTML/CSS only. Preserve documented `data-id` hooks. JS MUST bind to `data-id`, not CSS classes or DOM IDs.
6. A component factory MUST return an object exposing an idempotent `destroy()`. Clear all event handlers, timers, observers, subscriptions and foreign library instances.
7. Each component failure MUST be localized and reported without blocking other components.
8. Insert untrusted data only using safe DOM APIs such as `textContent`; `innerHTML` is reserved for trusted local templates, never arbitrary API or user content.
9. Third-party libraries MUST be optional, integrated through an adapter, and documented for licensing, transfer size, offline behavior and cleanup.
10. Preserve browser keyboard accessibility, focus behavior, and reduced-motion preferences.
11. Document public events, `data-id` hooks, error states and compatibility changes.
12. Before changing Core, add regression tests for existing lifecycle and navigation behavior.

Review and verify these rules in CI; prose rules alone are not a security boundary.
