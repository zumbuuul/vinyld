import { Suspense } from "react";
import { redirect } from "next/navigation";

import {
  getRecentFeedPageForUser,
  getTrendingContent,
  loadMoreRecentFeed,
} from "@/actions/feed.actions";
import { completeSpotifyConnection } from "@/actions/user.actions";
import {
  RecentFeedSkeleton,
  TrendingSectionSkeleton,
} from "@/components/feed/FeedSkeletons";
import { HeroSection } from "@/components/feed/HeroSection";
import { RecentFeed } from "@/components/feed/RecentFeed";
import { TrendingSection } from "@/components/feed/TrendingSection";
import { getCurrentSession } from "@/lib/session";

type FeedPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function appendSpotifyStatus(
  returnTo: string,
  status: "connected" | "denied" | "error" | "invalid",
) {
  const url = new URL(returnTo, "https://vinyld.local");
  url.searchParams.set("spotify", status);

  return `${url.pathname}${url.search}${url.hash}`;
}

async function SpotifyRootCallback({
  searchParams,
}: {
  searchParams?: FeedPageProps["searchParams"];
}) {
  const params = searchParams ? await searchParams : {};
  const code = getSearchParamValue(params.code);
  const state = getSearchParamValue(params.state);
  const error = getSearchParamValue(params.error);

  if (error) {
    redirect(appendSpotifyStatus("/", "denied"));
  }

  if (!code && !state) {
    return null;
  }

  if (!code || !state) {
    redirect(appendSpotifyStatus("/", "invalid"));
  }

  try {
    const result = await completeSpotifyConnection({ code, state });

    redirect(result.returnTo);
  } catch {
    redirect(appendSpotifyStatus("/", "error"));
  }
}

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
      isAuthenticated
      onLoadMore={loadMoreRecentFeed}
    />
  );
}

async function TrendingSectionSlot() {
  const session = await getCurrentSession();
  const trending = await getTrendingContent(3, session?.user.id ?? null);

  return (
    <TrendingSection
      trending={trending}
      isAuthenticated={Boolean(session)}
    />
  );
}

export default function FeedPage({ searchParams }: FeedPageProps) {
  return (
    <div className="relative bg-[#131313] text-white">
      <Suspense fallback={null}>
        <SpotifyRootCallback searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<RecentFeedSkeleton />}>
        <PersonalizedFeedSection />
      </Suspense>
      <Suspense fallback={<TrendingSectionSkeleton />}>
        <TrendingSectionSlot />
      </Suspense>
    </div>
  );
}
