import { expect, test } from "@playwright/test";

import {
  cleanupTag,
  createCatalogFixture,
  createStoryFixture,
  getKnownUsers,
} from "./support/db";
import { expectNoNextJsError } from "./support/ui";

test.describe("TS3/TS15/TS17 public and discovery flows", () => {
  test("renders public pages for guest users", async ({ page }) => {
    const users = await getKnownUsers();
    const fixture = await createCatalogFixture();
    const story = await createStoryFixture(users.user.id);

    try {
      for (const path of [
        "/",
        "/search",
        "/community",
        `/album/${fixture.albumSpotifyId}`,
        `/song/${fixture.songSpotifyId}`,
        `/user/${users.user.id}`,
        `/user/${users.user.id}/stories`,
        `/user/${users.user.id}/stories/${story.storyId}`,
      ]) {
        const response = await page.goto(path);
        expect(response?.ok(), `${path} should load`).toBeTruthy();
        await expectNoNextJsError(page);
      }
    } finally {
      await cleanupTag(fixture.tag);
      await cleanupTag(story.tag);
    }
  });

  test("uses DB-backed Explore filters without requiring Spotify", async ({
    page,
  }) => {
    await page.goto("/search");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page.getByText("Best matches for this filter set")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("li").first()).toBeVisible();
    await expect(page.getByText("Community rating").first()).toBeVisible();
  });

  test("opens community sections and profile links", async ({ page }) => {
    await page.goto("/community");
    await expect(page.getByRole("heading", { name: "Top Critics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Popular Users" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Similar Taste" })).toBeVisible();
  });
});
