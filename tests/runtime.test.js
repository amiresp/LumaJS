import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { Luma } from "../js/core/Luma.js";

const pause = () => new Promise(resolve => setTimeout(resolve, 0));
function setup(markup = '<div id="a" data-luma="A"></div><div id="b" data-luma="B"></div>') {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + markup + '</body></html>', {url:"https://luma.test/"});
  const original = {document:globalThis.document, location:globalThis.location, Element:globalThis.Element,
    CustomEvent:globalThis.CustomEvent, fetch:globalThis.fetch};
  Object.assign(globalThis, {document:dom.window.document, location:dom.window.location,
    Element:dom.window.Element, CustomEvent:dom.window.CustomEvent});
  const assets = new Map();
  globalThis.fetch = async url => {
    const value = assets.get(new URL(url).pathname);
    return value === undefined ? {ok:false,status:404} : {ok:true,text:async()=>value};
  };
  return {dom, assets, restore() { Object.assign(globalThis,original); dom.window.close(); }};
}
test("theme fallback mounts and destroys independent components", async () => {
  const env=setup();
  try {
    env.assets.set("/themes/core-default/dependency/Global/A/A.html", '<div data-id="root">A</div>');
    env.assets.set("/themes/core-default/dependency/Global/B/B.html", '<div data-id="root">B</div>');
    let disposed=0;
    const runtime = new Luma({theme:"missing-theme",onError:()=>{}});
    runtime.register("A",{load:async()=>({create:()=>({destroy(){disposed++}})})});
    runtime.register("B",{load:async()=>({create:()=>({destroy(){disposed++}})})});
    await runtime.hydrate();
    assert.equal(env.dom.window.document.getElementById("a").dataset.loadState,"ready");
    assert.equal(env.dom.window.document.getElementById("b").dataset.loadState,"ready");
    await runtime.destroy();
    assert.equal(disposed,2);
  } finally {env.restore();}
});
test("one failing component does not prevent sibling mount", async()=>{
  const env=setup();
  try {
    env.assets.set("/themes/core-default/dependency/Global/A/A.html",'<div data-id="root"></div>');
    env.assets.set("/themes/core-default/dependency/Global/B/B.html",'<div data-id="root"></div>');
    const errors=[]; const runtime=new Luma({onError:e=>errors.push(e)});
    runtime.register("A",{load:async()=>({create(){throw Error("boom")}})});
    runtime.register("B",{load:async()=>({create(){return {destroy(){}}}})});
    await runtime.hydrate();
    assert.equal(env.dom.window.document.getElementById("a").dataset.loadState,"error");
    assert.equal(env.dom.window.document.getElementById("b").dataset.loadState,"ready");
    assert.equal(errors.length,1);
    await runtime.destroy();
  }finally{env.restore();}
});
test("destroying one scope does not cancel a pending sibling",async()=>{
  const env=setup();
  try {
    env.assets.set("/themes/core-default/dependency/Global/A/A.html",'<div data-id="root"></div>');
    env.assets.set("/themes/core-default/dependency/Global/B/B.html",'<div data-id="root"></div>');
    let releaseA; const waiting=new Promise(resolve=>{releaseA=resolve;});
    const runtime=new Luma({onError:()=>{}});
    runtime.register("A",{load:async()=>{await waiting;return {create:()=>({destroy(){}})}}});
    runtime.register("B",{load:async()=>({create:()=>({destroy(){}})})});
    const a=document.getElementById("a"),b=document.getElementById("b");
    const pendingA=runtime.mount(a),pendingB=runtime.mount(b);
    const destroyed=runtime.destroy(a); releaseA();
    await Promise.all([pendingA,pendingB,destroyed]);
    assert.notEqual(a.dataset.loadState,"ready");
    assert.equal(b.dataset.loadState,"ready");
    await runtime.destroy();
  }finally{env.restore();}
});

test("nested component is hydrated under parent and both clean up", async () => {
  const env=setup('<div id="a" data-luma="A"></div>');
  try {
    env.assets.set("/themes/core-default/dependency/Global/A/A.html", '<div data-id="root"><div id="nested" data-luma="B"></div></div>');
    env.assets.set("/themes/core-default/dependency/Global/B/B.html", '<div data-id="root">B</div>');
    const cleaned=[];const runtime=new Luma({onError:()=>{}});
    runtime.register("A",{load:async()=>({create:()=>({destroy(){cleaned.push("A")}})})});
    runtime.register("B",{load:async()=>({create:()=>({destroy(){cleaned.push("B")}})})});
    await runtime.hydrate();
    assert.equal(document.getElementById("nested").dataset.loadState,"ready");
    await runtime.destroy();
    assert.deepEqual(cleaned.sort(),["A","B"]);
  }finally{env.restore();}
});
test("restart of failed host can mount successfully after recovery",async()=>{
  const env=setup('<div id="a" data-luma="A"></div>');
  try {
    const runtime=new Luma({onError:()=>{}});
    runtime.register("A",{load:async()=>({create:()=>({destroy(){}})})});
    await runtime.hydrate();
    assert.equal(document.getElementById("a").dataset.loadState,"error");
    env.assets.set("/themes/core-default/dependency/Global/A/A.html",'<div data-id="root"></div>');
    await runtime.restart(document.getElementById("a"));
    assert.equal(document.getElementById("a").dataset.loadState,"ready");
    await runtime.destroy();
  }finally{env.restore();}
});
