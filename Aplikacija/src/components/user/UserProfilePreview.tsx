"use client";

import Link from "next/link";

import { UserAvatar } from "@/components/feed/UserAvatar";
import {
  RecentReviewsList,
  type RecentReviewListItem,
} from "@/components/reviews/RecentReviewsList";
import { Button } from "@/components/ui/button";
import { ArtistBioSection } from "@/components/user/ArtistBioSection";
import { BeginStoryButton } from "@/components/story/BeginStoryButton";
import { FollowButton } from "@/components/user/FollowButton";
import { RoleRequestModal } from "@/components/user/RoleRequestModal";
import { StoryCard } from "@/components/story/StoryCard";
import type { UserStoryListItem } from "@/features/album/album.types";

type UserRole = "user" | "critic" | "artist" | "admin";
type RoleRequestKey = "critic" | "artist" | "admin";

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Listener",
  critic: "Critic",
  artist: "Artist",
  admin: "Admin",
};

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
      {children}
    </p>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const tones: Record<UserRole, string> = {
    user: "bg-[#2a2a2a] text-[#f0d6cd]",
    critic: "bg-[#2f2141] text-[#d8c2ff]",
    artist: "bg-[#2f261c] text-[#ffd2a3]",
    admin: "bg-[#3a1f23] text-[#ffb6c1]",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] ${tones[role]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {ROLE_LABELS[role]}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#2a2a2a] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-serif text-[#f5ebe8]">{value}</p>
    </div>
  );
}

function NowSpinningPlaceholder() {
  return (
    <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
      <SectionEyebrow>Now Spinning</SectionEyebrow>
      <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-[#2a2a2a] p-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-md bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[10px] uppercase tracking-[0.28em] text-[#521300]">
          Live
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-serif text-[#f5ebe8]">
            Track title placeholder
          </p>
          <p className="mt-1 text-sm text-[#d7b8ad]">
            Artist name • Album title
          </p>
          <div className="mt-4 h-2 rounded-full bg-[#1c1b1b]">
            <div className="h-2 w-1/3 rounded-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function UserProfilePreview({
  isOwnProfile,
  isAuthenticated,
  userId,
  name,
  imageUrl,
  role,
  artistBio,
  followers,
  following,
  reviewCount,
  receivedLikes,
  isFollowed,
  hasSpotifyConnection,
  pendingRequests,
  stories,
  reviews,
}: {
  isOwnProfile: boolean;
  isAuthenticated: boolean;
  userId: string;
  name: string;
  imageUrl: string | null;
  role: UserRole;
  artistBio: string | null;
  followers: number;
  following: number;
  reviewCount: number;
  receivedLikes: number;
  isFollowed: boolean;
  hasSpotifyConnection: boolean;
  pendingRequests: Record<RoleRequestKey, boolean>;
  stories: UserStoryListItem[];
  reviews: RecentReviewListItem[];
}) {
  const requestButtons = (["critic", "artist", "admin"] as const).filter(
    (requestRole) => role !== requestRole,
  );
  const hasAnyPendingRequest =
    pendingRequests.critic || pendingRequests.artist || pendingRequests.admin;

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_35%),#1c1b1b] p-5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <UserAvatar imageUrl={imageUrl} name={name} size="lg" />
              <div className="min-w-0">
                <h1 className="mt-2 text-4xl font-serif leading-none text-[#f5ebe8] sm:text-5xl">
                  {name}
                </h1>
                <p className="mt-2 text-sm text-[#a68f87]">@{userId}</p>
                <div className="mt-4">
                  <RoleBadge role={role} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-md lg:justify-end">
              {isOwnProfile ? (
                <>
                  <Link href="/settings">
                    <Button className="w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto">
                      Edit Profile
                    </Button>
                  </Link>

                  <Button
                    variant={hasSpotifyConnection ? "outline" : "default"}
                    className={
                      hasSpotifyConnection
                        ? "w-full border-[#5c4037] text-[#f0d6cd] sm:w-auto"
                        : "w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto"
                    }
                  >
                    {hasSpotifyConnection
                      ? "Spotify Connected"
                      : "Connect Spotify"}
                  </Button>
                </>
              ) : (
                <FollowButton
                  userId={userId}
                  initialIsFollowed={isFollowed}
                  isAuthenticated={isAuthenticated}
                  redirectUrl={`/user/${userId}`}
                />
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatBlock label="Followers" value={followers.toLocaleString()} />
          <StatBlock label="Following" value={following.toLocaleString()} />
          <StatBlock label="Reviews" value={reviewCount.toLocaleString()} />
          <StatBlock
            label="Likes Earned"
            value={receivedLikes.toLocaleString()}
          />
        </section>

        {role === "artist" ? (
          <ArtistBioSection name={name} bio={artistBio} />
        ) : null}

        <div
          className={
            isOwnProfile
              ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
              : "space-y-6"
          }
        >
          <div className="space-y-6">
            <NowSpinningPlaceholder />

            <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionEyebrow>Top Stories</SectionEyebrow>
                </div>
                <Link href={`/user/${userId}/stories`}>
                  <Button variant="ghost" className="w-full sm:w-auto">
                    View all stories
                  </Button>
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {stories.length > 0 ? (
                  stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      href={`/user/${userId}/stories/${story.id}`}
                    />
                  ))
                ) : isOwnProfile ? (
                  <div className="rounded-2xl bg-[#2a2a2a] p-4">
                    <p className="mb-4 text-sm leading-6 text-[#d7b8ad]">
                      You do not have any stories yet. Start the first one and
                      build out your corner of Vinyld.
                    </p>
                    <BeginStoryButton emptyState />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#2a2a2a] px-4 py-5 text-sm text-[#d7b8ad]">
                    This user has not published any stories yet.
                  </div>
                )}
              </div>
            </section>

            <RecentReviewsList
              reviews={reviews}
              isAuthenticated={isAuthenticated}
              redirectUrl={`/user/${userId}`}
              reviewSubject="album"
              eyebrow="ReviewList"
              title="Recent reviews"
              emptyText="No reviews to show yet."
              countLabel="shown"
              likedPositiveLabel="Liked release"
              likedNegativeLabel="Did not like release"
            />
          </div>

          {isOwnProfile ? (
            <aside className="space-y-6">
              <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
                <SectionEyebrow>Role Requests</SectionEyebrow>
                <p className="mt-3 text-sm leading-6 text-[#d7b8ad]">
                  Ask for elevated access when your profile is ready for a wider
                  role in the community.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  {requestButtons.map((requestRole) => (
                    <RoleRequestModal
                      key={requestRole}
                      role={requestRole}
                      requested={pendingRequests[requestRole]}
                      disabled={
                        hasAnyPendingRequest && !pendingRequests[requestRole]
                      }
                    />
                  ))}
                </div>
              </section>
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}
