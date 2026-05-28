import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db/db";
import {
  album,
  user,
  userAlbumReview,
  userAlbumReviewLikes,
} from "@/db/schema";

export interface RecentAlbumActivityRow {
  id: string;
  reviewType: "user" | "critic";
  userName: string;
  userImage: string | null;
  albumName: string;
  albumSpotifyId: string;
  albumReleaseYear: number | null;
  description: string | null;
  rating10: number | null;
  dateCreated: string | null;
  likeCount: number;
}

export async function getRecentAlbumActivity(
  limit: number,
): Promise<RecentAlbumActivityRow[]> {
  const rows = await db
    .select({
      id: userAlbumReview.id,
      reviewType: sql<"user">`'user'`,
      userName: user.name,
      userImage: user.image,
      albumName: album.name,
      albumSpotifyId: album.spotifyId,
      albumReleaseYear: album.godinaIzdavanja,
      description: userAlbumReview.description,
      rating10: userAlbumReview.ocena,
      dateCreated: userAlbumReview.dateCreated,
      likeCount: sql<number>`count(${userAlbumReviewLikes.id})::int`,
    })
    .from(userAlbumReview)
    .innerJoin(user, eq(user.id, userAlbumReview.userId))
    .innerJoin(album, eq(album.id, userAlbumReview.albumId))
    .leftJoin(
      userAlbumReviewLikes,
      eq(userAlbumReviewLikes.reviewId, userAlbumReview.id),
    )
    .where(
      and(
        gte(userAlbumReview.dateCreated, sql`CURRENT_DATE - INTERVAL '7 days'`),
      ),
    )
    .groupBy(
      userAlbumReview.id,
      user.name,
      user.image,
      album.name,
      album.spotifyId,
      album.godinaIzdavanja,
      userAlbumReview.description,
      userAlbumReview.ocena,
      userAlbumReview.dateCreated,
    )
    .orderBy(
      desc(sql`count(${userAlbumReviewLikes.id})`),
      desc(userAlbumReview.dateCreated),
    )
    .limit(limit);

  return rows.map((row) => ({
    id: String(row.id),
    reviewType: "user",
    userName: String(row.userName),
    userImage: row.userImage ? String(row.userImage) : null,
    albumName: String(row.albumName),
    albumSpotifyId: String(row.albumSpotifyId),
    albumReleaseYear:
      row.albumReleaseYear === null ? null : Number(row.albumReleaseYear),
    description: row.description ? String(row.description) : null,
    rating10: row.rating10 === null ? null : Number(row.rating10),
    dateCreated: row.dateCreated ? String(row.dateCreated) : null,
    likeCount: Number(row.likeCount ?? 0),
  }));
}
