import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { Luma } from "../js/core/Luma.js";
import { GlobalCaller } from "../js/dependency/global/GlobalCaller.js";
import { GlobalApp } from "../js/dependency/global/GlobalApp.js";
import { SampleApp } from "../js/Features/Sample/SampleApp.js";
import { SampleCaller } from "../js/Features/Sample/SampleCaller.js";
import { SampleOption } from "../js/Option/Sample/SampleApp.js";
import { renderHome } from "../apps/website/pages/Home.js";
import { config } from "../apps/website/config.js";

test("GlobalApp registers shared widgets without domain-specific core routes",()=>{
 const runtime=new Luma();const app=new GlobalApp(runtime);
 app.register();app.register();
 assert.equal(runtime.registry.has("Alert"),true);
 assert.equal(runtime.registry.has("Stories"),true);
 assert.equal(runtime.registry.has("Hotel"),false);
 app.caller.destroy();
});
test("GlobalCaller supports injected adapter and abort",async()=>{
 const caller=new GlobalCaller({base:"https://example.test/ui/",fetcher:async url=>({ok:true,json:async()=>({path:url.pathname})})});
 assert.deepEqual(await caller.getJSON("data.json"),{path:"/ui/data.json"});
 caller.destroy();
});
test("feature option and page templates are independent and safely mounted",()=>{
 const dom=new JSDOM("<html><body><main><h1 data-id='sample-title'></h1><p data-id='option-message'></p></main><section></section></body></html>");
 try {
  const doc=dom.window.document,root=doc.querySelector("main");
  const feature=new SampleApp(); assert.equal(feature.mount(root),feature);
  const option=new SampleOption();option.mount(root);
  assert.equal(root.querySelector('[data-id="sample-title"]').textContent,"Sample feature");
  assert.equal(root.querySelector('[data-id="option-message"]').textContent,"Sample option enabled");
  const page=renderHome(doc.querySelector("section")); assert.match(doc.querySelector("section").textContent,/LumaJS website/);
  page.destroy();feature.destroy();option.destroy();
  assert.equal(doc.querySelector("section").textContent,"");
  assert.ok(config.routes.some(r=>r.path==="/sample"));
 }finally{dom.window.close();}
});
