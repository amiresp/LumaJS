# Project-wide HTML validation

Run `python3 tools/validate_html.py .` from the repository root. This is **development-time verification**, not a frontend dependency. No `pip install`, npm, Node.js or build tooling is required.

The CI workflow runs it automatically for pull requests. It scans all `*.html` files (except vendor/build directories) for:
- accidental literal `\\n` in rendered text or attributes (as opposed to actual line breaks);
- suspicious standalone `/n`;
- unmatched and unclosed tags, including void-element closing tags;
- invalid UTF-8 or parser errors.

Inline script/style/code/pre/textarea bodies are excluded from text-escape checks so valid JavaScript escape sequences are not rejected. Attribute values remain checked.

This validator intentionally is **not** a complete HTML5 conformance checker. HTMLParser cannot model all browser implicit-closing rules, so complex standards validation can be added as an optional developer tool later. Report false positives before changing enforcement rules. To allow intentional literal escapes in visible text, use a reviewed markup exception mechanism (not yet implemented) rather than silently bypassing CI.

Developers and AI agents should run this checker on all pages before opening a PR.
