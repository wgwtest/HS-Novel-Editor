const { test, expect } = require("@playwright/test");

test("left story-line label toggles when an event visually crosses the label column", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(process.env.NARRATIVE_BASE_URL || "http://127.0.0.1:4173/index.html#zoomed");
  await page.waitForLoadState("networkidle");

  const canvas = page.locator("#timelineCanvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  // #zoomed places the early interview event against the frozen label column.
  // The click must still select/toggle the story line, not the event block.
  const labelX = box.x + 70;
  const interviewTrackY = box.y + 156 + 26;

  await page.mouse.click(labelX, interviewTrackY);
  await expect(page.locator("#selectionKind")).toHaveText("Selected Story Line");
  await expect(page.locator("#selectionTitle")).toContainText("采访线");
  await expect(page.locator("#selectionDesc")).toContainText("折叠");

  await page.mouse.click(labelX, interviewTrackY);
  await expect(page.locator("#selectionKind")).toHaveText("Selected Story Line");
  await expect(page.locator("#selectionTitle")).toContainText("采访线");
  await expect(page.locator("#selectionDesc")).toContainText("展开");
});
