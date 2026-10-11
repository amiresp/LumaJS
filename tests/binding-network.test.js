import test from "node:test";
import assert from "node:assert/strict";
import { HttpClient } from "../js/core/HttpClient.js";
test("HTTP client retries server errors for GET and returns success",async()=>{
  let calls=0;
  const client=new HttpClient({retryDelay:0,retries:2,fetcher:async()=>({ok:++calls>=2,status:calls>=2?200:503})});
  const response=await client.request("/resource");
  assert.equal(response.status,200);assert.equal(calls,2);
});
test("HTTP client does not retry unsafe POST", async()=>{
  let calls=0;
  const client=new HttpClient({retryDelay:0,retries:3,fetcher:async()=>({ok:false,status:503,attempt:++calls})});
  await client.request("/update",{method:"POST"});assert.equal(calls,1);
});
