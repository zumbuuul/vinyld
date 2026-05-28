"use server";

import { headers } from "next/headers";

import {
  getFollowedActivity,
  getPopularStories,
  getPopularUsers,
  type FollowedActivityRow,
} from "@/db/queries/feed.queries";
import { getRecentAlbumActivity } from "@/db/queries/reviews.queries";
import type {
  RecentFeedItem,
  TrendingData,
  TrendingReviewItem,
} from "@/features/feed/feed.types";
import { auth } from "@/lib/auth";
import { getSpotifyAlbum } from "@/lib/spotify";

function getExcerpt(value: string | null): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "Fresh listen added to the feed.";
  }

  return trimmed.length > 150 ? `${trimmed.slice(0, 147)}...` : trimmed;
}

function getActivityLabel(kind: FollowedActivityRow["kind"]): string {
  switch (kind) {
    case "review":
      return "reviewed";
    case "critic_review":
      return "wrote a critique";
    case "story":
      return "created a playlist";
    case "follow":
      return "followed";
  }
}

function getTargetHref(activity: FollowedActivityRow): string | null {
  if (activity.kind === "review" || activity.kind === "critic_review") {
    return activity.albumSpotifyId ? `/album/${activity.albumSpotifyId}` : null;
  }

  if (activity.kind === "story") {
    return activity.storyId ? `/story/${activity.storyId}` : null;
  }

  if (activity.kind === "follow") {
    return activity.targetUserId ? `/user/${activity.targetUserId}` : null;
  }

  return null;
}

async function mapRecentReviews(limit: number): Promise<TrendingReviewItem[]> {
  const rows = await getRecentAlbumActivity(limit);

  return Promise.all(
    rows.map(async (row) => {
      const spotify = await getSpotifyAlbum(row.albumSpotifyId);

      return {
        id: row.id,
        reviewType: row.reviewType,
        userName: row.userName,
        userImage: row.userImage,
        albumName: spotify?.name ?? row.albumName,
        albumArtist: spotify?.artists?.[0]?.name ?? "Unknown Artist",
        albumSpotifyId: row.albumSpotifyId,
        albumImageUrl: spotify?.images?.[0]?.url ?? null,
        excerpt: getExcerpt(row.description),
        likeCount: row.likeCount,
      };
    }),
  );
}

async function mapRecentActivities(
  userId: string,
  limit: number,
): Promise<RecentFeedItem[]> {
  const rows = await getFollowedActivity(userId, limit);

  return Promise.all(
    rows.map(async (row) => {
      const activityLabel = getActivityLabel(row.kind);

      if (row.kind === "review" || row.kind === "critic_review") {
        const spotify = row.albumSpotifyId
          ? await getSpotifyAlbum(row.albumSpotifyId)
          : null;

        return {
          ...row,
          albumArtist: spotify?.artists?.[0]?.name ?? "Unknown Artist",
          albumImageUrl: spotify?.images?.[0]?.url ?? null,
          albumSpotifyId: row.albumSpotifyId,
          albumName: spotify?.name ?? row.albumName,
          activityLabel,
          targetHref: row.albumSpotifyId ? `/album/${row.albumSpotifyId}` : null,
        };
      }

      return {
        ...row,
        albumArtist: null,
        albumImageUrl: null,
        albumSpotifyId: null,
        albumName: null,
        activityLabel,
        targetHref: getTargetHref(row),
      };
    }),
  );
}

export async function getRecentFeed(limit = 3): Promise<RecentFeedItem[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return mapRecentActivities(session.user.id, limit);
}

export async function getTrendingContent(limit = 3): Promise<TrendingData> {
  const [popularReviews, popularStories, popularUsers] = await Promise.all([
    mapRecentReviews(limit),
    getPopularStories(limit),
    getPopularUsers(limit),
  ]);

  return {
    popularReviews: [...popularReviews].sort(
      (first, second) => second.likeCount - first.likeCount,
    ),
    popularStories,
    popularUsers,
  };
}
