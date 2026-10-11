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
