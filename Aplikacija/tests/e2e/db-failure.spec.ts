import { expect, test } from "@playwright/test";

import {
  cleanupReviewForUser,
  cleanupTag,
  createCatalogFixture,
  getKnownUsers,
  getUserAlbumReviewDescription,
  TEST_USERS,
} from "./support/db";
import { login, selectFullStar } from "./support/ui";

test.describe("TS25 failed Server Action handling", () => {
  test("failed album review creation shows a controlled error and writes no review", async ({
    page,
  }) => {
    const users = await getKnownUsers();
    const fixture = await createCatalogFixture();
    const failingDescription = `${fixture.tag} __playwright_db_failure__ review`;

    try {
      await login(page, TEST_USERS.user.email);
      await page.goto(`/album/${fixture.albumSpotifyId}`);
      await expect(page.getByRole("heading", { name: "Nova Recenzija" })).toBeVisible();

      await selectFullStar(page, 4);
      await page.getByPlaceholder("Sta mislis o albumu?").fill(failingDescription);
      await page.getByRole("button", { name: "Objavi" }).click();

      await expect(page.getByText("Could not save review.")).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByText(/database|drizzle|neon|stack|exception/i)).toHaveCount(0);
      await expect
        .poll(() => getUserAlbumReviewDescription(users.user.id, fixture.albumId))
        .toBeNull();
    } finally {
      await cleanupReviewForUser(users.user.id, fixture);
      await cleanupTag(fixture.tag);
    }
  });
});
