import { eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import {
  album,
  criticAlbumReview,
  criticAlbumReviewLikes,
  user,
  userAlbumReview,
  userAlbumReviewLikes,
} from "@/db/schema";

export type AlbumReviewListItemRow = {
  id: string;
  reviewType: "user" | "critic";
  userName: string;
  userImage: string | null;
  title: string | null;
  description: string | null;
  conclusion: string | null;
  likedAlbum: boolean | null;
  rating10: number | null;
  likeCount: number;
  likedByViewer: boolean;
  createdAt: string | null;
};

export async function getAlbumRecentReviews(
  albumId: string,
  viewerId?: string | null,
): Promise<AlbumReviewListItemRow[]> {
  const userReviewRows = await db
    .select({
      id: userAlbumReview.id,
      reviewType: sql<"user">`'user'`,
      userName: user.name,
      userImage: user.image,
      title: sql<string | null>`NULL`,
      description: userAlbumReview.description,
      conclusion: sql<string | null>`NULL`,
      likedAlbum: userAlbumReview.liked,
      rating10: userAlbumReview.ocena,
      likeCount: sql<number>`count(${userAlbumReviewLikes.id})::int`,
      likedByViewer: viewerId
        ? sql<boolean>`bool_or(${userAlbumReviewLikes.userId} = ${viewerId})`
        : sql<boolean>`false`,
      createdAt: userAlbumReview.dateCreated,
    })
    .from(userAlbumReview)
    .innerJoin(user, eq(user.id, userAlbumReview.userId))
    .innerJoin(album, eq(album.id, userAlbumReview.albumId))
    .leftJoin(
      userAlbumReviewLikes,
      eq(userAlbumReviewLikes.reviewId, userAlbumReview.id),
    )
    .where(eq(userAlbumReview.albumId, albumId))
    .groupBy(
      userAlbumReview.id,
      user.name,
      user.image,
      userAlbumReview.description,
      userAlbumReview.ocena,
      userAlbumReview.dateCreated,
    );

  const criticReviewRows = await db
    .select({
      id: criticAlbumReview.id,
      reviewType: sql<"critic">`'critic'`,
      userName: user.name,
      userImage: user.image,
      title: criticAlbumReview.naslov,
      description: criticAlbumReview.tekstKritike,
      conclusion: criticAlbumReview.zakljucak,
      likedAlbum: sql<boolean | null>`NULL`,
      rating10: criticAlbumReview.ocena,
      likeCount: sql<number>`count(${criticAlbumReviewLikes.id})::int`,
      likedByViewer: viewerId
        ? sql<boolean>`bool_or(${criticAlbumReviewLikes.userId} = ${viewerId})`
        : sql<boolean>`false`,
      createdAt: criticAlbumReview.dateCreated,
    })
    .from(criticAlbumReview)
    .innerJoin(user, eq(user.id, criticAlbumReview.userId))
    .innerJoin(album, eq(album.id, criticAlbumReview.albumId))
    .leftJoin(
      criticAlbumReviewLikes,
      eq(criticAlbumReviewLikes.reviewId, criticAlbumReview.id),
    )
    .where(eq(criticAlbumReview.albumId, albumId))
    .groupBy(
      criticAlbumReview.id,
      user.name,
      user.image,
      criticAlbumReview.naslov,
      criticAlbumReview.tekstKritike,
      criticAlbumReview.ocena,
      criticAlbumReview.dateCreated,
    );

  return [...userReviewRows, ...criticReviewRows]
    .map((row) => ({
      id: String(row.id),
      reviewType: row.reviewType,
      userName: String(row.userName),
      userImage: row.userImage ? String(row.userImage) : null,
      title: row.title ? String(row.title) : null,
      description: row.description ? String(row.description) : null,
      conclusion: row.conclusion ? String(row.conclusion) : null,
      likedAlbum:
        row.likedAlbum === null || row.likedAlbum === undefined
          ? null
          : Boolean(row.likedAlbum),
      rating10: row.rating10 === null ? null : Number(row.rating10),
      likeCount: Number(row.likeCount ?? 0),
      likedByViewer: Boolean(row.likedByViewer),
      createdAt: row.createdAt ? String(row.createdAt) : null,
    }))
    .sort((first, second) => {
      const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondTime = second.createdAt
        ? new Date(second.createdAt).getTime()
        : 0;

      return secondTime - firstTime;
    });
}
