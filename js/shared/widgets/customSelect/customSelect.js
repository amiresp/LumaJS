/**
 * LumaJS customSelect — framework-free select control.
 * Searchable fields: text, attr_subtext, attr_tokens. No domain data or global dependencies.
 */
export const normalizeText = value => String(value ?? "")
  .normalize("NFKC").replace(/[آأإ]/g,"ا").replace(/ي/g,"ی").replace(/ك/g,"ک")
  .replace(/\u200c/g," ").toLocaleLowerCase().trim();

export function searchOptions(options, query, fields = ["text","attr_subtext","attr_tokens"]) {
  const term = normalizeText(query);
  if (!term) return options.filter(item => !item.isDivider);
  return options.filter(item => !item.isDivider && fields.some(key => {
    const data = item[key];
    return normalizeText(Array.isArray(data) ? data.join(" ") : data).includes(term);
  }));
}

const hook = (element, name) => element.querySelector(`[data-id="${name}"]`);
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export class CustomSelect {
  static openByDocument = new WeakMap();
  static closeAll(doc = document) { CustomSelect.openByDocument.get(doc)?.closeDropdown(); }
  constructor(element, options = [], placeholder = "Select...", label = "", isMulti = false,
              searchLabel = "Search...", searchLabelNotFound = "No results",
              excludeFrom = null, defaultValue = null) {
    if (typeof element === "string") element = [...document.querySelectorAll("[data-id]")].find(node => node.dataset.id === element) ?? null;
    if (!(element instanceof Element)) throw new TypeError("customSelect requires an Element");
    this.container = element;
    this.options = options;
    this.placeholder = placeholder;
    this.label = label;
    this.isMulti = isMulti;
    this.searchLabel = searchLabel;
    this.searchLabelNotFound = searchLabelNotFound;
    this.excludeFrom = excludeFrom;
    this.selectedValues = [];
    this.onChangeCallback = null;
    this.controller = new AbortController();
    this.timer = null;
    this.destroyed = false;
    this.build();
    this.setValue(defaultValue, false);
  }
  build() {
    const doc = this.container.ownerDocument;
    this.container.replaceChildren();
    this.root = doc.createElement("div");
    this.root.dataset.id = "root";
    this.root.className = "luma-custom-select";
    const title = doc.createElement("label");
    title.dataset.id = "label";
    title.textContent = this.label;
    const trigger = doc.createElement("button");
    trigger.type = "button";
    trigger.dataset.id = "trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const dropdown = doc.createElement("div");
    dropdown.dataset.id = "dropdown";
    dropdown.hidden = true;
    const search = doc.createElement("input");
    search.type = "search";
    search.dataset.id = "search";
    search.placeholder = this.searchLabel;
    search.setAttribute("aria-label", this.searchLabel);
    const list = doc.createElement("ul");
    list.dataset.id = "options";
    list.setAttribute("role", "listbox");
    if (this.isMulti) list.setAttribute("aria-multiselectable", "true");
    dropdown.append(search,list);
    this.root.append(title,trigger,dropdown);
    this.container.append(this.root);
    this.trigger = trigger; this.dropdown = dropdown; this.searchBox = search; this.list = list;
    const signal = this.controller.signal;
    trigger.addEventListener("click", () => this.isOpen ? this.closeDropdown() : this.openDropdown(), {signal});
    search.addEventListener("input", () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.renderOptions(), 120);
    }, {signal});
    search.addEventListener("keydown", event => {
      if (event.key === "Escape") this.closeDropdown();
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const buttons = [...list.querySelectorAll('[data-id="option"]')];
        const active = buttons.indexOf(doc.activeElement);
        buttons[(active + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }
    }, {signal});
    list.addEventListener("click", event => {
      const button = event.target.closest('[data-id="option"]');
      if (button && list.contains(button)) this.selectIndex(Number(button.dataset.index));
    }, {signal});
    list.addEventListener("keydown", event => {
      if (event.key === "Escape") this.closeDropdown();
      if ((event.key === "Enter" || event.key === " ") && event.target.matches('[data-id="option"]')) {
        event.preventDefault(); this.selectIndex(Number(event.target.dataset.index));
      }
    }, {signal});
    doc.addEventListener("pointerdown", event => {
      if (!this.container.contains(event.target)) this.closeDropdown();
    }, {signal});
    this.renderOptions();
  }
  visibleOptions() {
    const fields = (this.container.getAttribute("data-search-fields") || "text,attr_subtext,attr_tokens")
      .split(",").map(v => v.trim()).filter(Boolean);
    const excluded = this.excludeFrom?.selectedValues ?? [];
    return searchOptions(this.options, this.searchBox.value, fields)
      .filter(item => !excluded.some(value => equal(value,item.value)));
  }
  renderOptions() {
    this.list.replaceChildren();
    const doc = this.container.ownerDocument;
    const items = this.visibleOptions();
    if (!items.length) {
      const empty = doc.createElement("li");
      empty.dataset.id = "empty";
      empty.textContent = this.searchLabelNotFound;
      this.list.append(empty);
    }
    items.forEach(item => {
      const li = doc.createElement("li");
      const button = doc.createElement("button");
      button.type = "button";
      button.dataset.id = "option";
      button.dataset.index = String(this.options.indexOf(item));
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(this.selectedValues.some(value => equal(value,item.value))));
      button.textContent = item.text ?? String(item.value);
      if (item.attr_subtext) {
        const secondary = doc.createElement("small");
        secondary.dataset.id = "subtext";
        secondary.textContent = String(item.attr_subtext);
        button.append(secondary);
      }
      li.append(button); this.list.append(li);
    });
  }
  renderTrigger() {
    const selected = this.options.filter(item => this.selectedValues.some(value => equal(value,item.value)));
    this.trigger.textContent = selected.length ? selected.map(item => item.text ?? item.value).join(", ") : this.placeholder;
  }
  openDropdown() {
    if (this.destroyed) return;
    CustomSelect.closeAll(this.container.ownerDocument);
    this.isOpen = true;
    CustomSelect.openByDocument.set(this.container.ownerDocument, this);
    this.dropdown.hidden = false;
    this.trigger.setAttribute("aria-expanded","true");
    this.renderOptions();
    this.searchBox.focus();
  }
  closeDropdown() {
    this.isOpen = false;
    this.dropdown.hidden = true;
    this.trigger.setAttribute("aria-expanded","false");
    if (CustomSelect.openByDocument.get(this.container.ownerDocument) === this) CustomSelect.openByDocument.delete(this.container.ownerDocument);
  }
  selectIndex(index) {
    const item = this.options[index];
    if (!item || item.isDivider || !this.visibleOptions().includes(item)) return;
    if (this.isMulti) {
      const existing = this.selectedValues.findIndex(value => equal(value,item.value));
      if (existing >= 0) this.selectedValues.splice(existing,1);
      else this.selectedValues.push(item.value);
    } else this.selectedValues = [item.value];
    this.renderTrigger(); this.renderOptions(); this.triggerChange();
    if (!this.isMulti) this.closeDropdown();
  }
  setOptions(options, preserveSelection = true) {
    this.options = options || [];
    const values = preserveSelection ? this.selectedValues : [];
    this.setValue(values, false);
  }
  setValue(value, triggerChange = true) {
    const values = value == null ? [] : this.isMulti && Array.isArray(value) ? value : [value];
    this.selectedValues = this.options.filter(item => !item.isDivider && values.some(v => equal(v,item.value))).map(item => item.value);
    if (!this.isMulti) this.selectedValues = this.selectedValues.slice(0,1);
    this.renderTrigger(); this.renderOptions();
    if (triggerChange) this.triggerChange();
  }
  getValue() { return this.isMulti ? [...this.selectedValues] : this.selectedValues[0] ?? null; }
  getSelectedItem() {
    const items = this.options.filter(item => this.selectedValues.some(value => equal(item.value,value)));
    return this.isMulti ? items : items[0] ?? null;
  }
  clear(triggerChange = true) { this.setValue(null,triggerChange); }
  onChange(callback) { this.onChangeCallback = callback; return this; }
  triggerChange() {
    const value = this.getValue();
    this.onChangeCallback?.(value,this);
    this.container.dispatchEvent(new CustomEvent("customselect:change",{detail:{value,instance:this},bubbles:true}));
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    clearTimeout(this.timer);
    this.controller.abort();
    this.closeDropdown();
    this.root.remove();
  }
}
export const create = (root, options = {}) => new CustomSelect(root, options.items || [], options.placeholder,
  options.label, options.multi, options.searchLabel, options.notFound, options.excludeFrom, options.defaultValue);
