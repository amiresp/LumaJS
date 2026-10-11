import { test, expect } from "@playwright/test";

test("Stories fills viewport, uses backdrop and segmented timeline", async ({page}) => {
  await page.goto("/examples/basic/");
  const host=page.locator('[data-luma="Stories"]');
  await expect(host).toHaveAttribute("data-load-state","ready");
  await host.locator('[data-id="open"]').click();
  const viewer=host.locator('[data-id="viewer"]');
  await expect(viewer).toBeVisible();
  const size=await viewer.boundingBox();
  const viewport=page.viewportSize();
  expect(Math.abs(size.width-viewport.width)).toBeLessThan(2);
  expect(Math.abs(size.height-viewport.height)).toBeLessThan(2);
  await expect(viewer.locator('[data-id="backdrop"]')).toBeVisible();
  await expect(viewer.locator(".luma-story-segment")).toHaveCount(2);
  await page.waitForTimeout(250);
  const fill=await viewer.locator(".luma-story-segment-fill").first().evaluate(el=>Number(el.style.getPropertyValue("--luma-story-progress")));
  expect(fill).toBeGreaterThan(0);
  await viewer.locator('[data-id="close"]').click();
  await expect(viewer).toBeHidden();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe("");
});
