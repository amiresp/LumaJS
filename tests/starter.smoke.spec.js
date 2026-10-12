import {test,expect} from "@playwright/test";
test("all starter components hydrate and core interactions work",async({page})=>{
 await page.goto("/examples/starter/");
 for(const name of ["EmptyState","Loading","Button","Card","Badge","Accordion","Breadcrumb","Pagination","Sidebar","Select","DataGrid"])
  await expect(page.locator('[data-luma="'+name+'"]')).toHaveAttribute("data-load-state","ready");
 await page.locator('[data-luma="Button"] [data-id="button"]').click();
 await expect(page.locator('[data-luma="Badge"] [data-id="label"]')).toHaveText("Saved");
 await page.locator('[data-luma="Accordion"] [data-id="toggle"]').first().click();
 await expect(page.locator('[data-luma="Accordion"] [data-id="panel"]').first()).toBeVisible();
 await page.locator('[data-luma="DataGrid"] [data-id="search"]').fill("Kim");
 await expect(page.locator('[data-luma="DataGrid"] [data-id="row"]')).toHaveCount(1);
 await page.locator('[data-luma="Sidebar"] [data-id="toggle"]').click();
 await expect(page.locator('[data-luma="Sidebar"] [data-id="navigation"]')).toBeHidden();
});
