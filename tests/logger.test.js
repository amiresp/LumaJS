import test from "node:test";
import assert from "node:assert/strict";
import {Logger,LOG_LEVELS,logger} from "../js/shared/Logger.js";
test("shared logger filters by level and preserves structured arguments",()=>{
 const calls=[];const sink=Object.fromEntries(["debug","info","warn","error"].map(level=>[level,(...args)=>calls.push([level,args])]));
 const log=new Logger({level:"warn",sink,prefix:"Orders"});
 assert.equal(log.debug("hidden"),false);
 assert.equal(log.info("hidden"),false);
 const error=new Error("network");
 assert.equal(log.warn("empty",{count:0}),true);
 assert.equal(log.error("failed",error),true);
 assert.deepEqual(calls,[["warn",["[Orders]","empty",{count:0}]],["error",["[Orders]","failed",error]]]);
 log.setLevel("debug");assert.equal(log.debug("visible"),true);
 log.setEnabled(false);assert.equal(log.error("hidden"),false);
 assert.equal(calls.length,3);
});
test("logger validates levels, supports silent and fallback sink",()=>{
 assert.equal(LOG_LEVELS.info,20);
 assert.throws(()=>new Logger({level:"verbose"}),RangeError);
 const calls=[];const log=new Logger({sink:{log:(...args)=>calls.push(args)},level:"silent"});
 assert.equal(log.error("hidden"),false);
 log.setLevel("info");assert.equal(log.info("shown"),true);
 assert.deepEqual(calls,[["shown"]]);
 assert.throws(()=>log.log("fatal","x"),RangeError);
});
test("scoped loggers are independent and shared singleton is usable",()=>{
 const calls=[];const parent=new Logger({prefix:"Feature",level:"debug",sink:{info:(...args)=>calls.push(args)}});
 const child=parent.child("Orders");child.info("loaded");
 parent.setLevel("silent");child.info("still logging");
 assert.deepEqual(calls,[["[Feature:Orders]","loaded"],["[Feature:Orders]","still logging"]]);
 assert.throws(()=>parent.child(" "),TypeError);
 assert.equal(logger instanceof Logger,true);
});
