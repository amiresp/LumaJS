import { test, expect } from "@playwright/test";

test("zero-build demo hydrates Slider and Stories in a real browser", async ({ page }) => {
  await page.goto("/examples/basic/");
  await expect(page.locator('[data-luma="Slider"]')).toHaveAttribute("data-load-state", "ready");
  await expect(page.locator('[data-luma="Stories"]')).toHaveAttribute("data-load-state", "ready");
  await expect(page.locator('[data-luma="Slider"] [data-id="counter"]')).toHaveText("1 / 3");
  await page.locator('[data-luma="Slider"] [data-id="next"]').click();
  await expect(page.locator('[data-luma="Slider"] [data-id="counter"]')).toHaveText("2 / 3");
  await page.locator('[data-luma="Stories"] [data-id="open"]').click();
  await expect(page.locator('[data-luma="Stories"] [data-id="viewer"]')).toBeVisible();
  await page.locator('[data-luma="Stories"] [data-id="close"]').click();
  await expect(page.locator('[data-luma="Stories"] [data-id="viewer"]')).toBeHidden();
});

test("one missing component does not prevent the rest of the page from mounting", async ({ page }) => {
  await page.route("**/themes/core-default/dependency/Global/Stories/Stories.html", route => route.fulfill({status:404,body:"missing"}));
  await page.goto("/examples/basic/");
  await expect(page.locator('[data-luma="Slider"]')).toHaveAttribute("data-load-state", "ready");
  await expect(page.locator('[data-luma="Stories"]')).toHaveAttribute("data-load-state", "error");
});
