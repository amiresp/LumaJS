import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";
import {iconNames,icons,createIconElement,renderIcon,Icon} from "../js/dependency/global/GlobalComponents/Icon/Icon.js";

test("icons include every requested category and all directions",()=>{
 for(const name of ["arrow-left","arrow-right","arrow-up","arrow-down","arrow-up-left","arrow-up-right","arrow-down-left","arrow-down-right","menu-2","credit-card","user-circle","login","logout","info-circle","alert-triangle","wallet","currency-dollar","language","dots","brand-telegram","brand-whatsapp","brand-linkedin","brand-youtube","brand-facebook","home","layout-dashboard","player-play","player-pause","search","map-pin","check","square-check","square-x","plus","minus","x","phone-call","edit","eye","download","copy","moon","sun","share","zoom-in","zoom-out","chart-bar","clock"]){
  assert.ok(iconNames.includes(name),"Missing official Tabler icon "+name);
 }
 assert.ok(iconNames.length>=100);
});
test("accessible, inert SVG element created from approved names",()=>{
 const dom=new JSDOM("<main><div data-id='root'></div></main>");
 try{
  const svg=createIconElement("info",{documentRef:dom.window.document,size:28,label:"Information"});
  assert.equal(svg.localName,"svg");
  assert.equal(svg.getAttribute("role"),"img");
  assert.equal(svg.getAttribute("aria-label"),"Information");
  assert.equal(svg.getAttribute("width"),"28");
  assert.equal(svg.querySelector("script"),null);
  assert.throws(()=>createIconElement("<img>",{documentRef:dom.window.document}),/Unknown icon/);
  const root=dom.window.document.querySelector('[data-id="root"]');
  renderIcon(root,"menu-2");
  assert.equal(root.querySelectorAll("svg").length,1);
  const component=new Icon(root,{name:"home"});
  component.set("arrow-right");assert.equal(root.querySelectorAll("svg").length,1);
  component.destroy();component.destroy();assert.equal(root.children.length,0);
 }finally{dom.window.close();}
});
test("all icon assets parse to standalone SVG",()=>{
 const dom=new JSDOM("");
 try{
  const parser=new dom.window.DOMParser();
  for(const [name,markup] of Object.entries(icons)){
    const doc=parser.parseFromString(markup,"image/svg+xml");
    assert.equal(doc.querySelector("parsererror"),null,name);
    assert.equal(doc.documentElement.localName,"svg",name);
    assert.equal(doc.querySelector("script,foreignObject"),null,name);
  }
 }finally{dom.window.close();}
});
