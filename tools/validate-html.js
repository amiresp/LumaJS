#!/usr/bin/env node
/** Dependency-free HTML hygiene validation for the whole repository. */
import {readFileSync, readdirSync, statSync} from "node:fs";
import {resolve, join, extname} from "node:path";
const skip = new Set(["node_modules",".git","vendor","dist","build"]);
export function validateHtml(text){
 const errors=[]; const lines=text.split(/\r?\n/);
 let raw=false;
 lines.forEach((line,i)=>{
   const noScripts=line.replace(/<script\b[^>]*>.*?<\/script>/gi,"").replace(/<style\b[^>]*>.*?<\/style>/gi,"");
   if (/<script\b/i.test(line)) raw=true;
   if (!raw || /<\/script>/i.test(line)) {
     if (/\\n/.test(noScripts)) errors.push(`line ${i+1}: literal \\n`);
     if (/(?:^|\s|>)\/n(?=\s|<|$)/.test(noScripts)) errors.push(`line ${i+1}: suspicious /n`);
   }
   if (/<\/script>/i.test(line)) raw=false;
 });
 return errors;
}
function scan(path){
 if(statSync(path).isDirectory()) return readdirSync(path).flatMap(name=>skip.has(name)?[]:scan(join(path,name)));
 return extname(path)===".html"?[path]:[];
}
if(process.argv[1] && resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
 let count=0;for(const file of scan(resolve("."))){
  const errors=validateHtml(readFileSync(file,"utf8"));
  errors.forEach(error=>console.error(`${file}: ${error}`));count+=errors.length;
 }
 console.log(`HTML hygiene: ${count} errors`);process.exitCode=count?1:0;
}
