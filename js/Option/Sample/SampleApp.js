/** Optional plugin-like module: app explicitly enables it. */
export class SampleOption {
 constructor(){this.root=null;}
 mount(root){this.root=root;this.root.querySelector('[data-id="option-message"]').textContent="Sample option enabled";return this;}
 destroy(){this.root=null;}
}
export function createSampleOption(){return new SampleOption();}
