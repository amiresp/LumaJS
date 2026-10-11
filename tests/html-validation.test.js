import test from "node:test";import assert from "node:assert/strict";
import {validateHtml} from "../tools/validate-html.js";
test("finds literal backslash-n",()=>assert.ok(validateHtml(String.raw`<p>hello\nworld</p>`).length));
test("finds accidental slash-n",()=>assert.ok(validateHtml("<p>hello /n world</p>").length));
test("accepts legitimate newlines",()=>assert.deepEqual(validateHtml("<p>hello\nworld</p>"),[]));
test("ignores script string escapes",()=>assert.deepEqual(validateHtml(String.raw`<script>const x='\n';</script>`),[]));

test("rejects inline HTML event handlers", () => {
  assert.ok(validateHtml('<img src="/safe.png" onerror="alert(1)">',{fragment:true}).some(x=>x.includes("unsafe HTML")));
});
test("rejects executable URL schemes in link attributes", () => {
  assert.ok(validateHtml('<a href="javascript:alert(1)">bad</a>',{fragment:true}).some(x=>x.includes("unsafe URL")));
});
test("rejects srcdoc injection", () => {
  assert.ok(validateHtml('<iframe srcdoc="<script>alert(1)</script>"></iframe>',{fragment:true}).some(x=>x.includes("unsafe HTML")));
});
