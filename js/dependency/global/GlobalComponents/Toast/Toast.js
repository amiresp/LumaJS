import {createIconElement} from "../Icon/Icon.js";
import {Button} from "../Button/Button.js";
/** Non-modal notifications, scoped to its own theme root. */
export class Toast {
  constructor(root,{duration=4500,max=4}={}){
    this.root=root;this.duration=duration;this.max=max;this.entries=new Map();this.destroyed=false;
    this.list=root.querySelector('[data-id="items"]')||root;
  }
  show(message,{type="info",duration=this.duration}={}){
    if(this.destroyed)return null;
    const doc=this.root.ownerDocument;
    const item=doc.createElement("div");item.dataset.id="toast";item.dataset.type=["info","success","warning","error"].includes(type)?type:"info";
    item.setAttribute("role",type==="error"?"alert":"status");
    const text=doc.createElement("span");text.dataset.id="message";text.textContent=String(message??"");
    const close=doc.createElement("button");close.type="button";close.dataset.id="dismiss";close.setAttribute("aria-label","Dismiss notification");close.append(createIconElement("x",{documentRef:doc,size:18}));
    const status=doc.createElement("span");status.dataset.id="status-icon";status.append(createIconElement(({success:"circle-check",warning:"alert-triangle",error:"alert-circle",info:"info-circle"})[type]||"info-circle",{documentRef:doc,size:21}));
    item.append(status,text,close);this.list.append(item);
    const record={timer:null,close:()=>{if(!this.entries.has(item))return;clearTimeout(record.timer);record.button?.destroy();item.remove();this.entries.delete(item);}};
    record.button=new Button(close).configure({variant:"ghost",onClick:record.close});
    this.entries.set(item,record);
    if(duration>0)record.timer=setTimeout(record.close,duration);
    while(this.entries.size>this.max)this.entries.values().next().value.close();
    return {dismiss:record.close,element:item};
  }
  clear(){for(const entry of [...this.entries.values()])entry.close();}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.clear();}
}
export function create(root){return new Toast(root);}
