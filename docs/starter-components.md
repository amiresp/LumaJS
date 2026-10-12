# LumaJS Starter UI Components

Eleven backend-neutral components ship as native ES module behavior plus mandatory default HTML/CSS templates. Behavior lives at `js/dependency/global/GlobalComponents/<Name>/<Name>.js`; markup/styles live at `themes/core-default/dependency/Global/<Name>/`. All behavioral hooks use `data-id`, component hosts use `data-luma`, and lifecycle instances have `destroy()`. GlobalApp registers each component lazily.

| Name | Public APIs |
| --- | --- |
| EmptyState | show({title,message,actionText,onAction}), hide(), destroy() |
| Loading / Skeleton | show({mode:"spinner"\|"skeleton",message}), hide(), destroy() |
| Button | configure({label,variant,disabled,loading,onClick}), setLoading(), destroy() |
| DataGrid (Table) | configure({columns,rows,pageSize}), setRows(), goto(), destroy(); client-side search, sort, pagination |
| Select | configure({options,placeholder,label,multiple,value,onChange}), setOptions(), getValue(), setValue(), destroy(); delegates to existing customSelect |
| Sidebar / Navigation | setItems([{label,href,active,children}]), setOpen(), destroy() |
| Breadcrumb | setItems([{label,href}]), destroy() |
| Pagination | configure({page,total,pageSize,onChange}), go(), destroy() |
| Card | set({title,text,footer}), destroy() |
| Accordion | setItems([{title,content}]), toggle(), destroy() |
| Badge / Chip | set({text,variant,removable,onRemove}), destroy() |

Run `npm run playground` and navigate to `http://127.0.0.1:8765/examples/starter/` for interactive examples of all eleven.

### Implementation boundaries

All data labels and cell values use `textContent` rather than injecting arbitrary HTML. DataGrid is **client-side** and intentionally not a server-side grid, virtualized grid or spreadsheet; consumers should transform paged API data themselves. EmptyState, Card and Badge are structural building blocks. Select composes customSelect and does not duplicate its selection logic. No business-specific routes, endpoint assumptions, CSS class selectors for binding, third-party runtime dependencies or automatic global window objects are added.

Themes can override HTML/CSS while preserving required `data-id` hooks; missing themed HTML must fall back to `core-default`. CSS alone is never a reason to duplicate markup. For accessibility, use native buttons, tables and field controls. Review focus handling and RTL/keyboard needs in a real browser before production rollout.


## Integrated dashboard demonstration

The zero-login `/examples/admin/` dashboard composes Sidebar, Breadcrumb, Button, Badge, DataGrid, Pagination, Select, Accordion, EmptyState, Loading, Card, Toast and Dialog into a working UI; mock records live in the demo only. The Playground home `/` links to that dashboard and all other examples. See `docs/admin-playground.md` for route and interaction details.


## Composition rules

DataGrid controls its own Pagination instance and its sort headers are Button-backed. Do not put a second Pagination component alongside DataGrid to control the same rows; that would create duplicated state. Shared Button behavior accepts existing semantic buttons in Dialog, Toast, Alert, Badge, EmptyState, Sidebar and Pagination; each owner must destroy composed button instances. Select is a thin adapter for customSelect and handles stylesheet load and cleanup independent of any Playground page. On an application composed through GlobalApp, the shared Button CSS is resolved from its core-default theme. See /examples/admin/ for integrated usage.


## Presentation/interaction guidance

Sortable DataGrid headers intentionally use a styled-neutral `div[data-id=sort]` with `role=button`, `tabindex=0` and keyboard Enter/Space activation; aria-sort belongs on TH. Pagination remains a shared component. Icon-only dismiss buttons use the shared Button `ghost` variant (transparent background, no border, no padding); `bare` is an alias. Sidebar `setItems` accepts arbitrarily nested `{label,href?,active?,expanded?,children?}` groups, provides buttons to expand/collapse groups and indented submenu styles. For live examples open `/examples/starter/` (includes Toast, Dialog and Alert) and `/examples/admin/` (nested navigation).
