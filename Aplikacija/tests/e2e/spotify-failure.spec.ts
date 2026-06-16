import { expect, test } from "@playwright/test";

test.describe("TS24 Spotify API failure handling", () => {
  test("navbar Spotify search shows Not available for guarded Spotify errors", async ({
    page,
  }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Search albums and songs");

    await searchInput.fill("__playwright_spotify_status_503__");
    await expect(page.getByText("Not available")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Spotify API request failed|503|exception/i)).toHaveCount(0);

    await searchInput.fill("abbey road");
    await expect(page.getByText("Not available")).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(
      page.getByText(/Search results|No albums or songs found\./),
    ).toBeVisible();
  });
});
