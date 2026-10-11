#!/usr/bin/env node
/**
 * Full HTML5 parser-based validation using parse5 (development-only dependency).
 * Leaves the browser runtime free of npm/build dependencies.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, parseFragment } from "parse5";

const SKIP = new Set(["node_modules", ".git", "vendor", "dist", "build"]);
const BLOCKED_ERRORS = new Set([
  "duplicate-attribute", "end-tag-with-attributes", "end-tag-with-trailing-solidus",
  "eof-in-tag", "eof-in-comment", "eof-in-doctype", "eof-in-script-html-comment-like-text",
  "abrupt-closing-of-empty-comment", "incorrectly-closed-comment", "missing-end-tag-name",
  "missing-attribute-value", "missing-whitespace-between-attributes",
  "unexpected-character-in-attribute-name", "unexpected-character-in-unquoted-attribute-value",
  "unexpected-equals-sign-before-attribute-name", "unexpected-null-character",
  "non-void-html-element-start-tag-with-trailing-solidus",
  "end-tag-without-matching-open-element", "closing-of-element-with-open-child-elements"
]);
const isVoid = tag => new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]).has(tag);
export function validateHtml(text, { fragment = false } = {}) {
  const errors = [];
  const report = error => errors.push(`line ${error.startLine}: HTML5 ${error.code}`);
  const opts = { onParseError: error => {
    // HTML fragments legitimately omit a doctype.
    if (!["missing-doctype", "non-conforming-doctype"].includes(error.code) && BLOCKED_ERRORS.has(error.code)) report(error);
  }, sourceCodeLocationInfo: true };
  const document = fragment ? parseFragment(text, opts) : parse(text, opts);
  function walk(node) {
    const loc = node.sourceCodeLocation;
    if (loc?.startTag && loc?.endTag && isVoid(node.tagName)) errors.push(`line ${loc.endTag.startLine}: closing void tag`);
    if (node.nodeName === "#text" && !["script","style","pre","code","textarea"].includes(node.parentNode?.tagName)) {
      const content = node.value;
      const line = loc?.startLine || 1;
      for (const match of content.matchAll(/\\n|(?:^|\s)\/n(?=\s|$)/g)) {
        const at = line + content.slice(0, match.index).split("\n").length - 1;
        errors.push(`line ${at}: literal ${match[0].trim()} in text`);
      }
    }
    if (node.attrs) {
      for (const attr of node.attrs) {
        if (/\\n/.test(attr.value) || /(?:^|\s)\/n(?=\s|$)/.test(attr.value)) {
          errors.push(`line ${loc?.startLine || 1}: literal escape in attribute ${attr.name}`);
        }
        if (/^on[a-z]+$/i.test(attr.name) || attr.name === "srcdoc") {
          errors.push(`line ${loc?.startLine || 1}: unsafe HTML attribute ${attr.name}`);
        }
        if (["href", "src", "action", "formaction", "xlink:href"].includes(attr.name) &&
            /^(?:javascript|vbscript|data):/i.test(attr.value.trim())) {
          errors.push(`line ${loc?.startLine || 1}: unsafe URL in ${attr.name}`);
        }
      }
    }
    for (const child of node.childNodes || []) walk(child);
    if (node.content) walk(node.content);
  }
  walk(document);
  return errors;
}
function scan(path) {
  if (statSync(path).isDirectory()) return readdirSync(path).flatMap(name => SKIP.has(name) ? [] : scan(join(path, name)));
  return extname(path) === ".html" ? [path] : [];
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const files = scan(resolve("."));
  let errors = 0;
  for (const file of files) {
    const issues = validateHtml(readFileSync(file, "utf8"), { fragment: !/<\s*!doctype\b/i.test(readFileSync(file, "utf8")) });
    for (const issue of issues) console.error(`${file}: ${issue}`);
    errors += issues.length;
  }
  console.log(`HTML5 validation: ${files.length} files, ${errors} errors`);
  process.exitCode = errors ? 1 : 0;
}
