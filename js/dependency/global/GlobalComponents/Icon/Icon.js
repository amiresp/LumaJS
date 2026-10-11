import arrows from "./packs/arrows.js";
import navigation from "./packs/navigation.js";
import account from "./packs/account.js";
import social from "./packs/social.js";
import actions from "./packs/actions.js";
import utilities from "./packs/utilities.js";
import tools from "./packs/tools.js";
import misc0 from "./packs/misc0.js";
import misc1 from "./packs/misc1.js";
import misc2 from "./packs/misc2.js";

/** Official Tabler SVGs, bundled locally. No icon fonts, CDNs, or runtime dependencies. */
export const icons = Object.freeze({...arrows,...navigation,...account,...social,...actions,...utilities,...tools,...misc0,...misc1,...misc2});
export const iconNames = Object.freeze(Object.keys(icons).sort());
const alias = Object.freeze({
  "info":"info-circle","danger":"alert-triangle","warning":"alert-triangle",
  "hamburger":"menu-2","card":"credit-card","account":"user-circle",
  "signin":"login","signout":"logout","lang":"language","currency":"currency-dollar",
  "dashboard":"layout-dashboard","play":"player-play","pause":"player-pause",
  "pin":"map-pin","tick":"check","uncheck":"square-x","close":"x",
  "call":"phone-call","view":"eye","dark":"moon","light":"sun",
  "share-icon":"share","magnifier":"search","chart":"chart-bar",
  "back":"arrow-left","forward":"arrow-right","quiz":"help",
  "facebook":"brand-facebook","telegram":"brand-telegram",
  "whatsapp":"brand-whatsapp","linkedin":"brand-linkedin",
  "youtube":"brand-youtube","instagram":"brand-instagram",
  "check-circle":"circle-check","error":"circle-x"
});
export function createIconElement(name,{documentRef=globalThis.document,size=24,label=null,strokeWidth=null}={}){
  const resolved = alias[name] || name;
  if(!Object.hasOwn(icons,resolved))throw new RangeError("Unknown icon: "+name);
  const parser=new documentRef.defaultView.DOMParser();
  const xml=parser.parseFromString(icons[resolved],"image/svg+xml");
  if(xml.querySelector("parsererror"))throw Error("Invalid icon SVG: "+resolved);
  const svg=documentRef.importNode(xml.documentElement,true);
  svg.setAttribute("width",String(size));
  svg.setAttribute("height",String(size));
  svg.classList.add("luma-icon-svg");
  if(strokeWidth!=null)svg.setAttribute("stroke-width",String(strokeWidth));
  if(label){svg.setAttribute("role","img");svg.setAttribute("aria-label",String(label));}
  else {svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");}
  return svg;
}
export function renderIcon(target,name,options={}){
  const svg=createIconElement(name,{...options,documentRef:target.ownerDocument});
  target.replaceChildren(svg);return svg;
}
export class Icon {
  constructor(root,{name=root.dataset.icon||root.closest("[data-luma]")?.dataset.icon||"home",size=24,label=null}={}){
    this.root=root;this.destroyed=false;this.set(name,{size,label});
  }
  set(name,options={}){if(this.destroyed)return;this.name=name;return renderIcon(this.root,name,options);}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.root.replaceChildren();}
}
export function create(root){return new Icon(root);}
