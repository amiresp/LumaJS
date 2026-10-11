# HTML5 validation

Run `npm install` (development only), then `npm run check`.

HTML source is parsed with `parse5` and checked for HTML5 tokenizer/tree parsing errors plus literal `\\n` and isolated `/n` in visible text and attributes. Scripts and CSS bodies are exempt from the text escape rule. Parser-based checks handle malformed markup more reliably than ad-hoc regex, but **HTML5 permits some implicit tag closures** and this is not an accessibility or browser-rendering test.

`npm test` runs Node's built-in test runner. `jsdom` supports DOM-level widget/runtime assertions. Neither library is bundled with the LumaJS browser runtime.

CI installs test dependencies with npm and runs `npm run check`. A production site needs neither Node.js nor a build step.
