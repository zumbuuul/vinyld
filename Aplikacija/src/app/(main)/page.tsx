import { headers } from "next/headers";

import {
  getRecentFeedPageForUser,
  getTrendingContent,
  loadMoreRecentFeed,
} from "@/actions/feed.actions";
import { HeroSection } from "@/components/feed/HeroSection";
import { RecentFeed } from "@/components/feed/RecentFeed";
import { TrendingSection } from "@/components/feed/TrendingSection";
import { auth } from "@/lib/auth";

export default async function FeedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [recentFeedPage, trending] = await Promise.all([
    session
      ? getRecentFeedPageForUser(session.user.id, { limit: 3 })
      : Promise.resolve(null),
    getTrendingContent(3),
  ]);

  return (
    <div className="relative bg-[#131313] text-white">
      {!session ? <HeroSection /> : null}
      {session && recentFeedPage ? (
        <RecentFeed
          initialItems={recentFeedPage.items}
          initialNextCursor={recentFeedPage.nextCursor}
          initialHasMore={recentFeedPage.hasMore}
          asOf={recentFeedPage.asOf}
          onLoadMore={loadMoreRecentFeed}
        />
      ) : null}
      <TrendingSection trending={trending} />
    </div>
  );
}
