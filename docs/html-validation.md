# Project-wide HTML hygiene checks

Run `npm run check` locally. This runs `npm run validate:html` and `npm test` using Node.js built-in capabilities. **No npm install is required** for the current test suite: package.json has no dependencies. Node is for development/CI only, not the browser runtime.

The checker scans HTML files, detects accidental literal `\\n` and suspicious `/n` sequences. This is a **hygiene check, not a complete HTML5 syntax parser**. Full HTML structure validation must be added separately before a stable release. Inline JavaScript escapes should remain valid. See `tools/validate-html.js` and tests.
