import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { BindEngine } from "../js/core/BindEngine.js";
import { HttpClient } from "../js/core/HttpClient.js";
test("binding uses text, blocks attribute injection and handles case-insensitive paths", () => {
  const dom = new JSDOM('<main><span data-bind-text="user.name"></span><a data-bind-attr="title:user.name"></a></main>');
  const binder = new BindEngine();
  binder.bind(dom.window.document.querySelector("main"),{ User: { Name: "<img src=x onerror=alert(1)>" } });
  assert.equal(dom.window.document.querySelectorAll("img").length, 0);
  assert.equal(dom.window.document.querySelector("span").textContent, "<img src=x onerror=alert(1)>");
  dom.window.document.querySelector("a").dataset.bindAttr = "onclick:user.name";
  assert.throws(() => binder.bind(dom.window.document.querySelector("main"), {user:{name:"x"}}), /Unsafe/);
  dom.window.close();
});
test("HTTP client retries server errors for GET and returns success",async()=>{
  let calls=0;
  const client=new HttpClient({retryDelay:0,retries:2,fetcher:async()=>({ok:++calls>=2,status:calls>=2?200:503})});
  const response=await client.request("/resource");
  assert.equal(response.status,200);assert.equal(calls,2);
});
test("HTTP client does not retry unsafe POST", async()=>{
  let calls=0;
  const client=new HttpClient({retryDelay:0,retries:3,fetcher:async()=>({ok:false,status:503,attempt:++calls})});
  await client.request("/update",{method:"POST"});assert.equal(calls,1);
});
