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

async function PersonalizedFeedSection({ userId }: { userId: string }) {
  const recentFeedPage = await getRecentFeedPageForUser(userId, {
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

async function TrendingSectionSlot({ userId }: { userId: string | null }) {
  const trending = await getTrendingContent(3, userId);

  return (
    <TrendingSection trending={trending} isAuthenticated={Boolean(userId)} />
  );
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;

  return (
    <div className="relative bg-[#131313] text-white">
      {!userId ? <HeroSection /> : null}
      <Suspense fallback={null}>
        <SpotifyRootCallback searchParams={searchParams} />
      </Suspense>

      {userId ? (
        <Suspense fallback={<RecentFeedSkeleton />}>
          <PersonalizedFeedSection userId={userId} />
        </Suspense>
      ) : null}
      <Suspense fallback={<TrendingSectionSkeleton />}>
        <TrendingSectionSlot userId={userId} />
      </Suspense>
    </div>
  );
}
