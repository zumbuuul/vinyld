import { Suspense } from "react";

import {
  getRecentFeedPageForUser,
  getTrendingContent,
  loadMoreRecentFeed,
} from "@/actions/feed.actions";
import {
  RecentFeedSkeleton,
  TrendingSectionSkeleton,
} from "@/components/feed/FeedSkeletons";
import { HeroSection } from "@/components/feed/HeroSection";
import { RecentFeed } from "@/components/feed/RecentFeed";
import { TrendingSection } from "@/components/feed/TrendingSection";
import { getCurrentSession } from "@/lib/session";

async function PersonalizedFeedSection() {
  const session = await getCurrentSession();
  if (!session) {
    return <HeroSection />;
  }

  const recentFeedPage = await getRecentFeedPageForUser(session.user.id, {
    limit: 3,
  });

  return (
    <RecentFeed
      initialItems={recentFeedPage.items}
      initialNextCursor={recentFeedPage.nextCursor}
      initialHasMore={recentFeedPage.hasMore}
      asOf={recentFeedPage.asOf}
      onLoadMore={loadMoreRecentFeed}
    />
  );
}

async function TrendingSectionSlot() {
  const trending = await getTrendingContent(3);

  return <TrendingSection trending={trending} />;
}

export default function FeedPage() {
  return (
    <div className="relative bg-[#131313] text-white">
      <Suspense fallback={<RecentFeedSkeleton />}>
        <PersonalizedFeedSection />
      </Suspense>
      <Suspense fallback={<TrendingSectionSkeleton />}>
        <TrendingSectionSlot />
      </Suspense>
    </div>
  );
}
