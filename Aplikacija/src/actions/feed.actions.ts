"use server";

import {
  getFollowedActivity,
  getPopularStories,
  getPopularUsers,
  type FollowedActivityRow,
} from "@/db/queries/feed.queries";
import { getRecentAlbumActivity } from "@/db/queries/reviews.queries";
import type {
  RecentFeedCursor,
  RecentFeedItem,
  RecentFeedPage,
  TrendingData,
  TrendingReviewItem,
} from "@/features/feed/feed.types";
import { requireCurrentSession } from "@/lib/session";

const DEFAULT_RECENT_FEED_PAGE_SIZE = 3;

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

function getNextCursor(items: RecentFeedItem[]): RecentFeedCursor | null {
  const lastItem = items.at(-1);

  if (!lastItem) {
    return null;
  }

  return {
    createdAt: lastItem.createdAt,
    id: lastItem.id,
  };
}

async function mapRecentReviews(
  limit: number,
  viewerId?: string | null,
): Promise<TrendingReviewItem[]> {
  const rows = await getRecentAlbumActivity(limit, viewerId);

  return rows.map((row) => ({
    id: row.id,
    reviewType: row.reviewType,
    userId: row.userId,
    userName: row.userName,
    userImage: row.userImage,
    albumName: row.albumName,
    albumArtist: row.albumArtist ?? "Unknown Artist",
    albumSpotifyId: row.albumSpotifyId,
    albumImageUrl: row.albumImageUrl,
    excerpt: getExcerpt(row.description),
    rating10: row.rating10,
    likeCount: row.likeCount,
    likedByViewer: row.likedByViewer,
  }));
}

async function mapRecentActivities(
  rows: FollowedActivityRow[],
): Promise<RecentFeedItem[]> {
  return rows.map((row) => {
    const activityLabel = getActivityLabel(row.kind);

    if (row.kind === "review" || row.kind === "critic_review") {
      return {
        ...row,
        albumArtist: row.albumArtist ?? "Unknown Artist",
        albumImageUrl: row.albumImageUrl,
        albumSpotifyId: row.albumSpotifyId,
        albumName: row.albumName,
        rating10: row.rating10,
        likeCount: row.likeCount,
        likedByViewer: row.likedByViewer,
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
      rating10: null,
      likeCount: null,
      likedByViewer: false,
      activityLabel,
      targetHref: getTargetHref(row),
    };
  });
}

export async function getRecentFeedPageForUser(
  userId: string,
  params: {
    limit?: number;
    cursor?: RecentFeedCursor | null;
    asOf?: string;
  } = {},
): Promise<RecentFeedPage> {
  const limit = Math.max(
    1,
    Math.min(params.limit ?? DEFAULT_RECENT_FEED_PAGE_SIZE),
  );
  const asOf = params.asOf ?? new Date().toISOString();
  const rows = await getFollowedActivity(userId, limit + 1, {
    asOf,
    cursorCreatedAt: params.cursor?.createdAt ?? null,
    cursorId: params.cursor?.id ?? null,
  });
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const items = await mapRecentActivities(pageRows);

  return {
    items,
    nextCursor: getNextCursor(items),
    hasMore,
    asOf,
  };
}

export async function loadMoreRecentFeed(params: {
  cursor: RecentFeedCursor | null;
  asOf: string;
  limit?: number;
}): Promise<RecentFeedPage> {
  const session = await requireCurrentSession();

  return getRecentFeedPageForUser(session.user.id, {
    limit: params.limit,
    cursor: params.cursor,
    asOf: params.asOf,
  });
}

export async function getTrendingContent(
  limit = 3,
  viewerId?: string | null,
): Promise<TrendingData> {
  const [popularReviews, popularStories, popularUsers] = await Promise.all([
    mapRecentReviews(limit, viewerId),
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
