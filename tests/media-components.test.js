import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { Slider } from "../js/dependency/global/GlobalComponents/Slider/Slider.js";
import { Stories } from "../js/dependency/global/GlobalComponents/Stories/Stories.js";

function domEnvironment(markup) {
  const dom = new JSDOM("<!doctype html><html><body>" + markup + "</body></html>");
  const backup = { AbortController: globalThis.AbortController, CustomEvent: globalThis.CustomEvent,
    document: globalThis.document, Element: globalThis.Element, matchMedia: globalThis.matchMedia };
  Object.assign(globalThis, {
    AbortController: dom.window.AbortController, CustomEvent: dom.window.CustomEvent,
    document: dom.window.document, Element: dom.window.Element,
    matchMedia: () => ({ matches: false })
  });
  return { dom, restore() { Object.assign(globalThis, backup); dom.window.close(); } };
}
test("Slider maintains index, pause, dynamic slides and idempotent destroy", () => {
  const env=domEnvironment('<div data-id="root"><div data-id="slides"><section data-id="slide">A</section><section data-id="slide">B</section></div><span data-id="counter"></span><button data-id="next"></button></div>');
  try {
    const root=document.querySelector('[data-id="root"]');
    const slider=new Slider(root,{autoplay:false});
    slider.next();
    assert.equal(root.querySelector('[data-id="counter"]').textContent,"2 / 2");
    slider.pause();assert.equal(slider.paused,true);
    slider.resume();assert.equal(slider.paused,false);
    const next=document.createElement("section");next.dataset.id="slide";
    slider.setSlides([next]);assert.equal(slider.slides.length,1);
    slider.destroy();slider.destroy();
  }finally{env.restore();}
});
test("Stories exposes pause/mute and closes without leaving timers", () => {
  const env=domEnvironment('<div data-id="root"><button data-id="open"></button><div data-id="viewer" hidden><span data-id="progress"></span><article data-id="story-item">A</article><article data-id="story-item">B</article><button data-id="close"></button><button data-id="pause"></button><button data-id="mute"></button></div></div>');
  try {
    const root=document.querySelector('[data-id="root"]');
    const stories=new Stories(root,{interval:10000});
    stories.open();assert.equal(stories.viewer.hidden,false);
    stories.pause();assert.equal(stories.paused,true);
    stories.toggleMute();assert.equal(stories.muted,false);
    stories.resume();assert.equal(stories.paused,false);
    stories.close();assert.equal(stories.timer,null);
    stories.destroy();stories.destroy();
  }finally{env.restore();}
});
