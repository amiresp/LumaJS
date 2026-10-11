import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { CustomSelect } from "../js/shared/widgets/customSelect/customSelect.js";
function setup(){
 const dom=new JSDOM('<!doctype html><html><body><div data-id="one" data-search-fields="attr_tokens"></div><div data-id="two"></div></body></html>',{url:"https://luma.test"});
 const old={document:globalThis.document, Element:globalThis.Element,CustomEvent:globalThis.CustomEvent,AbortController:globalThis.AbortController};
 Object.assign(globalThis,{document:dom.window.document,Element:dom.window.Element,CustomEvent:dom.window.CustomEvent,AbortController:dom.window.AbortController});
 return {dom,restore(){Object.assign(globalThis,old);dom.window.close()}};
}
const data=[{value:"one",text:"One",attr_tokens:["alpha"]},{value:"two",text:"Two",attr_tokens:["beta"]}];
test("customSelect handles single/multi selection, attribute search and destroy",()=>{
 const {dom,restore}=setup();
 try {
  const one=new CustomSelect(document.querySelector('[data-id="one"]'),data);
  const two=new CustomSelect(document.querySelector('[data-id="two"]'),data,"Pick","",true);
  one.searchBox.value="beta";
  assert.equal(one.visibleOptions().length,1);
  one.setValue("one");assert.equal(one.getValue(),"one");
  two.setValue(["one","two"]);assert.deepEqual(two.getValue(),["one","two"]);
  one.openDropdown();two.openDropdown();assert.equal(one.dropdown.hidden,true);
  one.destroy();one.destroy();two.destroy();
  assert.equal(document.querySelectorAll(".luma-custom-select").length,0);
 }finally{restore();}
});
