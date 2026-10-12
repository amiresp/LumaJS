import { Pagination } from "../Pagination/Pagination.js";

/** In-memory sortable/searchable grid composed with shared Pagination and Button. */
export class DataGrid {
  constructor(root) {
    this.root=root;this.rows=[];this.columns=[];this.page=1;this.pageSize=10;
    this.query="";this.sortKey=null;this.sortDir=1;
    this.controller=new AbortController();
    const host=root.querySelector('[data-id="pagination-host"]');
    if (!host) throw new Error("DataGrid requires data-id=pagination-host");
    const doc=root.ownerDocument;
    const nav=doc.createElement("nav");nav.dataset.id="root";nav.className="luma-pagination";
    nav.setAttribute("aria-label","Grid pagination");
    for(const [name,label] of [["previous","Previous"],["pages",null],["next","Next"]]){
      const element=doc.createElement(label?"button":"span");element.dataset.id=name;
      if(label){element.type="button";element.textContent=label;}
      nav.append(element);
    }
    host.replaceChildren(nav);
    this.pagination=new Pagination(nav);
    root.querySelector('[data-id="search"]').addEventListener("input",e=>{
      this.query=e.target.value.toLocaleLowerCase();this.page=1;this.render();
    },{signal:this.controller.signal});
  }
  configure({columns=[],rows=[],pageSize=10}={}){
    this.columns=columns;this.rows=rows;this.pageSize=Math.max(1,Number(pageSize)||10);
    this.page=1;this.render();return this;
  }
  setRows(rows=[]){this.rows=rows;this.page=1;this.render();}
  goto(page){this.page=Math.max(1,Math.min(page,this.pageCount()));this.render();}
  filtered(){
    const result=this.rows.filter(row=>!this.query||this.columns.some(col=>
      String(row[col.key]??"").toLocaleLowerCase().includes(this.query)));
    if(this.sortKey)result.sort((a,b)=>String(a[this.sortKey]??"").localeCompare(
      String(b[this.sortKey]??""),undefined,{numeric:true})*this.sortDir);
    return result;
  }
  pageCount(){return Math.max(1,Math.ceil(this.filtered().length/this.pageSize));}
  render(){
    const doc=this.root.ownerDocument,head=this.root.querySelector('[data-id="head"]'),
      body=this.root.querySelector('[data-id="body"]');
    head.replaceChildren();body.replaceChildren();
    const headings=doc.createElement("tr");
    for(const col of this.columns){
      const th=doc.createElement("th");th.scope="col";
      const control=doc.createElement("div");control.tabIndex=0;control.setAttribute("role","button");
      control.dataset.id="sort";control.dataset.key=col.key;
      control.textContent=String(col.label??col.key);
      if(this.sortKey===col.key)th.setAttribute("aria-sort",this.sortDir===1?"ascending":"descending");
      const activate=()=>{this.sortDir=this.sortKey===col.key?-this.sortDir:1;this.sortKey=col.key;this.page=1;this.render();};
      control.addEventListener("click",activate,{signal:this.controller.signal});
      control.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activate();}},{signal:this.controller.signal});
      th.append(control);headings.append(th);
    }
    head.append(headings);
    const rows=this.filtered();
    const max=Math.max(1,Math.ceil(rows.length/this.pageSize));
    this.page=Math.min(this.page,max);
    for(const row of rows.slice((this.page-1)*this.pageSize,this.page*this.pageSize)){
      const tr=doc.createElement("tr");tr.dataset.id="row";
      for(const col of this.columns){const td=doc.createElement("td");td.textContent=String(row[col.key]??"");tr.append(td);}
      body.append(tr);
    }
    this.root.querySelector('[data-id="empty"]').hidden=rows.length>0;
    this.pagination.configure({page:this.page,total:rows.length,pageSize:this.pageSize,
      onChange:page=>this.goto(page)});
    this.root.dispatchEvent(new CustomEvent("datagrid:page",{
      detail:{page:this.page,total:rows.length,pageSize:this.pageSize},bubbles:true
    }));
  }
  destroy(){
    this.controller.abort();this.pagination.destroy();
  }
}
export const create=root=>new DataGrid(root);
