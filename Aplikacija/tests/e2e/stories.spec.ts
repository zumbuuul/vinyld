import { expect, test } from "@playwright/test";

import {
  addSongToStoryFixture,
  cleanupTag,
  createCatalogFixture,
  createStoryFixture,
  deleteStoryById,
  getStoryName,
  getKnownUsers,
  isSongInStoryFixture,
  makeTag,
  TEST_USERS,
} from "./support/db";
import { login } from "./support/ui";

test.describe("TS10-TS14 stories as playlists", () => {
  test("creates, edits, cancels delete, then deletes a story", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const tag = makeTag("story-crud");
    const storyName = `${tag} Story`;
    let createdStoryId: string | null = null;

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto(`/user/${users.user.id}/stories`);
      await page.getByRole("button", { name: "Begin a new story" }).click();
      await expect(page).toHaveURL(/\/stories\/[0-9a-f-]+$/i, {
        timeout: 15_000,
      });
      createdStoryId = page.url().split("/").at(-1) ?? null;

      await page.getByLabel("Title").fill(storyName);
      await page.getByLabel("Bio").fill(`${tag} edited description`);
      await page.getByRole("button", { name: "Update Story" }).click();
      await expect.poll(() => getStoryName(createdStoryId!)).toBe(storyName);
      await expect(page.getByLabel("Title")).toHaveValue(storyName);

      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain("delete this story");
        await dialog.dismiss();
      });
      await page.getByRole("button", { name: "Delete Story" }).click();
      await expect(page.getByLabel("Title")).toHaveValue(storyName);

      page.once("dialog", async (dialog) => {
        await dialog.accept();
      });
      await page.getByRole("button", { name: "Delete Story" }).click();
      await expect(page).toHaveURL(new RegExp(`/user/${users.user.id}/stories$`), {
        timeout: 15_000,
      });
      await expect(page.getByText(storyName)).toHaveCount(0);
    } finally {
      if (createdStoryId) {
        await deleteStoryById(createdStoryId);
      }
      await cleanupTag(tag);
    }
  });

  test("adds a song to a story, prevents duplicates, and removes it", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const catalog = await createCatalogFixture();
    const story = await createStoryFixture(users.user.id);

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto(`/song/${catalog.songSpotifyId}`);
      await page.getByRole("button", { name: "Add to story" }).click();
      await page.getByRole("button", { name: story.storyName }).click();
      await expect
        .poll(() => isSongInStoryFixture(story.storyId, catalog.songId))
        .toBe(true);

      await page.goto(`/user/${users.user.id}/stories/${story.storyId}`);
      await expect(page.getByText(catalog.songName)).toBeVisible({
        timeout: 15_000,
      });

      await page.goto(`/song/${catalog.songSpotifyId}`);
      await page.getByRole("button", { name: "Add to story" }).click();
      await page.getByRole("button", { name: story.storyName }).click();
      await expect(page.getByText("Song is already in this playlist.")).toBeVisible({
        timeout: 15_000,
      });

      await page.goto(`/user/${users.user.id}/stories/${story.storyId}`);
      await page
        .getByRole("button", { name: `Remove ${catalog.songName} from story` })
        .click();
      await expect(page.getByText(catalog.songName)).toHaveCount(0, {
        timeout: 15_000,
      });
    } finally {
      await cleanupTag(story.tag);
      await cleanupTag(catalog.tag);
    }
  });

  test("non-owners cannot edit stories or remove their songs", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const catalog = await createCatalogFixture();
    const story = await createStoryFixture(users.user.id);

    try {
      await addSongToStoryFixture(story.storyId, catalog.songId);
      await login(page, TEST_USERS.admin.email);
      await page.goto(`/user/${users.user.id}/stories/${story.storyId}`);

      await expect(page.getByRole("button", { name: "Update Story" })).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: `Remove ${catalog.songName} from story` }),
      ).toHaveCount(0);
      await expect(page.getByText(catalog.songName)).toBeVisible();
    } finally {
      await cleanupTag(story.tag);
      await cleanupTag(catalog.tag);
    }
  });
});
