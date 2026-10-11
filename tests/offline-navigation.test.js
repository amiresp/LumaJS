import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
test("opt-in offline worker precaches fallback and returns it on navigation failure",async()=>{
 const handlers=new Map(),cacheItems=new Map();
 let online=true;
 const offlineDocument={ok:true,headers:new Headers(),marker:"offline"};
 const onlineResponse={ok:true,headers:new Headers(),marker:"online"};
 const context={URL,Headers,
 self:{registration:{scope:"https://example.test/"},location:{origin:"https://example.test"},skipWaiting:async()=>{},clients:{claim:async()=>{}},addEventListener:(n,fn)=>handlers.set(n,fn)},
 caches:{keys:async()=>[],open:async()=>({put:async(k,v)=>cacheItems.set(typeof k==="string"?k:k.url,v),match:async(k)=>cacheItems.get(typeof k==="string"?k:k.url)})},
 fetch:async()=>{if(!online)throw Error("offline");return onlineResponse}
 };
 runInNewContext(readFileSync(new URL("../service-worker.js",import.meta.url),"utf8"),context);
 let install;handlers.get("install")({waitUntil:p=>{install=p;}});await install;
 assert.equal(cacheItems.has("https://example.test/offline.html"),true);
 online=false;let pending;
 handlers.get("fetch")({request:{url:"https://example.test/dashboard",method:"GET",mode:"navigate",headers:new Headers()},respondWith:p=>{pending=p;}});
 assert.equal(await pending,onlineResponse);
});
