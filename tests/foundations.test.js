import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { RouteResolver } from "../js/core/RouteResolver.js";
import { ThemeResolver } from "../js/shared/ThemeResolver.js";
import { LibraryManager } from "../js/core/LibraryManager.js";

test("routing is declarative and contains no business path knowledge", () => {
  const routes = new RouteResolver([{path:"/admin/items/:id",page:"Item"}]);
  assert.equal(routes.resolve("/admin/items/123").params.id,"123");
  assert.equal(routes.resolve("/other"),null);
  assert.throws(()=>routes.register({path:"/admin/items/:id"}),/Duplicate/);
});
test("theme fallback resolves ordered html and css independently", async()=>{
  const requests=[];
  const resolver=new ThemeResolver({base:"/",themes:["brand","core-default"],fetcher:async url=>{
    requests.push(url);
    return url.includes("core-default")?{ok:true,text:async()=>"<div>fallback</div>"}:{ok:false,status:404};
  }});
  assert.equal((await resolver.resolve("Slider")).theme,"core-default");
  assert.equal((await resolver.resolve("Slider","css")).theme,"core-default");
  assert.equal(requests.length,4);
});
test("library manager keeps CSS and JS loads distinct and deduplicated",async()=>{
  const dom=new JSDOM("<html><head></head><body></body></html>");
  try {
    const lib=new LibraryManager({documentRef:dom.window.document});
    const js=lib.ensureLoadedJS("swiper","/mock.js");
    const css=lib.ensureLoadedCSS("swiper","/mock.css");
    const again=lib.ensureLoadedJS("swiper","/mock.js");
    assert.equal(dom.window.document.querySelectorAll("script").length,1);
    assert.equal(dom.window.document.querySelectorAll('link[rel="stylesheet"]').length,1);
    dom.window.document.querySelector("script").dispatchEvent(new dom.window.Event("load"));
    dom.window.document.querySelector("link").dispatchEvent(new dom.window.Event("load"));
    await Promise.all([js,css,again]);
  }finally{dom.window.close();}
});

test("core-default is mandatory last HTML fallback", async () => {
  const requests=[];
  const resolver = new ThemeResolver({ themes: ["brand"],fetcher: async url => {
    requests.push(url);
    return url.includes("/core-default/") ? {ok:true,text:async()=>"<section>fallback</section>"} : {ok:false,status:404};
  }});
  const result=await resolver.resolve("Slider");
  assert.equal(result.theme,"core-default");
  assert.equal(requests.length,2);
});
test("app registry and core route resolver share parameterized route behavior", async () => {
  const { ApplicationRegistry } = await import("../js/shared/ApplicationRegistry.js");
  const app=new ApplicationRegistry({name:"web",routes:[{path:"/items/:id",page:"Detail"}]});
  assert.equal(app.resolve("/items/42").page,"Detail");
});
test("library manager times out without hanging on missing load event", async () => {
  const dom=new JSDOM("<html><head></head></html>");
  try {
    const library=new LibraryManager({documentRef:dom.window.document,timeout:5});
    await assert.rejects(library.ensureLoadedJS("missing","/missing.js"),/timeout/);
    assert.equal(dom.window.document.querySelectorAll("script").length,0);
  } finally {dom.window.close();}
});
