import test from "node:test";
import assert from "node:assert/strict";
import {normalizeText, searchOptions} from "../js/shared/widgets/customSelect/customSelect.js";
const entries = [
 {text:"Notebook",value:1,attr_subtext:"Stationery",attr_tokens:["paper","دفتر"]},
 {text:"Marker",value:2,attr_subtext:"Writing",attr_tokens:"pen ماژيک"},
 {text:"Folder",value:3,attr_tokens:[]}
];
test("searches text and optional attributes",()=>{
 assert.equal(searchOptions(entries,"notebook").length,1);
 assert.equal(searchOptions(entries,"stationery")[0].value,1);
 assert.equal(searchOptions(entries,"pen")[0].value,2);
 assert.equal(searchOptions(entries,"ماژیک")[0].value,2);
});
test("respects narrowed searchable fields",()=>{
 assert.equal(searchOptions(entries,"stationery",["text"]).length,0);
 assert.equal(searchOptions(entries,"stationery",["attr_subtext"]).length,1);
});
test("does not mutate data",()=>{
 const copy=structuredClone(entries);searchOptions(entries,"notebook");assert.deepEqual(entries,copy);
});
