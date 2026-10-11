/** Shared application caller: intentionally no site-specific endpoints. */
export class GlobalCaller {
  constructor({fetcher=globalThis.fetch?.bind(globalThis),base="/"}={}) {this.fetcher=fetcher;this.base=base;this.controller=new AbortController();}
  async getJSON(path,{signal}={}) {
    if(!this.fetcher)throw Error("No fetch available");
    const url=new URL(path.replace(/^\//,""),new URL(this.base,globalThis.location?.href||"http://localhost/"));
    const response=await this.fetcher(url,{signal:signal||this.controller.signal,headers:{Accept:"application/json"}});
    if(!response.ok)throw Error("Request failed: "+response.status);
    return response.json();
  }
  destroy(){this.controller.abort();}
}
export function createGlobalCaller(options){return new GlobalCaller(options);}
