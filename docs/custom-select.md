# customSelect widget

Migrated from the original `KaranehCustomSelect` widget to `js/shared/widgets/customSelect` without domain-specific options, global state or backend assumptions.

## API

```js
import {CustomSelect} from "./js/shared/widgets/customSelect/customSelect.js";
const instance = new CustomSelect(document.querySelector('[data-id="category-select"]'), [
  { value: "a", text: "First item", attr_subtext: "Optional note", attr_tokens: ["alternate", "keyword"] }
]);
instance.onChange(value => console.log(value));
// instance.getValue(), instance.setValue(...), instance.clear(), instance.setOptions(...), instance.destroy()
```

Optional container attribute: `data-search-fields="text,attr_subtext,attr_tokens"`. Default search includes these three fields. All DOM behavior selectors created by the widget use `data-id`, while classes are visual-only. This standalone widget lives in `js/shared/widgets/` rather than Feature-specific code. Stylesheet is optional and may be overridden by the application.

The adapter is not fully API-compatible with the legacy constructor's image/grouping and dropdown positioning implementation. These features require additional integration testing. Core remains independent of this widget.
