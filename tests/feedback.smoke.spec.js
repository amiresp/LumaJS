import { test, expect } from "@playwright/test";

test("feedback playground mounts and interacts with all three components",async({page})=>{
  await page.goto("/examples/basic/");
  for(const name of ["Toast","Alert","Dialog"]) {
    await expect(page.locator('[data-luma="'+name+'"]')).toHaveAttribute("data-load-state","ready");
  }
  await page.locator('[data-id="try-toast"]').click();
  await expect(page.locator('[data-luma="Toast"] [data-id="toast"]')).toContainText("Saved successfully");
  await page.locator('[data-id="try-alert"]').click();
  await expect(page.locator('[data-luma="Alert"] [data-id="panel"]')).toBeVisible();
  await page.locator('[data-id="try-dialog"]').click();
  await expect(page.locator('[data-luma="Dialog"] [data-id="panel"]')).toBeVisible();
  await page.locator('[data-luma="Dialog"] [data-id="confirm"]').click();
  await expect(page.locator('[data-id="dialog-result"]')).toHaveText("Confirmed");
});
