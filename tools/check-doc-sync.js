#!/usr/bin/env node
import { execFileSync } from "node:child_process";
if (!process.env.GITHUB_BASE_REF) {
  console.log("Documentation synchronization: PR-only diff gate; main push documentation is reviewed separately");
  process.exit(0);
}
const base = "origin/"+process.env.GITHUB_BASE_REF;
const raw = execFileSync("git",["diff","--name-only",base+"...HEAD"],{encoding:"utf8"});
const paths=raw.split("\n").map(x=>x.trim()).filter(Boolean);
const relevant=paths.some(x=>/^(js\/|apps\/|themes\/|examples\/|service-worker\.js$|offline\.html$)/.test(x));
if(relevant){
 const required=["README.md","AGENTS.md","docs/architecture.md","docs/migration-status.md"];
 const missing=required.filter(x=>!paths.includes(x));
 if(!paths.some(x=>x.startsWith("docs/")))missing.push("docs/ (feature documentation)");
 if(missing.length){console.error("Documentation update required: "+missing.join(", "));process.exitCode=1;}
 else console.log("Documentation synchronization: matching source and docs changed");
}else console.log("Documentation synchronization: no production source changes");
