import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import {
  album,
  albumGenres,
  criticAlbumReview,
  criticAlbumReviewLikes,
  genre,
  song,
  user,
  userAlbumReview,
  userAlbumReviewLikes,
} from "@/db/schema";

export interface IconicPressingRow {
  id: string;
  name: string;
  spotifyId: string;
  releaseYear: number;
  reviewCount: number;
  avgRating10: number;
}

export interface AlbumRecord {
  id: string;
  name: string;
  spotifyId: string;
  releaseYear: number;
}

export interface SongRecord {
  id: string;
  albumId: string;
  name: string;
  spotifyId: string;
}

export interface GenreRecord {
  id: string;
  name: string;
}

export interface UserAlbumReviewRow {
  id: string;
  albumId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  ocena: number | null;
  liked: boolean;
  description: string | null;
  dateCreated: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface CriticAlbumReviewRow {
  id: string;
  albumId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  naslov: string;
  ocena: number;
  tekstKritike: string;
  zakljucak: string | null;
  dateCreated: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface AlbumScoreRow {
  average: number | null;
  reviewCount: number;
}

export interface AlbumReviewPageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export async function getIconicPressings(
  limit: number,
): Promise<IconicPressingRow[]> {
  const result = await db.execute(sql`
    WITH recent_reviews AS (
      SELECT album_id, COUNT(*)::int AS review_count
      FROM (
        SELECT album_id
        FROM "User_Album_Review"
        WHERE date_created >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT album_id
        FROM "Critic_Album_Review"
        WHERE date_created >= CURRENT_DATE - INTERVAL '30 days'
      ) recent
      GROUP BY album_id
    ),
    rating_scores AS (
      SELECT album_id, AVG(ocena)::float AS avg_rating
      FROM (
        SELECT album_id, ocena
        FROM "User_Album_Review"
        WHERE ocena IS NOT NULL
        UNION ALL
        SELECT album_id, ocena
        FROM "Critic_Album_Review"
        WHERE ocena IS NOT NULL
      ) scores
      GROUP BY album_id
    )
    SELECT
      a.id,
      a.name,
      a.spotify_id,
      a.godina_izdavanja,
      COALESCE(r.review_count, 0) AS review_count,
      COALESCE(s.avg_rating, 0) AS avg_rating
    FROM "Album" a
    LEFT JOIN recent_reviews r ON r.album_id = a.id
    LEFT JOIN rating_scores s ON s.album_id = a.id
    ORDER BY review_count DESC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    name: string;
    spotify_id: string;
    godina_izdavanja: number;
    review_count: number;
    avg_rating: number;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    spotifyId: String(row.spotify_id),
    releaseYear: Number(row.godina_izdavanja ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    avgRating10: Number(row.avg_rating ?? 0),
  }));
}

export async function getAlbumById(albumId: string): Promise<AlbumRecord | null> {
  const result = await db.execute(sql`
    SELECT
      a.id::text AS id,
      a.name AS name,
      a.spotify_id AS spotify_id,
      a.godina_izdavanja AS godina_izdavanja
    FROM "Album" a
    WHERE a.id::text = ${albumId}
    LIMIT 1
  `);

  const rows = result.rows as Array<{
    id: string;
    name: string;
    spotify_id: string;
    godina_izdavanja: number;
  }>;
  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: String(row.name),
    spotifyId: String(row.spotify_id),
    releaseYear: Number(row.godina_izdavanja),
  };
}

export async function getAlbumBySpotifyId(
  spotifyId: string,
): Promise<AlbumRecord | null> {
  const [row] = await db
    .select({
      id: album.id,
      name: album.name,
      spotifyId: album.spotifyId,
      releaseYear: album.godinaIzdavanja,
    })
    .from(album)
    .where(eq(album.spotifyId, spotifyId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: String(row.name),
    spotifyId: String(row.spotifyId),
    releaseYear: Number(row.releaseYear),
  };
}

export async function insertAlbum(data: {
  name: string;
  releaseYear: number;
  spotifyId: string;
}): Promise<AlbumRecord> {
  const [row] = await db
    .insert(album)
    .values({
      name: data.name,
      godinaIzdavanja: data.releaseYear,
      spotifyId: data.spotifyId,
    })
    .onConflictDoUpdate({
      target: album.spotifyId,
      set: {
        name: data.name,
        godinaIzdavanja: data.releaseYear,
      },
    })
    .returning({
      id: album.id,
      name: album.name,
      spotifyId: album.spotifyId,
      releaseYear: album.godinaIzdavanja,
    });

  if (!row) {
    throw new Error("Failed to upsert album.");
  }

  return {
    id: String(row.id),
    name: String(row.name),
    spotifyId: String(row.spotifyId),
    releaseYear: Number(row.releaseYear),
  };
}

export async function getSongsByAlbum(albumId: string): Promise<SongRecord[]> {
  const rows = await db
    .select({
      id: song.id,
      albumId: song.albumId,
      name: song.name,
      spotifyId: song.spotifyId,
    })
    .from(song)
    .where(eq(song.albumId, albumId))
    .orderBy(asc(song.name));

  return rows.map((row) => ({
    id: String(row.id),
    albumId: String(row.albumId),
    name: String(row.name),
    spotifyId: String(row.spotifyId),
  }));
}

export async function getSongBySpotifyId(
  spotifyId: string,
): Promise<SongRecord | null> {
  const [row] = await db
    .select({
      id: song.id,
      albumId: song.albumId,
      name: song.name,
      spotifyId: song.spotifyId,
    })
    .from(song)
    .where(eq(song.spotifyId, spotifyId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    albumId: String(row.albumId),
    name: String(row.name),
    spotifyId: String(row.spotifyId),
  };
}

export async function insertSong(data: {
  albumId: string;
  name: string;
  spotifyId: string;
}): Promise<SongRecord> {
  const [row] = await db
    .insert(song)
    .values({
      albumId: data.albumId,
      name: data.name,
      spotifyId: data.spotifyId,
    })
    .onConflictDoUpdate({
      target: song.spotifyId,
      set: {
        albumId: data.albumId,
        name: data.name,
      },
    })
    .returning({
      id: song.id,
      albumId: song.albumId,
      name: song.name,
      spotifyId: song.spotifyId,
    });

  if (!row) {
    throw new Error("Failed to upsert song.");
  }

  return {
    id: String(row.id),
    albumId: String(row.albumId),
    name: String(row.name),
    spotifyId: String(row.spotifyId),
  };
}

export async function getGenreByName(name: string): Promise<GenreRecord | null> {
  const [row] = await db
    .select({
      id: genre.id,
      name: genre.name,
    })
    .from(genre)
    .where(eq(genre.name, name))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: String(row.name),
  };
}

export async function insertGenre(name: string): Promise<GenreRecord> {
  const [inserted] = await db
    .insert(genre)
    .values({ name })
    .onConflictDoNothing({ target: genre.name })
    .returning({
      id: genre.id,
      name: genre.name,
    });

  if (inserted) {
    return {
      id: String(inserted.id),
      name: String(inserted.name),
    };
  }

  const existing = await getGenreByName(name);

  if (!existing) {
    throw new Error("Failed to insert genre.");
  }

  return existing;
}

export async function linkAlbumGenre(
  albumId: string,
  genreId: string,
): Promise<void> {
  const [existing] = await db
    .select({ id: albumGenres.id })
    .from(albumGenres)
    .where(and(eq(albumGenres.albumId, albumId), eq(albumGenres.genreId, genreId)))
    .limit(1);

  if (existing) {
    return;
  }

  await db.insert(albumGenres).values({ albumId, genreId });
}

export async function getAlbumGenres(albumId: string): Promise<string[]> {
  const rows = await db
    .select({ name: genre.name })
    .from(albumGenres)
    .innerJoin(genre, eq(genre.id, albumGenres.genreId))
    .where(eq(albumGenres.albumId, albumId))
    .orderBy(asc(genre.name));

  return rows.map((row) => String(row.name));
}

export async function getUserAlbumReviewById(
  reviewId: string,
): Promise<{
  id: string;
  albumId: string;
  userId: string;
  ocena: number | null;
  liked: boolean;
  description: string | null;
} | null> {
  const [row] = await db
    .select({
      id: userAlbumReview.id,
      albumId: userAlbumReview.albumId,
      userId: userAlbumReview.userId,
      ocena: userAlbumReview.ocena,
      liked: userAlbumReview.liked,
      description: userAlbumReview.description,
    })
    .from(userAlbumReview)
    .where(eq(userAlbumReview.id, reviewId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    albumId: String(row.albumId),
    userId: String(row.userId),
    ocena: row.ocena === null ? null : Number(row.ocena),
    liked: Boolean(row.liked),
    description: row.description ? String(row.description) : null,
  };
}

export async function getUserAlbumReviewByUser(
  albumId: string,
  userId: string,
): Promise<{
  id: string;
  ocena: number | null;
  liked: boolean;
  description: string | null;
} | null> {
  const [row] = await db
    .select({
      id: userAlbumReview.id,
      ocena: userAlbumReview.ocena,
      liked: userAlbumReview.liked,
      description: userAlbumReview.description,
    })
    .from(userAlbumReview)
    .where(
      and(eq(userAlbumReview.albumId, albumId), eq(userAlbumReview.userId, userId)),
    )
    .orderBy(desc(userAlbumReview.dateCreated), desc(userAlbumReview.id))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    ocena: row.ocena === null ? null : Number(row.ocena),
    liked: Boolean(row.liked),
    description: row.description ? String(row.description) : null,
  };
}

export async function insertUserAlbumReview(data: {
  albumId: string;
  userId: string;
  ocena: number | null;
  liked: boolean;
  description: string | null;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(userAlbumReview)
    .values({
      albumId: data.albumId,
      userId: data.userId,
      ocena: data.ocena,
      liked: data.liked,
      description: data.description,
    })
    .returning({ id: userAlbumReview.id });

  if (!row) {
    throw new Error("Failed to create user album review.");
  }

  return { id: String(row.id) };
}

export async function updateUserAlbumReview(
  reviewId: string,
  data: {
    ocena: number | null;
    liked: boolean;
    description: string | null;
  },
): Promise<void> {
  await db
    .update(userAlbumReview)
    .set({
      ocena: data.ocena,
      liked: data.liked,
      description: data.description,
    })
    .where(eq(userAlbumReview.id, reviewId));
}

export async function setUserAlbumReviewLiked(
  reviewId: string,
  liked: boolean,
): Promise<void> {
  await db
    .update(userAlbumReview)
    .set({ liked })
    .where(eq(userAlbumReview.id, reviewId));
}

export async function deleteUserAlbumReview(reviewId: string): Promise<void> {
  await db.delete(userAlbumReview).where(eq(userAlbumReview.id, reviewId));
}

export async function getUserAlbumReviews(
  albumId: string,
  page: number,
  pageSize: number,
  currentUserId: string | null,
): Promise<AlbumReviewPageResult<UserAlbumReviewRow>> {
  const resolvedPage = Math.max(1, page);
  const resolvedPageSize = Math.max(1, pageSize);
  const offset = (resolvedPage - 1) * resolvedPageSize;

  const likedByCurrentUserExpression = currentUserId
    ? sql<boolean>`coalesce(bool_or(${userAlbumReviewLikes.userId} = ${currentUserId}), false)`
    : sql<boolean>`false`;

  const rows = await db
    .select({
      id: userAlbumReview.id,
      albumId: userAlbumReview.albumId,
      userId: userAlbumReview.userId,
      userName: user.name,
      userImage: user.image,
      ocena: userAlbumReview.ocena,
      liked: userAlbumReview.liked,
      description: userAlbumReview.description,
      dateCreated: userAlbumReview.dateCreated,
      likeCount: sql<number>`count(${userAlbumReviewLikes.id})::int`,
      likedByCurrentUser: likedByCurrentUserExpression,
    })
    .from(userAlbumReview)
    .innerJoin(user, eq(user.id, userAlbumReview.userId))
    .leftJoin(
      userAlbumReviewLikes,
      eq(userAlbumReviewLikes.reviewId, userAlbumReview.id),
    )
    .where(eq(userAlbumReview.albumId, albumId))
    .groupBy(
      userAlbumReview.id,
      userAlbumReview.albumId,
      userAlbumReview.userId,
      user.name,
      user.image,
      userAlbumReview.ocena,
      userAlbumReview.liked,
      userAlbumReview.description,
      userAlbumReview.dateCreated,
    )
    .orderBy(desc(userAlbumReview.dateCreated), desc(userAlbumReview.id))
    .limit(resolvedPageSize)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userAlbumReview)
    .where(eq(userAlbumReview.albumId, albumId));

  const totalCount = Number(countRow?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));

  return {
    items: rows.map((row) => ({
      id: String(row.id),
      albumId: String(row.albumId),
      userId: String(row.userId),
      userName: String(row.userName),
      userImage: row.userImage ? String(row.userImage) : null,
      ocena: row.ocena === null ? null : Number(row.ocena),
      liked: Boolean(row.liked),
      description: row.description ? String(row.description) : null,
      dateCreated: String(row.dateCreated),
      likeCount: Number(row.likeCount ?? 0),
      likedByCurrentUser: Boolean(row.likedByCurrentUser),
    })),
    page: resolvedPage,
    pageSize: resolvedPageSize,
    totalCount,
    totalPages,
  };
}

export async function getAvgUserAlbumScore(
  albumId: string,
): Promise<AlbumScoreRow> {
  const [row] = await db
    .select({
      average: sql<number | null>`avg(${userAlbumReview.ocena})`,
      reviewCount: sql<number>`count(${userAlbumReview.ocena})::int`,
    })
    .from(userAlbumReview)
    .where(eq(userAlbumReview.albumId, albumId));

  return {
    average:
      row?.average === null || row?.average === undefined
        ? null
        : Number(row.average),
    reviewCount: Number(row?.reviewCount ?? 0),
  };
}

export async function getCriticAlbumReviewById(
  reviewId: string,
): Promise<{
  id: string;
  albumId: string;
  userId: string;
  naslov: string;
  ocena: number;
  tekstKritike: string;
  zakljucak: string | null;
} | null> {
  const [row] = await db
    .select({
      id: criticAlbumReview.id,
      albumId: criticAlbumReview.albumId,
      userId: criticAlbumReview.userId,
      naslov: criticAlbumReview.naslov,
      ocena: criticAlbumReview.ocena,
      tekstKritike: criticAlbumReview.tekstKritike,
      zakljucak: criticAlbumReview.zakljucak,
    })
    .from(criticAlbumReview)
    .where(eq(criticAlbumReview.id, reviewId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    albumId: String(row.albumId),
    userId: String(row.userId),
    naslov: String(row.naslov),
    ocena: Number(row.ocena),
    tekstKritike: String(row.tekstKritike),
    zakljucak: row.zakljucak ? String(row.zakljucak) : null,
  };
}

export async function getCriticAlbumReviewByUser(
  albumId: string,
  userId: string,
): Promise<{
  id: string;
  naslov: string;
  ocena: number;
  tekstKritike: string;
  zakljucak: string | null;
} | null> {
  const [row] = await db
    .select({
      id: criticAlbumReview.id,
      naslov: criticAlbumReview.naslov,
      ocena: criticAlbumReview.ocena,
      tekstKritike: criticAlbumReview.tekstKritike,
      zakljucak: criticAlbumReview.zakljucak,
    })
    .from(criticAlbumReview)
    .where(
      and(
        eq(criticAlbumReview.albumId, albumId),
        eq(criticAlbumReview.userId, userId),
      ),
    )
    .orderBy(desc(criticAlbumReview.dateCreated), desc(criticAlbumReview.id))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    naslov: String(row.naslov),
    ocena: Number(row.ocena),
    tekstKritike: String(row.tekstKritike),
    zakljucak: row.zakljucak ? String(row.zakljucak) : null,
  };
}

export async function insertCriticAlbumReview(data: {
  albumId: string;
  userId: string;
  naslov: string;
  ocena: number;
  tekstKritike: string;
  zakljucak: string | null;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(criticAlbumReview)
    .values({
      albumId: data.albumId,
      userId: data.userId,
      naslov: data.naslov,
      ocena: data.ocena,
      tekstKritike: data.tekstKritike,
      zakljucak: data.zakljucak,
    })
    .returning({ id: criticAlbumReview.id });

  if (!row) {
    throw new Error("Failed to create critic album review.");
  }

  return { id: String(row.id) };
}

export async function updateCriticAlbumReview(
  reviewId: string,
  data: {
    naslov: string;
    ocena: number;
    tekstKritike: string;
    zakljucak: string | null;
  },
): Promise<void> {
  await db
    .update(criticAlbumReview)
    .set({
      naslov: data.naslov,
      ocena: data.ocena,
      tekstKritike: data.tekstKritike,
      zakljucak: data.zakljucak,
    })
    .where(eq(criticAlbumReview.id, reviewId));
}

export async function deleteCriticAlbumReview(reviewId: string): Promise<void> {
  await db.delete(criticAlbumReview).where(eq(criticAlbumReview.id, reviewId));
}

export async function getCriticAlbumReviews(
  albumId: string,
  page: number,
  pageSize: number,
  currentUserId: string | null,
): Promise<AlbumReviewPageResult<CriticAlbumReviewRow>> {
  const resolvedPage = Math.max(1, page);
  const resolvedPageSize = Math.max(1, pageSize);
  const offset = (resolvedPage - 1) * resolvedPageSize;

  const likedByCurrentUserExpression = currentUserId
    ? sql<boolean>`coalesce(bool_or(${criticAlbumReviewLikes.userId} = ${currentUserId}), false)`
    : sql<boolean>`false`;

  const rows = await db
    .select({
      id: criticAlbumReview.id,
      albumId: criticAlbumReview.albumId,
      userId: criticAlbumReview.userId,
      userName: user.name,
      userImage: user.image,
      naslov: criticAlbumReview.naslov,
      ocena: criticAlbumReview.ocena,
      tekstKritike: criticAlbumReview.tekstKritike,
      zakljucak: criticAlbumReview.zakljucak,
      dateCreated: criticAlbumReview.dateCreated,
      likeCount: sql<number>`count(${criticAlbumReviewLikes.id})::int`,
      likedByCurrentUser: likedByCurrentUserExpression,
    })
    .from(criticAlbumReview)
    .innerJoin(user, eq(user.id, criticAlbumReview.userId))
    .leftJoin(
      criticAlbumReviewLikes,
      eq(criticAlbumReviewLikes.reviewId, criticAlbumReview.id),
    )
    .where(eq(criticAlbumReview.albumId, albumId))
    .groupBy(
      criticAlbumReview.id,
      criticAlbumReview.albumId,
      criticAlbumReview.userId,
      user.name,
      user.image,
      criticAlbumReview.naslov,
      criticAlbumReview.ocena,
      criticAlbumReview.tekstKritike,
      criticAlbumReview.zakljucak,
      criticAlbumReview.dateCreated,
    )
    .orderBy(desc(criticAlbumReview.dateCreated), desc(criticAlbumReview.id))
    .limit(resolvedPageSize)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(criticAlbumReview)
    .where(eq(criticAlbumReview.albumId, albumId));

  const totalCount = Number(countRow?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));

  return {
    items: rows.map((row) => ({
      id: String(row.id),
      albumId: String(row.albumId),
      userId: String(row.userId),
      userName: String(row.userName),
      userImage: row.userImage ? String(row.userImage) : null,
      naslov: String(row.naslov),
      ocena: Number(row.ocena),
      tekstKritike: String(row.tekstKritike),
      zakljucak: row.zakljucak ? String(row.zakljucak) : null,
      dateCreated: String(row.dateCreated),
      likeCount: Number(row.likeCount ?? 0),
      likedByCurrentUser: Boolean(row.likedByCurrentUser),
    })),
    page: resolvedPage,
    pageSize: resolvedPageSize,
    totalCount,
    totalPages,
  };
}

export async function getAvgCriticAlbumScore(
  albumId: string,
): Promise<AlbumScoreRow> {
  const [row] = await db
    .select({
      average: sql<number | null>`avg(${criticAlbumReview.ocena})`,
      reviewCount: sql<number>`count(${criticAlbumReview.ocena})::int`,
    })
    .from(criticAlbumReview)
    .where(eq(criticAlbumReview.albumId, albumId));

  return {
    average:
      row?.average === null || row?.average === undefined
        ? null
        : Number(row.average),
    reviewCount: Number(row?.reviewCount ?? 0),
  };
}

export async function isUserAlbumReviewLiked(
  reviewId: string,
  userId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: userAlbumReviewLikes.id })
    .from(userAlbumReviewLikes)
    .where(
      and(
        eq(userAlbumReviewLikes.reviewId, reviewId),
        eq(userAlbumReviewLikes.userId, userId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function insertUserAlbumReviewLike(
  reviewId: string,
  userId: string,
): Promise<void> {
  await db
    .insert(userAlbumReviewLikes)
    .values({ reviewId, userId })
    .onConflictDoNothing({
      target: [userAlbumReviewLikes.reviewId, userAlbumReviewLikes.userId],
    });
}

export async function deleteUserAlbumReviewLike(
  reviewId: string,
  userId: string,
): Promise<void> {
  await db
    .delete(userAlbumReviewLikes)
    .where(
      and(
        eq(userAlbumReviewLikes.reviewId, reviewId),
        eq(userAlbumReviewLikes.userId, userId),
      ),
    );
}

export async function isCriticAlbumReviewLiked(
  reviewId: string,
  userId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: criticAlbumReviewLikes.id })
    .from(criticAlbumReviewLikes)
    .where(
      and(
        eq(criticAlbumReviewLikes.reviewId, reviewId),
        eq(criticAlbumReviewLikes.userId, userId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function insertCriticAlbumReviewLike(
  reviewId: string,
  userId: string,
): Promise<void> {
  await db
    .insert(criticAlbumReviewLikes)
    .values({ reviewId, userId })
    .onConflictDoNothing({
      target: [criticAlbumReviewLikes.reviewId, criticAlbumReviewLikes.userId],
    });
}

export async function deleteCriticAlbumReviewLike(
  reviewId: string,
  userId: string,
): Promise<void> {
  await db
    .delete(criticAlbumReviewLikes)
    .where(
      and(
        eq(criticAlbumReviewLikes.reviewId, reviewId),
        eq(criticAlbumReviewLikes.userId, userId),
      ),
    );
}
