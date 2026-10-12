import {Button} from "../Button/Button.js";
import {createIconElement,renderIcon} from "../Icon/Icon.js";
/** Inline dismissible status; safe text-only API. */
export class Alert {
  constructor(root){
    this.root=root;this.destroyed=false;
    this.panel=root.querySelector('[data-id="panel"]')||root;
    this.message=root.querySelector('[data-id="message"]');
    this.dismiss=root.querySelector('[data-id="dismiss"]');
    if(this.dismiss){this.dismiss.replaceChildren(createIconElement("x",{documentRef:root.ownerDocument,size:18}));}
    this.controller=new (root.ownerDocument.defaultView?.AbortController||AbortController)();
    this.dismissButton=this.dismiss?new Button(this.dismiss).configure({variant:"secondary",onClick:()=>this.hide()}):null;
    this.hide();
  }
  show(message,{type="info",dismissible=true}={}){
    if(this.destroyed)return;
    if(this.message)this.message.textContent=String(message??"");
    this.panel.dataset.type=["info","success","warning","error"].includes(type)?type:"info";
    this.panel.setAttribute("role",type==="error"?"alert":"status");
    const icon=this.root.querySelector('[data-id="status-icon"]');
    if(icon)renderIcon(icon,({success:"circle-check",error:"alert-circle",warning:"alert-triangle",info:"info-circle"})[type]||"info-circle",{size:20});
    if(this.dismiss)this.dismiss.hidden=!dismissible;
    this.panel.hidden=false;
  }
  hide(){this.panel.hidden=true;}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.controller.abort();this.dismissButton?.destroy();this.hide();}
}
export function create(root){return new Alert(root);}
