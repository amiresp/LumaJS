import {Button} from "../Button/Button.js";

/** Accessible multilevel navigation. data-id is the only behavioral hook. */
export class Sidebar {
  constructor(root) {
    this.root=root;
    this.nav=root.querySelector('[data-id="navigation"]');
    this.list=root.querySelector('[data-id="items"]');
    this.toggle=root.querySelector('[data-id="toggle"]');
    if(!this.nav || !this.list || !this.toggle)throw new Error("Sidebar theme hooks are missing");
    this.controller=new AbortController();
    this.menuButtons=[];
    this.toggleButton=new Button(this.toggle).configure({
      variant:"secondary",onClick:()=>this.setOpen(this.nav.hidden)
    });
  }
  setOpen(open) {
    this.nav.hidden=!open;
    this.toggle.setAttribute("aria-expanded",String(Boolean(open)));
  }
  setItems(items=[]) {
    if(!Array.isArray(items))throw new TypeError("Sidebar items must be an array");
    for(const button of this.menuButtons)button.destroy();
    this.menuButtons=[];
    this.list.replaceChildren();
    const doc=this.root.ownerDocument;
    const createLevel=(nodes,parent,depth=0)=>{
      for(const item of nodes){
        const li=doc.createElement("li");li.dataset.id="item";li.dataset.level=String(depth);
        const row=doc.createElement("div");row.dataset.id="item-row";
        const hasChildren=Array.isArray(item.children)&&item.children.length>0;
        const href=typeof item.href==="string"?item.href:null;
        const label=String(item.label??"");
        const a=doc.createElement(href?"a":"span");a.dataset.id="item-label";
        a.textContent=label;
        if(href){
          try {
            const url=new URL(href,doc.baseURI);
            if(["https:","http:"].includes(url.protocol))a.href=url.href;
            else a.removeAttribute("href");
          }catch{a.removeAttribute("href");}
        }
        if(item.active)a.setAttribute("aria-current","page");
        row.append(a);
        if(hasChildren){
          const expanded=Boolean(item.expanded??(item.active||item.children.some(child=>child.active)));
          const button=doc.createElement("button");
          button.type="button";button.dataset.id="expand";
          button.setAttribute("aria-label","Toggle "+label+" submenu");
          button.setAttribute("aria-expanded",String(expanded));
          button.textContent="⌄";
          const children=doc.createElement("ul");children.dataset.id="children";children.hidden=!expanded;
          createLevel(item.children,children,depth+1);
          this.menuButtons.push(new Button(button).configure({
            variant:"ghost",onClick:()=>{
              const open=children.hidden;
              children.hidden=!open;
              button.setAttribute("aria-expanded",String(open));
            }
          }));
          row.append(button);li.append(row,children);
        }else li.append(row);
        parent.append(li);
      }
    };
    createLevel(items,this.list);
    return this;
  }
  destroy(){
    this.controller.abort();
    this.toggleButton.destroy();
    for(const button of this.menuButtons)button.destroy();
    this.menuButtons=[];
  }
}
export const create=root=>new Sidebar(root);
