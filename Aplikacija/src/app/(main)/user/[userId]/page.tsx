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
import { getCurrentSession } from "@/lib/session";

function UserPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl rounded-[32px] bg-[#1c1b1b] p-6 sm:p-8">
        Loading profile...
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
