#!/usr/bin/env node
/**
 * Repository-level source security gate. Complements, not replaces, human review.
 * Runtime source only: flags dynamic execution, unsafe sinks and domain-specific URLs.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
const roots = ["js/core", "js/shared", "js/dependency", "apps"];
const ignored = new Set(["node_modules", "vendor", "dist", "build"]);
const checks = [
  [/\b(?:eval|Function)\s*\(/g, "dynamic code execution"],
  [/\.insertAdjacentHTML\s*\(/g, "unsafe HTML sink"],
  [/\b(?:document\.write)\s*\(/g, "document.write"],
  [/\bon\w+\s*=\s*["']\s*javascript:/gi, "inline event execution"],
  [/\bjavascript\s*:/gi, "javascript: URL"]
];
function collect(dir) {
  if (!statSync(dir).isDirectory()) return dir.endsWith(".js") ? [dir] : [];
  return readdirSync(dir).flatMap(name => ignored.has(name) ? [] : collect(join(dir,name)));
}
export function auditSource(file, code) {
  const issues = [];
  for (const [re, label] of checks) for (const match of code.matchAll(re)) {
    issues.push({ file, line: code.slice(0, match.index).split("\n").length, label });
  }
  return issues;
}
const problems = roots.flatMap(folder => collect(resolve(folder))).flatMap(file => auditSource(relative(".",file),readFileSync(file,"utf8")));
for (const error of problems) console.error(`${error.file}:${error.line}: ${error.label}`);
console.log(`Security source audit: ${problems.length} findings`);
if (problems.length) process.exitCode = 1;
