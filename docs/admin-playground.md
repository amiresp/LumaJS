# Playground landing and Admin dashboard

## Running locally

```bash
git fetch origin
git switch feat/starter-ui-components
npm run playground
```

Open **http://127.0.0.1:8765/**. The root landing page links to:

- `/examples/admin/`: no-login dashboard using working LumaJS GlobalComponents
- `/examples/starter/`: all eleven starter UI components
- `/examples/basic/`: slider, stories, toast, dialog and alert
- `/examples/icons/`: local Tabler Icon gallery
- `/examples/structure/`: GlobalApp, Feature, Option and Page
- `/examples/custom-select/`: customSelect interactions
- `/offline.html`: offline fallback preview

## Reference admin

**This is a demo, not an authenticated admin system.** It uses **fictional mock users** and **illustrative metrics** entirely in browser memory. It does not contact a backend, set cookies, request credentials, or imply authorization. The admin example combines `GlobalApp`, `Luma` and the shared modules rather than duplicating their logic.

The left rail uses Sidebar. Breadcrumb identifies the page. Cards and Badges show KPI content. DataGrid supports in-memory sorting, searching and paging. Pagination renders an additional paging control. Select is an adapter for customSelect and filters mock roles. Button inserts an in-memory row. Toast and Dialog demonstrate feedback. Accordion, Loading, EmptyState, Alert and Card are also mounted.

All DOM *behavioral hooks* use `[data-id]` and component hosts use `[data-luma]`. CSS classes are styling only. Real authorization belongs to the destination app/backend; don't copy mock users into production.

## Test

```bash
npm install
npm run check
npx playwright install chromium
npm run test:browser
```

`tests/playground-navigation.smoke.spec.js` verifies landing links, working dashboard components and representative interactive actions. Maintain links and testing whenever a demo is added or renamed.
