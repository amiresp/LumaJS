import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerOffline } from "../js/shared/offline/registerOffline.js";
test("Service Worker is strictly opt-in and source forbids caching API requests", async () => {
  const original = { navigator: globalThis.navigator, isSecureContext: globalThis.isSecureContext };
  try {
    Object.defineProperty(globalThis, "navigator", {configurable:true,value:{}});
    globalThis.isSecureContext = false;
    assert.equal(await registerOffline(), null);
    const src = readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");
    assert.match(src,/request\.method !== "GET"/);
    assert.match(src,/request\.headers\.has\("authorization"\)/);
    assert.match(src,/request\.mode === "navigate"/);
    assert.match(src,/cache\.put/);
  } finally {
    if(original.navigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis,"navigator",{configurable:true,value:original.navigator});
    globalThis.isSecureContext = original.isSecureContext;
  }
});
