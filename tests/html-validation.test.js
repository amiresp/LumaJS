import test from "node:test";import assert from "node:assert/strict";
import {validateHtml} from "../tools/validate-html.js";
test("finds literal backslash-n",()=>assert.ok(validateHtml(String.raw`<p>hello\nworld</p>`).length));
test("finds accidental slash-n",()=>assert.ok(validateHtml("<p>hello /n world</p>").length));
test("accepts legitimate newlines",()=>assert.deepEqual(validateHtml("<p>hello\nworld</p>"),[]));
test("ignores script string escapes",()=>assert.deepEqual(validateHtml(String.raw`<script>const x='\n';</script>`),[]));
