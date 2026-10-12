import {createIconElement} from "../Icon/Icon.js";
import {Button} from "../Button/Button.js";
/** Focus-managed modal confirmation dialog; no HTML injection. */
export class Dialog {
  constructor(root){
    this.root=root;this.panel=root.querySelector('[data-id="panel"]');
    if(!this.panel)throw Error("Dialog requires data-id=panel");
    this.title=root.querySelector('[data-id="title"]');
    this.message=root.querySelector('[data-id="message"]');
    this.confirm=root.querySelector('[data-id="confirm"]');
    this.cancel=root.querySelector('[data-id="cancel"]');
    this.closeButton=root.querySelector('[data-id="close"]');
    if(this.closeButton)this.closeButton.replaceChildren(createIconElement("x",{documentRef:root.ownerDocument,size:20}));
    this.controller=new (root.ownerDocument.defaultView?.AbortController||AbortController)();
    this.pending=null;this.previousFocus=null;this.destroyed=false;
    const signal=this.controller.signal;
    this.buttons=[];
    if(this.confirm)this.buttons.push(new Button(this.confirm).configure({variant:"primary",onClick:()=>this.close(true)}));
    if(this.cancel)this.buttons.push(new Button(this.cancel).configure({variant:"secondary",onClick:()=>this.close(false)}));
    if(this.closeButton)this.buttons.push(new Button(this.closeButton).configure({variant:"ghost",onClick:()=>this.close(false)}));
    this.panel.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();this.close(false);}
      if(event.key!=="Tab")return;
      const tabbable=[...this.panel.querySelectorAll('button:not([disabled]):not([hidden]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden);
      if(!tabbable.length){event.preventDefault();this.panel.focus();return;}
      const first=tabbable[0],last=tabbable.at(-1);
      if(event.shiftKey&&this.root.ownerDocument.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&this.root.ownerDocument.activeElement===last){event.preventDefault();first.focus();}
    },{signal});
    this.panel.hidden=true;
    this.panel.setAttribute("role","dialog");this.panel.setAttribute("aria-modal","true");
    if(!this.panel.hasAttribute("tabindex"))this.panel.tabIndex=-1;
  }
  open({title="",message="",confirmText="Confirm",cancelText="Cancel"}={}){
    if(this.destroyed)return Promise.resolve(false);
    if(this.pending)this.close(false);
    if(this.title)this.title.textContent=String(title);
    if(this.message)this.message.textContent=String(message);
    if(this.confirm)this.confirm.textContent=String(confirmText);
    if(this.cancel)this.cancel.textContent=String(cancelText);
    this.previousFocus=this.root.ownerDocument.activeElement;
    this.panel.hidden=false;
    this.panel.focus();
    return new Promise(resolve=>{this.pending=resolve;});
  }
  close(result=false){
    if(!this.pending&&!this.panel.hidden){this.panel.hidden=true;return;}
    const resolve=this.pending;this.pending=null;this.panel.hidden=true;
    if(this.previousFocus?.isConnected)this.previousFocus.focus();
    this.previousFocus=null;resolve?.(Boolean(result));
  }
  destroy(){if(this.destroyed)return;this.destroyed=true;this.close(false);this.controller.abort();for(const button of this.buttons)button.destroy();}
}
export function create(root){return new Dialog(root);}
