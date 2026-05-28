import { headers } from "next/headers";

import { getRecentFeed, getTrendingContent } from "@/actions/feed.actions";
import { HeroSection } from "@/components/feed/HeroSection";
import { RecentFeed } from "@/components/feed/RecentFeed";
import { TrendingSection } from "@/components/feed/TrendingSection";
import { auth } from "@/lib/auth";

export default async function FeedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const [recentFeed, trending] = await Promise.all([
    session ? getRecentFeed(3) : Promise.resolve([]),
    getTrendingContent(3),
  ]);

  return (
    <div className="relative bg-[#131313] text-white">
      {!session ? <HeroSection /> : null}
      {session ? <RecentFeed initialItems={recentFeed} /> : null}
      <TrendingSection trending={trending} />
    </div>
  );
}
