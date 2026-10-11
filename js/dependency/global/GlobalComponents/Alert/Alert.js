/** Inline dismissible status; safe text-only API. */
export class Alert {
  constructor(root){
    this.root=root;this.destroyed=false;
    this.panel=root.querySelector('[data-id="panel"]')||root;
    this.message=root.querySelector('[data-id="message"]');
    this.dismiss=root.querySelector('[data-id="dismiss"]');
    this.controller=new (root.ownerDocument.defaultView?.AbortController||AbortController)();
    this.dismiss?.addEventListener("click",()=>this.hide(),{signal:this.controller.signal});
    this.hide();
  }
  show(message,{type="info",dismissible=true}={}){
    if(this.destroyed)return;
    if(this.message)this.message.textContent=String(message??"");
    this.panel.dataset.type=["info","success","warning","error"].includes(type)?type:"info";
    this.panel.setAttribute("role",type==="error"?"alert":"status");
    if(this.dismiss)this.dismiss.hidden=!dismissible;
    this.panel.hidden=false;
  }
  hide(){this.panel.hidden=true;}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.controller.abort();this.hide();}
}
export function create(root){return new Alert(root);}
