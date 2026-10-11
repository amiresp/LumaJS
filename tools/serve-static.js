#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve(".");
const port = Number(process.env.PORT || 8765);
const types = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    let file=resolve(root,"."+pathname);
    if(file!==root && !file.startsWith(root+sep)){res.writeHead(403).end();return;}
    if((await stat(file)).isDirectory()) file=resolve(file,"index.html");
    const contents=await readFile(file);
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(contents);
  } catch {res.writeHead(404).end("Not found");}
}).listen(port,"127.0.0.1",()=>console.log("Luma test server port "+port));
