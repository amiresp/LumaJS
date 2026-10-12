/** Global UI composition, outside Core; no business routes. */
const MODULES=["Toast","Alert","Dialog","Slider","Stories","Icon","EmptyState","Loading","Button","Card","Badge","Accordion","Breadcrumb","Pagination","Sidebar","Select","DataGrid"];
export class GlobalApp {
 constructor(runtime){this.runtime=runtime;this.registered=false;}
 register(){
  if(this.registered)return this;
  for(const name of MODULES)this.runtime.register(name,{load:()=>import("./GlobalComponents/"+name+"/"+name+".js")});
  this.registered=true;return this;
 }
 async mount(scope=globalThis.document){this.register();await this.runtime.style("Button");return this.runtime.hydrate(scope);}
 get(name,scope=globalThis.document){const host=scope.querySelector('[data-luma="'+name+'"]');return host?this.runtime.instances.get(host):null;}
 async destroy(scope=globalThis.document){await this.runtime.destroy(scope);}
}
export function createGlobalApp(runtime,options){return new GlobalApp(runtime,options);}
