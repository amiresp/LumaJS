# Architecture contract review — framework vs consuming applications

This document records the evaluated contract proposed for applications using LumaJS. The core rules are binding for consuming applications; framework development follows the same architectural intentions but may modify Core through reviewed changes and regression tests.

## Decision on the 13 proposed sections

| Section | Decision | Enforceable interpretation |
| --- | --- | --- |
| 1. Core immutability | Accept with scope | Consumers must not patch `js/core`. Framework maintainers may evolve Core in the LumaJS repository with tests and documented public APIs. Never workaround an application-specific bug by editing Core. |
| 2. Responsibility separation | Accept with correction | Page is presentation only, Feature/Option orchestrates and owns its domain Caller as needed, Component owns UI behavior, Theme owns markup/style. **Do not introduce a standalone Renderer layer.** Rendering is a method/responsibility inside Page/Component. |
| 3. Component architecture | Accept with correction | Behavior in JS, markup in theme templates, styling in CSS; components receive prepared data/callbacks rather than using or owning their own Caller. Components implement idempotent destroy. |
| 4. No HTML in JS | Accept as application authoring rule, with exemptions | No embedded HTML strings, `innerHTML` used to construct UI, or dynamic `createElement` to scaffold component layouts in consuming applications. Put static and repeated layout markup into theme HTML and `<template>`; JS clones and fills template nodes. Safe programmatic DOM manipulation (textContent, class/state/attributes, cloneNode, remove, replaceChildren) is allowed. Existing framework primitives and framework-internal generated control structures need explicit migration/audit rather than a claim of present compliance. `innerHTML` is used by the Core for **trusted local fetched templates**; this is not API/user HTML and is not a license to inject untrusted input. |
| 5. Template contract | Accept | Required `data-id` hooks must be checked with descriptive failure; Optional hooks must be guarded. Document both and test theme variants/fallback. |
| 6. Explicit component mounting | Accept | Use explicit Luma registry and `data-luma` hosts; don't infer Feature or component solely from URL; don't add implicit `data-feature` placeholders. App routing chooses the Page; Page explicitly composes UI. |
| 7. Theme | Accept | HTML/CSS only. No theme-domain JS, API requests or business rules. Preserve core-default HTML/CSS fallback and stable data-id hooks. |
| 8. Global components | Accept with scope | Reuse GlobalComponents rather than cloning. A domain-specific composite may exist when it has genuine independent behavior. Global component list is illustrative; DatePicker/ErrorState are **not implemented** in current LumaJS and must not be listed as supported APIs. |
| 9. Imports | Accept | Resolve actual module paths and exports; no guesswork. Optional dependencies must be explicit with proper lifecycle. |
| 10. Business rules | Accept for domain applications | Backend authoritatively enforces permissions, configurable constraints and tenant boundaries. UI may mirror server-supplied constraints for feedback, not hardcode policy or enforce security on its own. Generic framework has no salon-specific endpoints or rules. |
| 11. Errors | Accept | Separate mount/import/template/API errors, guard Optional hooks, fail explicitly on Required hooks, isolate component failures, use shared logging and global feedback at presentation level. |
| 12. Multi-tenant / multi-theme | Accept with qualification | Components must stay tenant/vertical agnostic; test **supported** theme variants. Salon/Counseling/Restaurant are example consumer verticals, not built-in LumaJS support claims. |
| 13. Validation gate | Accept with implementation caveat | Add static contract checks for forbidden architecture patterns and JS-generated HTML in application code, plus existing CI checks. Static analysis cannot prove import resolution, accessibility, backend authorization, or absence of runtime errors; these need tests/review. |

## Approved boundaries

```text
Backend
   ↓
FeatureCaller / OptionCaller  (zero when no network access)
   ↓
FeatureApp / OptionApp / application orchestration
   ↓  prepared view model + action callbacks
Page (presentation and explicit component composition)
   ↓
GlobalComponents / approved domain UI components
   ↓
Theme HTML/CSS with required and optional data-id contracts
```

Never add a PageCaller, component-specific Caller, a standalone Renderer, or import-only wrappers.

## Rendering policy and migration boundary

For **new consumer-project UI**, define static and repeated markup in HTML templates, including repeatable `<template>` fragments. Clone fragments using `template.content.cloneNode(true)`, fill via `data-id` hooks and `textContent`, and attach events with appropriate teardown. No JS embedded markup strings or application-level `document.createElement` scaffolding.

**Important:** Current LumaJS's existing reusable controls sometimes use `createElement` internally. This policy is a target contract for application authors and future component work, not a retroactive assertion that the shipped framework contains zero programmatic DOM creation. Moving existing framework code to HTML templates requires a separate tested migration; do not break working components or touch immutable consumer Core as a shortcut.

## Required vs optional hook specification

Every public component must document: its required `data-id` selectors, optional selectors, events/inputs, error behavior, and destroy lifecycle. For a required hook, throw a clear component-specific error. For optional hooks, use a guarded code path; their absence cannot crash the component.

## Validation approach

- `npm run check`, `npm run check:docs`, and `npm run test:browser`.
- Compare consumer project's Core tree/hash against a pinned LumaJS upstream version/tag/commit. Do **not** compare against moving main implicitly.
- Review Page imports for Caller/HTTP requests, and component imports for business-specific Caller.
- Review new user-facing markup for template-first rendering; use `data-id` / `data-luma` hooks.
- Test required/optional hook behavior, theme fallback, cleanup, feature routing and error isolation.
- Manually review backend tenant/business authorization and config-derived policy; frontend tests cannot guarantee security.

See `AGENTS.md`, `docs/architecture.md`, `docs/structure-guide.md` and `docs/create-component.md`.
