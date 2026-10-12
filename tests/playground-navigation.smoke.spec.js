import {test,expect} from "@playwright/test";
test("playground home links to every available demo",async({page})=>{
 await page.goto("/");
 await expect(page).toHaveTitle(/LumaJS Playground/);
 for(const id of ["admin-link","starter-link","basic-link","icons-link","structure-link","select-link","offline-link"]){
  const anchor=page.locator('[data-id="'+id+'"]');
  await expect(anchor).toBeVisible();
  await expect(anchor).toHaveAttribute("href",/\//);
 }
 await page.locator('[data-id="admin-link"]').click();
 await expect(page).toHaveURL(/\/examples\/admin\//);
});
test("no-login admin dashboard mounts and interacts with actual GlobalComponents",async({page})=>{
 await page.goto("/examples/admin/");
 for(const name of ["Sidebar","Breadcrumb","Button","DataGrid","Select","Accordion","EmptyState","Toast","Dialog","Card"])
  await expect(page.locator('[data-luma="'+name+'"]').first()).toHaveAttribute("data-load-state","ready");
 await expect(page.locator('[data-luma="DataGrid"] [data-id="pagination-host"] .luma-pagination')).toHaveCount(1);
 await expect(page.locator('[data-id="users-value"]')).toHaveText("1,284");
 await expect(page.locator('[data-luma="DataGrid"] [data-id="row"]')).toHaveCount(4);
 await page.locator('[data-luma="DataGrid"] [data-id="search"]').fill("Kim");
 await expect(page.locator('[data-luma="DataGrid"] [data-id="row"]')).toHaveCount(1);
 await page.locator('[data-luma="DataGrid"] [data-id="search"]').fill("");
 await page.locator('[data-id="show-toast-action"] [data-id="button"]').click();
 await expect(page.locator('[data-luma="Toast"] [data-id="toast"]')).toContainText("dashboard notification");
 await page.locator('[data-id="ask-dialog-action"] [data-id="button"]').click();
 await expect(page.locator('[data-luma="Dialog"] [data-id="panel"]')).toBeVisible();
 await page.locator('[data-luma="Dialog"] [data-id="confirm"]').click();
 await expect(page.locator('[data-id="dialog-result"]')).toHaveText("Confirmed");
 await page.locator('[data-luma="Button"] [data-id="button"]').click();
 await expect(page.locator('[data-luma="DataGrid"] [data-id="row"]').first()).toContainText("New User");
 await expect(page.locator('[data-luma="Sidebar"] [data-id="navigation"]')).toBeVisible();
});
