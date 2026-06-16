import { expect, test } from "@playwright/test";

import {
  deleteRegisteredUserByEmail,
  makeTag,
  TEST_USERS,
} from "./support/db";
import { login, logout } from "./support/ui";

test.describe("TS1/TS2 auth flows", () => {
  test("registers a new user and cleans it up", async ({ page }) => {
    const tag = makeTag("register").toLowerCase();
    const email = `${tag}@example.test`;

    try {
      await page.goto("/register");
      await page.getByPlaceholder("Your name").fill(`${tag} User`);
      await page.getByPlaceholder("you@vinyl.fm").fill(email);
      await page.getByPlaceholder("Minimum 8 characters").fill("kukuruz1");
      await page.getByRole("button", { name: "Create account" }).click();

      await expect(page.getByLabel("Open user menu")).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await deleteRegisteredUserByEmail(email);
    }
  });

  test("shows validation or auth errors for invalid registration data", async ({
    page,
  }) => {
    await page.goto("/register");

    await page.getByPlaceholder("Your name").fill("Short Password");
    await page.getByPlaceholder("you@vinyl.fm").fill("short-password@example.test");
    await page.getByPlaceholder("Minimum 8 characters").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByText("Password must be at least 8 characters long."),
    ).toBeVisible();

    await page.getByPlaceholder("Minimum 8 characters").fill("kukuruz1");
    await page.getByPlaceholder("you@vinyl.fm").fill(TEST_USERS.user.email);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible({
      timeout: 15_000,
    });
  });

  test("logs in, logs out, and blocks protected settings after logout", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@vinyl.fm").fill(TEST_USERS.user.email);
    await page.getByPlaceholder("Your password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible({
      timeout: 15_000,
    });

    await login(page, TEST_USERS.user.email);
    await logout(page);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?redirectUrl=%2Fsettings/);
  });
});
