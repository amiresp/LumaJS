/** Example Feature (domain module): application-owned routing and rendering. */
export const sampleRoutes=[{path:"/sample",page:"Sample"}];
export class SampleApp {
 constructor({caller}={}){this.caller=caller;this.active=false;}
 async mount(root){this.root=root;this.active=true;root.querySelector('[data-id="sample-title"]').textContent="Sample feature";return this;}
 destroy(){this.active=false;this.root=null;}
}
export function createSampleFeature(context){return new SampleApp(context);}
