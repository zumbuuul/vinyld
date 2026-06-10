import { desc, eq, sql } from "drizzle-orm";

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
  albumArtist: string | null;
  albumSpotifyId: string;
  albumImageUrl: string | null;
  albumReleaseYear: number | null;
  description: string | null;
  rating10: number | null;
  dateCreated: string | null;
  likeCount: number;
  likedByViewer: boolean;
}

export async function getRecentAlbumActivity(
  limit: number,
  viewerId?: string | null,
): Promise<RecentAlbumActivityRow[]> {
  const resolvedUserImage = sql<string | null>`COALESCE((
    SELECT up.profile_picture_url
    FROM "UserPreferences" up
    WHERE up.user_id = ${user.id}
    ORDER BY up.preference_id DESC
    LIMIT 1
  ), ${user.image})`;

  const rows = await db
    .select({
      id: userAlbumReview.id,
      reviewType: sql<"user">`'user'`,
      userName: user.name,
      userImage: resolvedUserImage,
      albumName: album.name,
      albumArtist: album.artistDisplayName,
      albumSpotifyId: album.spotifyId,
      albumImageUrl: album.imageUrl,
      albumReleaseYear: album.godinaIzdavanja,
      description: userAlbumReview.description,
      rating10: userAlbumReview.ocena,
      dateCreated: userAlbumReview.dateCreated,
      likeCount: sql<number>`count(${userAlbumReviewLikes.id})::int`,
      likedByViewer: viewerId
        ? sql<boolean>`bool_or(${userAlbumReviewLikes.userId} = ${viewerId})`
        : sql<boolean>`false`,
    })
    .from(userAlbumReview)
    .innerJoin(user, eq(user.id, userAlbumReview.userId))
    .innerJoin(album, eq(album.id, userAlbumReview.albumId))
    .leftJoin(
      userAlbumReviewLikes,
      eq(userAlbumReviewLikes.reviewId, userAlbumReview.id),
    )
    .groupBy(
      userAlbumReview.id,
      user.name,
      user.id,
      user.image,
      album.name,
      album.artistDisplayName,
      album.spotifyId,
      album.imageUrl,
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
    albumArtist: row.albumArtist ? String(row.albumArtist) : null,
    albumSpotifyId: String(row.albumSpotifyId),
    albumImageUrl: row.albumImageUrl ? String(row.albumImageUrl) : null,
    albumReleaseYear:
      row.albumReleaseYear === null ? null : Number(row.albumReleaseYear),
    description: row.description ? String(row.description) : null,
    rating10: row.rating10 === null ? null : Number(row.rating10),
    dateCreated: row.dateCreated ? String(row.dateCreated) : null,
    likeCount: Number(row.likeCount ?? 0),
    likedByViewer: Boolean(row.likedByViewer),
  }));
}
