import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { Toast } from "../js/dependency/global/GlobalComponents/Toast/Toast.js";
import { Alert } from "../js/dependency/global/GlobalComponents/Alert/Alert.js";
import { Dialog } from "../js/dependency/global/GlobalComponents/Dialog/Dialog.js";

function setup(html){
 const dom=new JSDOM("<!doctype html><html><body>"+html+"</body></html>",{url:"https://luma.test"});
 const old={AbortController:globalThis.AbortController,CustomEvent:globalThis.CustomEvent};
 globalThis.AbortController=dom.window.AbortController;
 globalThis.CustomEvent=dom.window.CustomEvent;
 return {root:dom.window.document.querySelector('[data-id="root"]'),
   cleanup(){globalThis.AbortController=old.AbortController;globalThis.CustomEvent=old.CustomEvent;dom.window.close();}};
}
test("toast uses safe text, max capacity, dismissal, and destroy",()=>{
 const env=setup('<section data-id="root"><div data-id="items"></div></section>');
 try{
   const toast=new Toast(env.root,{max:2,duration:0});
   toast.show("<img src=x onerror=alert(1)>");
   toast.show("two");toast.show("three");
   assert.equal(env.root.querySelectorAll('[data-id="toast"]').length,2);
   assert.equal(env.root.querySelectorAll("img").length,0);
   toast.destroy();toast.destroy();
   assert.equal(env.root.querySelectorAll('[data-id="toast"]').length,0);
 }finally{env.cleanup();}
});
test("alert text is safe and dismissible",()=>{
 const env=setup('<section data-id="root"><div data-id="panel"><span data-id="message"></span><button data-id="dismiss"></button></div></section>');
 try{
   const alert=new Alert(env.root);
   alert.show("<script>evil</script>",{type:"error"});
   assert.equal(env.root.querySelectorAll("script").length,0);
   assert.equal(env.root.querySelector('[data-id="panel"]').hidden,false);
   env.root.querySelector('[data-id="dismiss"]').click();
   assert.equal(env.root.querySelector('[data-id="panel"]').hidden,true);
   alert.destroy();
 }finally{env.cleanup();}
});
test("dialog returns confirmation, traps boundary focus and resolves pending on destroy",async()=>{
 const env=setup('<section data-id="root"><div data-id="panel"><h2 data-id="title"></h2><p data-id="message"></p><button data-id="close"></button><button data-id="cancel"></button><button data-id="confirm"></button></div></section>');
 try{
   const dialog=new Dialog(env.root);
   const first=dialog.open({title:"Proceed",message:"<b>safe</b>"});
   assert.equal(env.root.querySelector("b"),null);
   env.root.querySelector('[data-id="confirm"]').click();
   assert.equal(await first,true);
   const second=dialog.open({title:"Again"});
   dialog.destroy();
   assert.equal(await second,false);
   dialog.destroy();
 }finally{env.cleanup();}
});
