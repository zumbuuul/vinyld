import { expect, type Page } from "@playwright/test";

import { TEST_PASSWORD } from "./db";

export async function login(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByPlaceholder("you@vinyl.fm").fill(email);
  await page.getByPlaceholder("Your password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByLabel("Open user menu")).toBeVisible({
    timeout: 15_000,
  });
}

export async function logout(page: Page) {
  await page.getByLabel("Open user menu").click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Join the Club" })).toBeVisible({
    timeout: 15_000,
  });
}

export async function selectFullStar(page: Page, oneBasedStar: number) {
  await page
    .getByRole("button", { name: "Select full star" })
    .nth(oneBasedStar - 1)
    .click();
}

export async function expectNoNextJsError(page: Page) {
  await expect(page.getByText("Application error")).toHaveCount(0);
  await expect(page.getByText("This page could not be found")).toHaveCount(0);
}
