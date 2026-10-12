import {Button} from "../Button/Button.js";
export class Pagination{
 constructor(root){
  this.root=root;this.page=1;this.total=0;this.pageSize=10;this.callback=null;
  this.buttons=[];
  this.controller=new AbortController();
  const prev=root.querySelector('[data-id="previous"]'),next=root.querySelector('[data-id="next"]');
  if(!prev||!next||!root.querySelector('[data-id="pages"]'))throw new Error("Pagination template is incomplete");
  this.buttons.push(new Button(prev).configure({variant:"secondary",onClick:()=>this.go(this.page-1)}));
  this.buttons.push(new Button(next).configure({variant:"secondary",onClick:()=>this.go(this.page+1)}));
 }
 configure({page=1,total=0,pageSize=10,onChange}={}){
  this.total=Math.max(0,Number(total)||0);this.pageSize=Math.max(1,Number(pageSize)||10);
  this.callback=onChange;this.go(page,false);return this;
 }
 get pages(){return Math.ceil(this.total/this.pageSize);}
 go(page,emit=true){
  this.page=Math.min(Math.max(1,Math.floor(page)||1),Math.max(1,this.pages));
  const doc=this.root.ownerDocument,host=this.root.querySelector('[data-id="pages"]');
  for(const button of this.buttons.slice(2))button.destroy();
  this.buttons.length=2;host.replaceChildren();
  for(let i=Math.max(1,this.page-2);i<=Math.min(this.pages,this.page+2);i++){
   const b=doc.createElement("button");b.type="button";b.dataset.id="page";b.dataset.page=String(i);
   b.textContent=String(i);
   if(i===this.page)b.setAttribute("aria-current","page");
   this.buttons.push(new Button(b).configure({variant:"secondary",onClick:()=>this.go(i)}));
   host.append(b);
  }
  this.root.querySelector('[data-id="previous"]').disabled=this.page<=1;
  this.root.querySelector('[data-id="next"]').disabled=this.page>=this.pages;
  if(emit)this.callback?.(this.page);
 }
 destroy(){this.controller.abort();for(const button of this.buttons)button.destroy();this.buttons=[];this.callback=null;}
}
export const create=root=>new Pagination(root);
