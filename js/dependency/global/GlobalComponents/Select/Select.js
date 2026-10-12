import {CustomSelect} from "../../../../shared/widgets/customSelect/customSelect.js";

const styles = new WeakMap();
const href = new URL("../../../../shared/widgets/customSelect/customSelect.css", import.meta.url).href;
function acquireStyles(doc) {
  let state = styles.get(doc);
  if (!state) {
    const existing = [...doc.querySelectorAll('link[rel="stylesheet"]')].find(el => el.href === href);
    const link = existing || doc.createElement("link");
    if (!existing) {
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.id = "custom-select-styles";
      doc.head.append(link);
    }
    state = {link, owned: !existing, references: 0};
    styles.set(doc, state);
  }
  state.references++;
  return () => {
    if (--state.references === 0) {
      if (state.owned) state.link.remove();
      styles.delete(doc);
    }
  };
}

/** Composes existing CustomSelect; it never renders raw button/list fallback. */
export class Select {
  constructor(root) {
    this.root = root;
    this.host = root.querySelector('[data-id="select-host"]');
    if (!this.host) throw new Error("Select requires data-id=select-host");
    this.releaseStyles = acquireStyles(root.ownerDocument);
    this.instance = null;
    this.destroyed = false;
  }
  configure({options=[],placeholder="Select…",label="",multiple=false,value=null,onChange}={}) {
    if (this.destroyed) throw new Error("Select has been destroyed");
    this.instance?.destroy();
    this.instance = new CustomSelect(this.host,options,placeholder,label,multiple);
    if (value !== null) this.instance.setValue(value,false);
    if (onChange) this.instance.onChange(onChange);
    return this;
  }
  setOptions(options) { this.instance?.setOptions(options); }
  getValue() { return this.instance?.getValue() ?? null; }
  setValue(value) { this.instance?.setValue(value); }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.instance?.destroy();
    this.instance = null;
    this.releaseStyles();
  }
}
export const create = root => new Select(root);
