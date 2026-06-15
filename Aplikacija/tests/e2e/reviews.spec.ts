import { expect, test } from "@playwright/test";

import {
  cleanupReviewForUser,
  cleanupTag,
  createCatalogFixture,
  getUserAlbumReviewDescription,
  getUserSongReviewDescription,
  getKnownUsers,
  TEST_USERS,
} from "./support/db";
import { login, selectFullStar } from "./support/ui";

test.describe("TS6-TS9 review and critique CRUD", () => {
  test("ordinary user creates, edits, and deletes an album review", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const fixture = await createCatalogFixture();

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto(`/album/${fixture.albumSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Recenzija" })).toBeVisible();

      await selectFullStar(page, 4);
      await page.getByPlaceholder("Sta mislis o albumu?").fill(`${fixture.tag} first album review`);
      await page.getByRole("button", { name: "Objavi" }).click();
      await expect
        .poll(() => getUserAlbumReviewDescription(users.user.id, fixture.albumId))
        .toBe(`${fixture.tag} first album review`);
      await expect(
        page.locator("article").filter({ hasText: `${fixture.tag} first album review` }),
      ).toBeVisible({ timeout: 15_000 });

      await page.getByPlaceholder("Sta mislis o albumu?").fill(`${fixture.tag} edited album review`);
      await page.getByRole("button", { name: "Objavi" }).click();
      await expect
        .poll(() => getUserAlbumReviewDescription(users.user.id, fixture.albumId))
        .toBe(`${fixture.tag} edited album review`);
      await expect(page.getByPlaceholder("Sta mislis o albumu?")).toHaveValue(
        `${fixture.tag} edited album review`,
      );

      await page.getByRole("button", { name: "Obrisi" }).click();
      await expect
        .poll(() => getUserAlbumReviewDescription(users.user.id, fixture.albumId))
        .toBeNull();
    } finally {
      await cleanupReviewForUser(users.user.id, fixture);
      await cleanupTag(fixture.tag);
    }
  });

  test("ordinary user creates, edits, and deletes a song review", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const fixture = await createCatalogFixture();

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto(`/song/${fixture.songSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Recenzija" })).toBeVisible();

      await selectFullStar(page, 5);
      await page.getByPlaceholder("Sta mislis o pesmi?").fill(`${fixture.tag} first song review`);
      await page.getByRole("button", { name: "Objavi" }).click();
      await expect
        .poll(() => getUserSongReviewDescription(users.user.id, fixture.songId))
        .toBe(`${fixture.tag} first song review`);

      await page.getByPlaceholder("Sta mislis o pesmi?").fill(`${fixture.tag} edited song review`);
      await selectFullStar(page, 5);
      await page.getByRole("button", { name: "Objavi" }).click();
      await expect
        .poll(() => getUserSongReviewDescription(users.user.id, fixture.songId))
        .toBe(`${fixture.tag} edited song review`);
      await expect(page.getByPlaceholder("Sta mislis o pesmi?")).toHaveValue(
        `${fixture.tag} edited song review`,
      );

      await page.getByRole("button", { name: "Obrisi" }).click();
      await expect
        .poll(() => getUserSongReviewDescription(users.user.id, fixture.songId))
        .toBeNull();
    } finally {
      await cleanupReviewForUser(users.user.id, fixture);
      await cleanupTag(fixture.tag);
    }
  });

  test("critic creates, edits, and deletes album and song critiques", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const fixture = await createCatalogFixture();

    try {
      await login(page, TEST_USERS.critic.email);

      await page.goto(`/album/${fixture.albumSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Kritika" })).toBeVisible();
      await page.getByPlaceholder("Kako bi naslovio kritiku?").fill(`${fixture.tag} album critique`);
      await selectFullStar(page, 4);
      await page.getByPlaceholder("Napisi detaljnu kritiku albuma.").fill(`${fixture.tag} album critique body`);
      await page.getByPlaceholder("Kratak zavrsni zakljucak.").fill(`${fixture.tag} album conclusion`);
      await page.getByRole("button", { name: "Objavi kritiku" }).click();
      await expect(page.getByText(`${fixture.tag} album critique body`)).toBeVisible({
        timeout: 15_000,
      });
      await page.getByRole("button", { name: "Obrisi" }).click();
      await expect(page.getByText(`${fixture.tag} album critique body`)).toHaveCount(0, {
        timeout: 15_000,
      });

      await page.goto(`/song/${fixture.songSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Kritika" })).toBeVisible();
      await page.getByPlaceholder("Kako bi naslovio kritiku?").fill(`${fixture.tag} song critique`);
      await selectFullStar(page, 3);
      await page.getByPlaceholder("Napisi detaljnu kritiku pesme.").fill(`${fixture.tag} song critique body`);
      await page.getByPlaceholder("Kratak zavrsni zakljucak.").fill(`${fixture.tag} song conclusion`);
      await page.getByRole("button", { name: "Objavi kritiku" }).click();
      await expect(page.getByText(`${fixture.tag} song critique body`)).toBeVisible({
        timeout: 15_000,
      });
      await page.getByRole("button", { name: "Obrisi" }).click();
      await expect(page.getByText(`${fixture.tag} song critique body`)).toHaveCount(0, {
        timeout: 15_000,
      });
    } finally {
      await cleanupReviewForUser(users.critic.id, fixture);
      await cleanupTag(fixture.tag);
    }
  });

  test("ordinary users do not get professional critique forms", async ({
    page,
  }) => {
    const fixture = await createCatalogFixture();

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto(`/album/${fixture.albumSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Recenzija" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Nova Kritika" })).toHaveCount(0);
    } finally {
      await cleanupTag(fixture.tag);
    }
  });
});
