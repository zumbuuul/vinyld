import { expect, test } from "@playwright/test";

test.describe("TS28 browser and responsive smoke", () => {
  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    test(`core navigation remains usable on ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.getByRole("link", { name: "vinyld" })).toBeVisible();

      await page.getByRole("link", { name: "Explore", exact: true }).first().click();
      await expect(page).toHaveURL(/\/search$/);
      await expect(
        page.getByRole("button", { name: "Search", exact: true }),
      ).toBeVisible();

      await page.getByRole("link", { name: "Community" }).click();
      await expect(page).toHaveURL(/\/community$/);
      await expect(page.getByRole("heading", { name: "Top Critics" })).toBeVisible();
    });
  }
});
