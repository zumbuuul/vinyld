import { cacheLife, cacheTag } from "next/cache";

import { queryFeaturedAlbums, queryRecentActivity } from "./home.queries";

export async function getCachedFeaturedAlbums() {
  "use cache";
  cacheTag("home", "featured-albums");
  cacheLife({ revalidate: 60 });

  return queryFeaturedAlbums();
}

export async function getCachedRecentActivity() {
  "use cache";
  cacheTag("home", "recent-activity");
  cacheLife({ revalidate: 30 });

  return queryRecentActivity();
}
