import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  getIsFollowingUser,
  getPendingRoleRequests,
  getUserProfile,
  getUserStats,
} from "@/actions/user.actions";
import { getUserReviews } from "@/actions/review.actions";
import { getTopStories } from "@/actions/story.actions";
import { UserProfilePreview } from "@/components/user/UserProfilePreview";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/lib/session";

function UserPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_35%),#1c1b1b] p-5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <Skeleton className="h-10 w-10 rounded-full bg-[#2a2a2a]" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-56 bg-[#2a2a2a]" />
                <Skeleton className="h-4 w-32 bg-[#2a2a2a]" />
                <Skeleton className="h-8 w-24 rounded-full bg-[#2a2a2a]" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-xl bg-[#2a2a2a]" />
              <Skeleton className="h-10 w-40 rounded-xl bg-[#2a2a2a]" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-24 w-full rounded-2xl bg-[#2a2a2a]"
            />
          ))}
        </section>

        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-[28px] bg-[#1c1b1b]" />
          <Skeleton className="h-80 w-full rounded-[28px] bg-[#1c1b1b]" />
          <Skeleton className="h-96 w-full rounded-[28px] bg-[#1c1b1b]" />
        </div>
      </div>
    </main>
  );
}

async function UserPageView({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [{ userId }, session] = await Promise.all([params, getCurrentSession()]);
  const isOwnProfile = session?.user.id === userId;
  const [profile, stats, pendingRequests, isFollowed, reviews, stories] =
    await Promise.all([
      getUserProfile(userId),
      getUserStats(userId),
      isOwnProfile ? getPendingRoleRequests(userId) : null,
      getIsFollowingUser(userId, session?.user.id ?? null),
      getUserReviews(userId, session?.user.id ?? null, 5),
      getTopStories(userId, 3),
    ]);

  if (!profile) {
    notFound();
  }
  return (
    <UserProfilePreview
      isOwnProfile={isOwnProfile}
      isAuthenticated={Boolean(session)}
      userId={profile.id}
      name={profile.name}
      imageUrl={profile.imageUrl}
      role={profile.role}
      artistBio={profile.artistBio}
      followers={stats.followerCount}
      following={stats.followingCount}
      reviewCount={stats.reviewCount}
      receivedLikes={stats.reviewLikeCount}
      isFollowed={isFollowed}
      hasSpotifyConnection={profile.spotifyConnected}
      pendingRequests={
        pendingRequests ?? { critic: false, artist: false, admin: false }
      }
      stories={stories}
      reviews={reviews}
    />
  );
}

export default function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<UserPageFallback />}>
      <UserPageView params={params} />
    </Suspense>
  );
}
