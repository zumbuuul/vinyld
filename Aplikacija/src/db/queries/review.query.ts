import { eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import {
  album,
  criticAlbumReview,
  criticAlbumReviewLikes,
  criticSongReview,
  criticSongReviewLikes,
  song,
  user,
  userAlbumReview,
  userAlbumReviewLikes,
  userSongReview,
  userSongReviewLikes,
} from "@/db/schema";

export type AlbumReviewListItemRow = {
  id: string;
  reviewSubject?: "album" | "song";
  targetHref?: string | null;
  targetName?: string | null;
  targetImageUrl?: string | null;
  targetSecondaryText?: string | null;
  reviewType: "user" | "critic";
  userId: string;
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

export async function getUserRecentReviews(
  userId: string,
  viewerId?: string | null,
  limit = 5,
): Promise<AlbumReviewListItemRow[]> {
  const resolvedUserImage = sql<string | null>`COALESCE((
    SELECT up.profile_picture_url
    FROM "UserPreferences" up
    WHERE up.user_id = ${user.id}
    ORDER BY up.preference_id DESC
    LIMIT 1
  ), ${user.image})`;

  const albumReviewRows = await db
    .select({
      id: userAlbumReview.id,
      reviewSubject: sql<"album">`'album'`,
      targetHref: sql<string>`'/album/' || ${album.spotifyId}`,
      targetName: album.name,
      targetImageUrl: album.imageUrl,
      targetSecondaryText: album.artistDisplayName,
      reviewType: sql<"user">`'user'`,
      userId: user.id,
      userName: user.name,
      userImage: resolvedUserImage,
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
    .where(eq(userAlbumReview.userId, userId))
    .groupBy(
      userAlbumReview.id,
      album.spotifyId,
      album.name,
      album.imageUrl,
      album.artistDisplayName,
      user.name,
      user.id,
      user.image,
      userAlbumReview.description,
      userAlbumReview.ocena,
      userAlbumReview.liked,
      userAlbumReview.dateCreated,
    );

  const songReviewRows = await db
    .select({
      id: userSongReview.id,
      reviewSubject: sql<"song">`'song'`,
      targetHref: sql<string>`'/song/' || ${song.spotifyId}`,
      targetName: song.name,
      targetImageUrl: album.imageUrl,
      targetSecondaryText: sql<string | null>`COALESCE(${song.artistDisplayName}, ${album.artistDisplayName}, ${album.name})`,
      reviewType: sql<"user">`'user'`,
      userId: user.id,
      userName: user.name,
      userImage: resolvedUserImage,
      title: sql<string | null>`NULL`,
      description: userSongReview.description,
      conclusion: sql<string | null>`NULL`,
      likedAlbum: userSongReview.liked,
      rating10: userSongReview.ocena,
      likeCount: sql<number>`count(${userSongReviewLikes.id})::int`,
      likedByViewer: viewerId
        ? sql<boolean>`bool_or(${userSongReviewLikes.userId} = ${viewerId})`
        : sql<boolean>`false`,
      createdAt: userSongReview.dateCreated,
    })
    .from(userSongReview)
    .innerJoin(user, eq(user.id, userSongReview.userId))
    .innerJoin(song, eq(song.id, userSongReview.songId))
    .innerJoin(album, eq(album.id, song.albumId))
    .leftJoin(
      userSongReviewLikes,
      eq(userSongReviewLikes.reviewId, userSongReview.id),
    )
    .where(eq(userSongReview.userId, userId))
    .groupBy(
      userSongReview.id,
      song.spotifyId,
      song.name,
      song.artistDisplayName,
      album.imageUrl,
      album.artistDisplayName,
      album.name,
      user.name,
      user.id,
      user.image,
      userSongReview.description,
      userSongReview.ocena,
      userSongReview.liked,
      userSongReview.dateCreated,
    );

  const criticAlbumRows = await db
    .select({
      id: criticAlbumReview.id,
      reviewSubject: sql<"album">`'album'`,
      targetHref: sql<string>`'/album/' || ${album.spotifyId}`,
      targetName: album.name,
      targetImageUrl: album.imageUrl,
      targetSecondaryText: album.artistDisplayName,
      reviewType: sql<"critic">`'critic'`,
      userId: user.id,
      userName: user.name,
      userImage: resolvedUserImage,
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
    .where(eq(criticAlbumReview.userId, userId))
    .groupBy(
      criticAlbumReview.id,
      album.spotifyId,
      album.name,
      album.imageUrl,
      album.artistDisplayName,
      user.name,
      user.id,
      user.image,
      criticAlbumReview.naslov,
      criticAlbumReview.tekstKritike,
      criticAlbumReview.ocena,
      criticAlbumReview.zakljucak,
      criticAlbumReview.dateCreated,
    );

  const criticSongRows = await db
    .select({
      id: criticSongReview.id,
      reviewSubject: sql<"song">`'song'`,
      targetHref: sql<string>`'/song/' || ${song.spotifyId}`,
      targetName: song.name,
      targetImageUrl: album.imageUrl,
      targetSecondaryText: sql<string | null>`COALESCE(${song.artistDisplayName}, ${album.artistDisplayName}, ${album.name})`,
      reviewType: sql<"critic">`'critic'`,
      userId: user.id,
      userName: user.name,
      userImage: resolvedUserImage,
      title: criticSongReview.naslov,
      description: criticSongReview.tekstKritike,
      conclusion: criticSongReview.zakljucak,
      likedAlbum: sql<boolean | null>`NULL`,
      rating10: criticSongReview.ocena,
      likeCount: sql<number>`count(${criticSongReviewLikes.id})::int`,
      likedByViewer: viewerId
        ? sql<boolean>`bool_or(${criticSongReviewLikes.userId} = ${viewerId})`
        : sql<boolean>`false`,
      createdAt: criticSongReview.dateCreated,
    })
    .from(criticSongReview)
    .innerJoin(user, eq(user.id, criticSongReview.userId))
    .innerJoin(song, eq(song.id, criticSongReview.songId))
    .innerJoin(album, eq(album.id, song.albumId))
    .leftJoin(
      criticSongReviewLikes,
      eq(criticSongReviewLikes.reviewId, criticSongReview.id),
    )
    .where(eq(criticSongReview.userId, userId))
    .groupBy(
      criticSongReview.id,
      song.spotifyId,
      song.name,
      song.artistDisplayName,
      album.imageUrl,
      album.artistDisplayName,
      album.name,
      user.name,
      user.id,
      user.image,
      criticSongReview.naslov,
      criticSongReview.tekstKritike,
      criticSongReview.ocena,
      criticSongReview.zakljucak,
      criticSongReview.dateCreated,
    );

  return [...albumReviewRows, ...songReviewRows, ...criticAlbumRows, ...criticSongRows]
    .map((row) => ({
      id: String(row.id),
      reviewSubject: row.reviewSubject,
      targetHref: row.targetHref ? String(row.targetHref) : null,
      targetName: row.targetName ? String(row.targetName) : null,
      targetImageUrl: row.targetImageUrl ? String(row.targetImageUrl) : null,
      targetSecondaryText: row.targetSecondaryText
        ? String(row.targetSecondaryText)
        : null,
      reviewType: row.reviewType,
      userId: String(row.userId),
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
    })
    .slice(0, limit);
}

export async function getAlbumRecentReviews(
  albumId: string,
  viewerId?: string | null,
): Promise<AlbumReviewListItemRow[]> {
  const userReviewRows = await db
    .select({
      id: userAlbumReview.id,
      reviewType: sql<"user">`'user'`,
      userId: user.id,
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
      user.id,
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
      userId: user.id,
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
      user.id,
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
      userId: String(row.userId),
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

export async function getSongRecentReviews(
  songId: string,
  viewerId?: string | null,
): Promise<AlbumReviewListItemRow[]> {
  const userReviewRows = await db
    .select({
      id: userSongReview.id,
      reviewType: sql<"user">`'user'`,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      title: sql<string | null>`NULL`,
      description: userSongReview.description,
      conclusion: sql<string | null>`NULL`,
      likedAlbum: userSongReview.liked,
      rating10: userSongReview.ocena,
      likeCount: sql<number>`count(${userSongReviewLikes.id})::int`,
      likedByViewer: viewerId
        ? sql<boolean>`bool_or(${userSongReviewLikes.userId} = ${viewerId})`
        : sql<boolean>`false`,
      createdAt: userSongReview.dateCreated,
    })
    .from(userSongReview)
    .innerJoin(user, eq(user.id, userSongReview.userId))
    .innerJoin(song, eq(song.id, userSongReview.songId))
    .leftJoin(
      userSongReviewLikes,
      eq(userSongReviewLikes.reviewId, userSongReview.id),
    )
    .where(eq(userSongReview.songId, songId))
    .groupBy(
      userSongReview.id,
      user.id,
      user.name,
      user.image,
      userSongReview.description,
      userSongReview.ocena,
      userSongReview.liked,
      userSongReview.dateCreated,
    );

  const criticReviewRows = await db
    .select({
      id: criticSongReview.id,
      reviewType: sql<"critic">`'critic'`,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      title: criticSongReview.naslov,
      description: criticSongReview.tekstKritike,
      conclusion: criticSongReview.zakljucak,
      likedAlbum: sql<boolean | null>`NULL`,
      rating10: criticSongReview.ocena,
      likeCount: sql<number>`count(${criticSongReviewLikes.id})::int`,
      likedByViewer: viewerId
        ? sql<boolean>`bool_or(${criticSongReviewLikes.userId} = ${viewerId})`
        : sql<boolean>`false`,
      createdAt: criticSongReview.dateCreated,
    })
    .from(criticSongReview)
    .innerJoin(user, eq(user.id, criticSongReview.userId))
    .innerJoin(song, eq(song.id, criticSongReview.songId))
    .leftJoin(
      criticSongReviewLikes,
      eq(criticSongReviewLikes.reviewId, criticSongReview.id),
    )
    .where(eq(criticSongReview.songId, songId))
    .groupBy(
      criticSongReview.id,
      user.id,
      user.name,
      user.image,
      criticSongReview.naslov,
      criticSongReview.tekstKritike,
      criticSongReview.ocena,
      criticSongReview.zakljucak,
      criticSongReview.dateCreated,
    );

  return [...userReviewRows, ...criticReviewRows]
    .map((row) => ({
      id: String(row.id),
      reviewType: row.reviewType,
      userId: String(row.userId),
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
