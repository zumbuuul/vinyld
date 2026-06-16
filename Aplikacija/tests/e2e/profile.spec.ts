import { expect, test } from "@playwright/test";

import { getKnownUsers, makeTag, setUserName, TEST_USERS } from "./support/db";
import { login } from "./support/ui";

test.describe("TS5 profile settings", () => {
  test("updates and restores the signed-in user's display name", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const originalName = users.user.name;
    const newName = `${makeTag("profile")} Name`;

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto("/settings");
      await page.getByLabel("Name").fill(newName);
      await page.getByRole("button", { name: "Update Profile" }).click();

      await expect(page.getByText("Profile updated.")).toBeVisible({
        timeout: 15_000,
      });
      await page.goto(`/user/${users.user.id}`);
      await expect(page.getByRole("heading", { name: newName })).toBeVisible();
    } finally {
      await setUserName(users.user.id, originalName);
    }
  });

  test("rejects invalid profile names and shows controlled upload failure", async ({
    page,
  }) => {
    await login(page, TEST_USERS.user.email);
    await page.goto("/settings");

    await page.getByLabel("Name").fill("");
    await page.getByRole("button", { name: "Update Profile" }).click();
    await expect(page.getByText("Name is required")).toBeVisible({
      timeout: 15_000,
    });

    await page.route("**/api/settings/avatar/upload", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Forced Playwright upload failure" }),
      });
    });

    await page
      .locator('input[type="file"]')
      .setInputFiles("tests/e2e/fixtures/avatar.png");
    await expect(page.getByText("Vercel Blob: Failed to retrieve the client token")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("artist users can edit artist bio", async ({ page }) => {
    const bio = `${makeTag("artist-bio")} public artist bio`;

    await login(page, TEST_USERS.artist.email);
    await page.goto("/settings");
    await page.getByLabel("Artist bio").fill(bio);
    await page.getByRole("button", { name: "Update Profile" }).click();
    await expect(page.getByText("Profile updated.")).toBeVisible({
      timeout: 15_000,
    });
  });
});
