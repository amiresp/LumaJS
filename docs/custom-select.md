# customSelect (standalone widget)

Path: `js/shared/widgets/customSelect/customSelect.js` and optional stylesheet `customSelect.css`. This widget is **not** a globally themed Luma component; it owns its own DOM and is mounted explicitly.

Use `/examples/custom-select/` for an interactive zero-build demo.

```js
import {CustomSelect} from "/js/shared/widgets/customSelect/customSelect.js";
const select = new CustomSelect(
  document.getElementById("select"),
  [{value:1,text:"Notebook",attr_subtext:"Paper",attr_tokens:["writing","notes"]}],
  "Choose an item"
);
select.onChange((value) => console.log(value));
select.setValue(1);
console.log(select.getValue());
select.destroy();
```

The container may specify `data-search-fields="text,attr_subtext,attr_tokens"`. Search is normalized (including common Persian character variations); optional `attr_subtext` and `attr_tokens` are searched only when supplied. Works with single and multi-select, `setOptions()`, `getSelectedItem()`, `clear()` and `excludeFrom`. Values and subtext use safe text DOM APIs; there are no hardcoded flight/city datasets.

This is a reduced general-purpose implementation of the original `KaranehCustomSelect`, not feature-for-feature parity. Before using in a high-traffic accessible application, review grouping/image options, positioning, and complete keyboard/ARIA behavior.
