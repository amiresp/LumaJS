# Documentation synchronization contract

Whenever a PR modifies source code, routes, examples, runtime templates or test/public APIs, review and update **README.md, AGENTS.md, docs/architecture.md, docs/migration-status.md and the relevant API documentation** in the **same PR**. Keep documentation truthful: separate implemented features, tests and known limitations.

CI runs `tools/check-doc-sync.js` for pull requests and rejects changes touching runtime code unless README, AGENTS and at least one docs file changed. This check intentionally enforces the *review trail*, not semantic consistency: reviewers must still verify that docs accurately describe behavior.

New Components require docs/create-component.md, data-id contract and tests. A new Example requires a README launch command. Changes to offline behavior require docs/offline.md; customSelect changes require docs/custom-select.md; routing changes require docs/routing.md. Do not remove `core-default` fallback.

No heavy build step is required for browser runtime; `npm` is used for developer tests and static playground only.
