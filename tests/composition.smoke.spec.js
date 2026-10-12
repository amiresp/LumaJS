import {test,expect} from "@playwright/test";

test("DataGrid owns exactly one shared Pagination, with working page controls",async({page})=>{
 await page.goto("/examples/admin/");
 const grid=page.locator('[data-luma="DataGrid"]');
 await expect(grid).toHaveAttribute("data-load-state","ready");
 await expect(grid.locator('[data-id="pagination-host"] .luma-pagination')).toHaveCount(1);
 await expect(page.locator('[data-luma="Pagination"]')).toHaveCount(0);
 await expect(grid.locator('[data-id="row"]')).toHaveCount(4);
 await grid.locator('[data-id="next"]').click();
 await expect(grid.locator('[data-id="row"]')).toHaveCount(3);
 await grid.locator('[data-id="previous"]').click();
 await expect(grid.locator('[data-id="row"]')).toHaveCount(4);
});
test("Select loads its own stylesheet and hides its list until opened",async({page})=>{
 await page.goto("/examples/starter/");
 const select=page.locator('[data-luma="Select"]');
 await expect(select).toHaveAttribute("data-load-state","ready");
 await expect(page.locator('link[data-id="custom-select-styles"]')).toHaveCount(1);
 const trigger=select.locator('[data-id="trigger"]');
 await expect(trigger).toBeVisible();
 await expect(select.locator('[data-id="dropdown"]')).toBeHidden();
 await expect(trigger).toHaveCSS("border-top-style","solid");
 await trigger.click();
 await expect(select.locator('[data-id="dropdown"]')).toBeVisible();
 await expect(select.locator('[data-id="option"]')).toHaveCount(3);
});
test("Dialog, toast and dashboard quick actions compose Button behavior",async({page})=>{
 await page.goto("/examples/admin/");
 await expect(page.locator('[data-id="show-toast-action"] [data-id="button"]')).toBeVisible();
 await page.locator('[data-id="show-toast-action"] [data-id="button"]').click();
 await expect(page.locator('[data-luma="Toast"] [data-id="toast"]')).toBeVisible();
 await expect(page.locator('[data-luma="Toast"] [data-id="dismiss"]')).toHaveClass(/luma-action-button/);
 await page.locator('[data-id="ask-dialog-action"] [data-id="button"]').click();
 await expect(page.locator('[data-luma="Dialog"] [data-id="confirm"]')).toHaveClass(/luma-action-button/);
 await page.locator('[data-luma="Dialog"] [data-id="cancel"]').click();
 await expect(page.locator('[data-luma="Dialog"] [data-id="panel"]')).toBeHidden();
});

test("grid headers are plain keyboard-sortable labels, not buttons",async({page})=>{
 await page.goto("/examples/starter/");
 const grid=page.locator('[data-luma="DataGrid"]');
 await expect(grid.locator('thead [data-id="sort"]')).toHaveCount(3);
 await expect(grid.locator('thead button')).toHaveCount(0);
 await grid.locator('[data-id="sort"]').first().focus();
 await page.keyboard.press("Enter");
 await expect(grid.locator('th[aria-sort]')).toHaveCount(1);
});
test("toast close button is background-free and starter page demos feedback",async({page})=>{
 await page.goto("/examples/starter/");
 await expect(page.locator('[data-luma="Dialog"]')).toHaveAttribute("data-load-state","ready");
 await expect(page.locator('[data-luma="Alert"]')).toHaveAttribute("data-load-state","ready");
 await page.locator('[data-id="toast-demo-button"] [data-id="button"]').click();
 const dismiss=page.locator('[data-luma="Toast"] [data-id="dismiss"]');
 await expect(dismiss).toHaveAttribute("data-variant","ghost");
 await expect(dismiss).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
 await dismiss.click();
 await expect(page.locator('[data-luma="Toast"] [data-id="toast"]')).toHaveCount(0);
 await page.locator('[data-id="dialog-demo-button"] [data-id="button"]').click();
 await expect(page.locator('[data-luma="Dialog"] [data-id="panel"]')).toBeVisible();
});
test("sidebar groups are nested and can expand with keyboard",async({page})=>{
 await page.goto("/examples/admin/");
 const sidebar=page.locator('[data-luma="Sidebar"]');
 await expect(sidebar.locator('[data-id="children"]')).toHaveCount(3);
 const toggle=sidebar.locator('[data-id="expand"]').last();
 await expect(toggle).toHaveAttribute("aria-expanded","false");
 await toggle.focus();await page.keyboard.press("Enter");
 await expect(toggle).toHaveAttribute("aria-expanded","true");
 await expect(sidebar.locator('[data-id="children"]').last()).toBeVisible();
});
