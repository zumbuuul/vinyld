import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  getIsFollowingUser,
  getPendingRoleRequests,
  getUserProfile,
  getUserStats,
} from "@/actions/user.actions";
import { getUserReviews } from "@/actions/review.actions";
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

function createMockSections() {
  return {
    stories: [
      {
        id: "late-night-vinyl",
        name: "Late Night Vinyl",
        description:
          "Muted keys, dry drums, and the kind of sequencing that makes midnight feel cinematic.",
        imageUrl: null,
        songCount: 18,
      },
      {
        id: "sunday-room-tone",
        name: "Sunday Room Tone",
        description:
          "Warm guitars, brushed percussion, and a slow stretch into the afternoon.",
        imageUrl: null,
        songCount: 12,
      },
      {
        id: "small-club-memory",
        name: "Small Club Memory",
        description:
          "A pocket of live cuts and smoky arrangements held together by bass lines that never rush.",
        imageUrl: null,
        songCount: 9,
      },
    ],
  };
}

async function UserPageView({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [{ userId }, session] = await Promise.all([params, getCurrentSession()]);
  const isOwnProfile = session?.user.id === userId;
  const [profile, stats, pendingRequests, isFollowed, reviews] =
    await Promise.all([
    getUserProfile(userId),
    getUserStats(userId),
    isOwnProfile ? getPendingRoleRequests(userId) : null,
    getIsFollowingUser(userId, session?.user.id ?? null),
      getUserReviews(userId, session?.user.id ?? null, 5),
    ]);

  if (!profile) {
    notFound();
  }

  const mockSections = createMockSections();

  return (
    <UserProfilePreview
      isOwnProfile={isOwnProfile}
      isAuthenticated={Boolean(session)}
      userId={profile.id}
      name={profile.name}
      imageUrl={profile.imageUrl}
      role={profile.role}
      followers={stats.followerCount}
      following={stats.followingCount}
      reviewCount={stats.reviewCount}
      receivedLikes={stats.reviewLikeCount}
      isFollowed={isFollowed}
      hasSpotifyConnection={profile.spotifyConnected}
      pendingRequests={
        pendingRequests ?? { critic: false, artist: false, admin: false }
      }
      stories={mockSections.stories}
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
