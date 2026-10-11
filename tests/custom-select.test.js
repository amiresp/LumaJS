import test from "node:test";
import assert from "node:assert/strict";
import {normalizeText, searchOptions} from "../js/shared/widgets/customSelect/customSelect.js";
const entries = [
 {text:"Tehran",value:1,attr_subtext:"Capital",attr_tokens:["THR","تهران"]},
 {text:"Tabriz",value:2,attr_subtext:"Northwest",attr_tokens:"TBZ تبریز"},
 {text:"Shiraz",value:3,attr_tokens:[]}
];
test("searches primary text and optional attribute fields",()=>{
 assert.equal(searchOptions(entries,"tab").length,1);
 assert.equal(searchOptions(entries,"capital")[0].value,1);
 assert.equal(searchOptions(entries,"tbz")[0].value,2);
 assert.equal(searchOptions(entries,"تبريز")[0].value,2);
});
test("allows narrowing search fields",()=>{
 assert.equal(searchOptions(entries,"capital",["text"]).length,0);
 assert.equal(searchOptions(entries,"capital",["attr_subtext"]).length,1);
});
test("does not mutate caller options",()=>{
 const copy=structuredClone(entries);searchOptions(entries,"teh");assert.deepEqual(entries,copy);
});
