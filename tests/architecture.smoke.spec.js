import {test,expect} from "@playwright/test";
test("architecture example mounts global, feature, option and page",async({page})=>{
 await page.goto("/examples/structure/");
 await expect(page.locator('[data-id="page"] h1')).toHaveText("LumaJS website");
 await expect(page.locator('[data-id="sample-title"]')).toHaveText("Sample feature");
 await expect(page.locator('[data-id="option-message"]')).toHaveText("Sample option enabled");
 await expect(page.locator('[data-luma="Alert"]')).toHaveAttribute("data-load-state","ready");
 await expect(page.locator('[data-luma="Alert"] [data-id="panel"]')).toBeVisible();
});
test("customSelect playground supports optional search fields",async({page})=>{
 await page.goto("/examples/custom-select/");
 await page.locator("[data-id="single"] [data-id='trigger']").click();
 await page.locator("[data-id="single"] [data-id='search']").fill("ink");
 await expect(page.locator("[data-id="single"] [data-id='option']")).toHaveCount(1);
 await expect(page.locator("[data-id="single"] [data-id='option']")).toContainText("Marker");
});
