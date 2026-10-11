# LumaJS

**Build freely. Run instantly.**

LumaJS is an experimental browser frontend runtime built with **vanilla JavaScript, native ES modules and zero mandatory frontend dependencies**. No npm install, Node.js, compiler or build step is needed to run the browser code.

> **Status: v0.1.0-alpha prototype.** Working minimal runtime and two components. Not production-ready or yet integrated with the earlier `wwwroot` implementation.

## Quick start

Serve the repository root with **any HTTP server**, then open `/examples/basic/`.

```bash
python3 -m http.server 8080
# http://localhost:8080/examples/basic/
```

Python here is an optional local server example; nginx, Apache, PHP, ASP.NET and Node.js can serve the exact same files. `file://` is not supported because browser module imports and fetch require HTTP.

## Layout

- `core/Luma.js` — lightweight registry, template fallback, independent component lifecycle
- `components/Slider`, `components/Story` — behavior controllers
- `themes/core-default` — overridable HTML/CSS and documented `data-id` hooks
- `examples/basic` — zero-build demo
- `AGENTS.md` — mandatory conventions for AI and human contributors
- `docs/architecture.md` — runtime contract and alpha limitations

## Principles

Browser-first · Backend-agnostic · No mandatory build · Minimal Core · Themeable HTML/CSS · Failure isolation · Optional third-party adapters.

**Security:** Only trusted application theme HTML is mounted through `innerHTML`. Never inject unsanitized API/user HTML.

## Next

Integrate vetted pieces from the original BootLoader/ThemeLoader, add contract and browser tests, accessibility hardening, theme validation, navigation and offline caching. Licensing remains undecided: do not assume a permissive license until one is published.
