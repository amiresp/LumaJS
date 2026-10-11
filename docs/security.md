# LumaJS security boundaries

- Theme templates are **trusted first-party source files**; treat any remote or user-supplied HTML as untrusted.
- Component data rendering must use `textContent`, safe DOM construction or allowlisted attributes; never interpolate API values into trusted theme HTML. No legacy BindEngine is shipped.
- Core routing is not authorization. Every backend must enforce access and permissions.
- Third-party libraries are optional, should be self-hosted and integrity/version reviewed, and must not execute from arbitrary user-controlled URLs.
- Component events and caller responses cross trust boundaries: validate all data before use.
- CSP should disallow inline event handlers and restrict script origins; nonces/hashes are deployment-specific.
- Before general release add audited sanitization strategy if rich user content is required, and genuine browser-based security testing.
