import { expect, test } from "@playwright/test";

import {
  cleanupTag,
  createCatalogFixture,
  createPendingRoleRequest,
  getKnownUsers,
  getUserRole,
  restoreKnownUsers,
  TEST_USERS,
} from "./support/db";
import { login } from "./support/ui";

test.describe("TS18-TS20 role requests and access control", () => {
  test.afterEach(async () => {
    await restoreKnownUsers();
  });

  test("ordinary user submits and cancels a role request", async ({ page }) => {
    const users = await getKnownUsers();
    const tag = `PW-E2E-role-request-${Date.now()}`;

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto(`/user/${users.user.id}`);
      await page.getByRole("button", { name: "Request Critic" }).click();
      await page.getByPlaceholder("Give some context for your request...").fill(
        `${tag} I want to help with long-form critiques.`,
      );
      await page.getByRole("button", { name: "Submit request" }).click();
      await expect(page.getByRole("button", { name: "Cancel Request Critic" })).toBeVisible({
        timeout: 15_000,
      });

      await page.getByRole("button", { name: "Cancel Request Critic" }).click();
      await page.getByRole("button", { name: "Confirm cancellation" }).click();
      await expect(page.getByRole("button", { name: "Request Critic" })).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await cleanupTag(tag);
    }
  });

  test("admin approves and rejects pending role requests", async ({ page }) => {
    const users = await getKnownUsers();
    const approve = await createPendingRoleRequest(users.user.id, "artist");
    const decline = await createPendingRoleRequest(users.user.id, "critic");

    try {
      await login(page, TEST_USERS.admin.email);
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Role requests" })).toBeVisible();

      await expect(page.getByText(approve.tag)).toBeVisible();
      await page
        .locator("article")
        .filter({ hasText: approve.tag })
        .getByRole("button", { name: "Approve" })
        .click();
      await expect.poll(() => getUserRole(users.user.id)).toBe("artist");

      await expect(page.getByText(decline.tag)).toBeVisible();
      await page
        .locator("article")
        .filter({ hasText: decline.tag })
        .getByRole("button", { name: "Decline" })
        .click();
      await expect(page.getByText(decline.tag)).toHaveCount(0, {
        timeout: 15_000,
      });
    } finally {
      await cleanupTag(approve.tag);
      await cleanupTag(decline.tag);
    }
  });

  test("role-specific pages and forms are gated", async ({ page }) => {
    const catalog = await createCatalogFixture();

    try {
      await page.goto("/settings");
      await expect(page).toHaveURL(/\/login\?redirectUrl=%2Fsettings/);

      await login(page, TEST_USERS.user.email);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/$/);

      await page.goto(`/album/${catalog.albumSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Recenzija" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Nova Kritika" })).toHaveCount(0);

      await login(page, TEST_USERS.critic.email);
      await page.goto(`/album/${catalog.albumSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Kritika" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Nova Recenzija" })).toHaveCount(0);

      await login(page, TEST_USERS.artist.email);
      await page.goto("/settings");
      await expect(page.getByLabel("Artist bio")).toBeVisible();
    } finally {
      await cleanupTag(catalog.tag);
    }
  });
});
