import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

test("offline service worker caches only allowlisted public files and falls back on network outage", async () => {
  const handlers = new Map();
  const store = new Map();
  let networkUp = true;
  const response = { ok:true, type:"basic", headers:new Headers(), clone() { return this; } };
  const cache = {
    async put(req, res) {store.set(typeof req==="string"?req:req.url, res);},
    async match(req) {return store.get(typeof req==="string"?req:req.url);}
  };
  const context = {
    URL, Headers,
    self: {
      registration: {scope:"https://example.test/"},
      location: {origin:"https://example.test"},
      addEventListener(name, callback) {handlers.set(name, callback);},
      skipWaiting: async()=>{},
      clients: {claim:async()=>{}}
    },
    caches: {open:async()=>cache,keys:async()=>[]},
    fetch:async()=>{if (!networkUp) throw Error("offline");return response;}
  };
  runInNewContext(readFileSync(new URL("../service-worker.js",import.meta.url),"utf8"),context);
  async function request(url,options={}){
    let pending;
    const req={url:"https://example.test"+url,method:"GET",mode:"cors",headers:new Headers(),...options};
    handlers.get("fetch")({request:req,respondWith(result){pending=result;}});
    return pending;
  }
  await request("/js/core/Luma.js");
  assert.equal(store.has("https://example.test/js/core/Luma.js"),true);
  networkUp=false;
  assert.equal(await request("/js/core/Luma.js"),response);
  assert.equal(await request("/admin/private.html"),undefined);
  assert.equal(await request("/api/profile.json"),undefined);
  assert.equal(await request("/themes/core-default/secret.html",{headers:new Headers({Authorization:"Bearer x"})}),undefined);
});
