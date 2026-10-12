# Documentation synchronization contract

Whenever a PR modifies source code, routes, examples, runtime templates or test/public APIs, review and update **README.md, AGENTS.md, docs/architecture.md, docs/migration-status.md and the relevant API documentation** in the **same PR**. Keep documentation truthful: separate implemented features, tests and known limitations.

CI runs `tools/check-doc-sync.js` for pull requests and rejects changes touching runtime code unless README, AGENTS and at least one docs file changed. This check intentionally enforces the *review trail*, not semantic consistency: reviewers must still verify that docs accurately describe behavior.

New Components require docs/create-component.md, data-id contract and tests. A new Example requires a README launch command. Changes to offline behavior require docs/offline.md; customSelect changes require docs/custom-select.md; routing changes require docs/routing.md. Do not remove `core-default` fallback.

No heavy build step is required for browser runtime; `npm` is used for developer tests and static playground only.


Icon changes require `docs/icons.md`, the upstream MIT notice, README.md, AGENTS.md, architecture and migration-status updates, plus an icon gallery test. All new shared-component controls should prefer the local Icon component over hand-written Unicode glyphs.

Every change to user-facing selectors or examples must retain `data-id` hooks (hosts use `data-luma`) and pass `npm run check:hooks`. Do not use getElementById, CSS ID selectors or class selectors for binding. Stylesheet class selectors are allowed solely for presentation.


Starter UI changes must update docs/starter-components.md, README, AGENTS, architecture and migration-status files. Follow the mandatory data-id selection checker, core-default HTML fallback and tests for any changed component API.


Changes to the root Playground navigation or `examples/admin/` must update README, AGENTS, architecture, migration status, starter component guide and `docs/admin-playground.md`; ensure browser tests cover new links and interactions without logins.


## Structural review gate

For each new Feature/Option, check the **Caller ownership boundary**: at most one domain Caller per Feature/Option unless a documented separate bounded context justifies sharing/splitting; zero when no network activity exists. A shared application transport is optional. Reject per-component Callers. Audit newly added JS modules for import-only/re-export-only pass-throughs and reject files lacking their own purpose. Reviewers must verify meaningful responsibilities; static source checks cannot reliably decide architectural necessity. Update AGENTS, architecture and structure guides alongside changes.

**Core preservation audit:** Before changing `js/core/`, compare behavior with the existing main reference and run focused lifecycle/fallback tests. Do not modify Core for Feature-level Caller plumbing. Assert `GlobalApp` remains Caller-free in automated tests.
