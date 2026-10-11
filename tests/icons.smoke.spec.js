import {test,expect} from "@playwright/test";
test("local Tabler gallery renders and filters SVG names", async ({page})=>{
 await page.goto("/examples/icons/");
 await expect(page.locator('[data-id="icons"] svg').first()).toBeVisible();
 await page.locator('[data-id="search"]').fill("arrow-");
 await expect(page.locator('[data-id="count"]')).toContainText("icons");
 await expect(page.locator('[data-id="icons"] [data-id="icon-tile"]')).not.toHaveCount(0);
 await expect(page.locator('[data-id="icons"] [data-id="icon-tile"]').first().locator("svg")).toHaveAttribute("aria-hidden","true");
});
test("feedback controls and slider use local SVG icons", async ({page})=>{
 await page.goto("/examples/basic/");
 await expect(page.locator('[data-luma="Slider"]')).toHaveAttribute("data-load-state","ready");
 await expect(page.locator('[data-luma="Slider"] [data-id="next"] svg')).toBeVisible();
 await expect(page.locator('[data-luma="Alert"]')).toHaveAttribute("data-load-state","ready");
 await expect(page.locator('[data-luma="Dialog"] [data-id="close"] svg')).toHaveCount(1);
 await page.locator('[data-id="try-toast"]').click();
 await expect(page.locator('[data-luma="Toast"] [data-id="toast"] [data-id="status-icon"] svg')).toBeVisible();
});
