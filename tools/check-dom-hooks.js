#!/usr/bin/env node
// Enforce data-id hooks for UI binding. CSS and semantic tag queries aren't affected.
import {readFileSync,readdirSync,statSync} from "node:fs";
import {join} from "node:path";
const roots=["js","apps","examples","tests"];
const violations=[];
function visit(path){
 for(const name of readdirSync(path)){
  const file=join(path,name);
  if(statSync(file).isDirectory()){visit(file);continue;}
  if(!/\.(?:js|html)$/.test(name))continue;
  const source=readFileSync(file,"utf8");
  const checks=[
   {re:/\bgetElementById\s*\(/g,message:"getElementById is forbidden; use data-id"},
   {re:/\b(?:querySelector|querySelectorAll|closest|matches|locator)\s*\(\s*(['"`])\s*#[A-Za-z_][\w-]*/g,message:"ID selector is forbidden; use [data-id]"},
   {re:/\b(?:querySelector|querySelectorAll|closest|matches|locator)\s*\(\s*(['"`])\s*\.[A-Za-z_][\w-]*/g,message:"Class-based behavior hook is forbidden; use [data-id]"}
  ];
  for(const {re,message} of checks){
   for(const match of source.matchAll(re)){
    const line=source.slice(0,match.index).split("\n").length;
    violations.push(file+":"+line+" "+message);
   }
  }
 }
}
for(const root of roots)visit(root);
violations.forEach(item=>console.error(item));
console.log("DOM selector contract: "+(violations.length?"FAILED":"PASS"));
if(violations.length)process.exitCode=1;
