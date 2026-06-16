import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/db";
import {
  album,
  criticAlbumReview,
  criticSongReview,
  song,
  userAlbumReview,
  userSongReview,
} from "@/db/schema";
import type {
  CatalogAlbumDetails,
  CatalogSongDetails,
} from "@/features/catalog/catalog.types";

export async function getAlbumDetailsFromDb(
  spotifyId: string,
): Promise<CatalogAlbumDetails | null> {
  const [albumRow] = await db
    .select({
      id: album.id,
      spotifyId: album.spotifyId,
      name: album.name,
      artistDisplayName: album.artistDisplayName,
      imageUrl: album.imageUrl,
      releaseDate: album.releaseDate,
      releaseDatePrecision: album.releaseDatePrecision,
      albumType: album.albumType,
      totalTracks: album.totalTracks,
      spotifyExternalUrl: album.spotifyExternalUrl,
    })
    .from(album)
    .where(eq(album.spotifyId, spotifyId))
    .limit(1);

  if (!albumRow) {
    return null;
  }

  const trackRows = await db
    .select({
      id: song.id,
      spotifyId: song.spotifyId,
      name: song.name,
      artistDisplayName: song.artistDisplayName,
      durationMs: song.durationMs,
      trackNumber: song.trackNumber,
      discNumber: song.discNumber,
      previewUrl: song.previewUrl,
    })
    .from(song)
    .where(eq(song.albumId, albumRow.id))
    .orderBy(asc(song.discNumber), asc(song.trackNumber), asc(song.name));

  return {
    id: albumRow.id,
    spotifyId: albumRow.spotifyId,
    name: albumRow.name,
    artistDisplayName: albumRow.artistDisplayName,
    imageUrl: albumRow.imageUrl,
    releaseDate: albumRow.releaseDate,
    releaseDatePrecision: albumRow.releaseDatePrecision,
    albumType: albumRow.albumType,
    totalTracks: albumRow.totalTracks,
    spotifyExternalUrl: albumRow.spotifyExternalUrl,
    tracks: trackRows.map((row) => ({
      id: row.id,
      spotifyId: row.spotifyId,
      name: row.name,
      artistDisplayName: row.artistDisplayName,
      durationMs: row.durationMs,
      trackNumber: row.trackNumber,
      discNumber: row.discNumber,
      previewUrl: row.previewUrl,
    })),
  };
}

export async function getSongDetailsFromDb(
  spotifyId: string,
): Promise<CatalogSongDetails | null> {
  const [row] = await db
    .select({
      id: song.id,
      spotifyId: song.spotifyId,
      name: song.name,
      artistDisplayName: song.artistDisplayName,
      durationMs: song.durationMs,
      trackNumber: song.trackNumber,
      discNumber: song.discNumber,
      previewUrl: song.previewUrl,
      spotifyExternalUrl: song.spotifyExternalUrl,
      albumId: album.id,
      albumSpotifyId: album.spotifyId,
      albumName: album.name,
      albumImageUrl: album.imageUrl,
      albumArtistDisplayName: album.artistDisplayName,
    })
    .from(song)
    .innerJoin(album, eq(song.albumId, album.id))
    .where(eq(song.spotifyId, spotifyId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    spotifyId: row.spotifyId,
    name: row.name,
    artistDisplayName: row.artistDisplayName,
    durationMs: row.durationMs,
    trackNumber: row.trackNumber,
    discNumber: row.discNumber,
    previewUrl: row.previewUrl,
    spotifyExternalUrl: row.spotifyExternalUrl,
    album: {
      id: row.albumId,
      spotifyId: row.albumSpotifyId,
      name: row.albumName,
      imageUrl: row.albumImageUrl,
      artistDisplayName: row.albumArtistDisplayName,
    },
  };
}

export async function getAlbumIdBySpotifyId(
  spotifyId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: album.id })
    .from(album)
    .where(eq(album.spotifyId, spotifyId))
    .limit(1);

  return row?.id ?? null;
}

export async function getUserAlbumReviewDraft(
  albumId: string,
  userId: string,
): Promise<{
  liked: boolean;
  rating10: number | null;
  description: string | null;
} | null> {
  const [row] = await db
    .select({
      liked: userAlbumReview.liked,
      rating10: userAlbumReview.ocena,
      description: userAlbumReview.description,
    })
    .from(userAlbumReview)
    .where(
      and(
        eq(userAlbumReview.albumId, albumId),
        eq(userAlbumReview.userId, userId),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    liked: Boolean(row.liked),
    rating10: row.rating10,
    description: row.description,
  };
}

export async function getCriticAlbumReviewDraft(
  albumId: string,
  userId: string,
): Promise<{
  title: string;
  rating10: number;
  critiqueText: string;
  conclusion: string | null;
} | null> {
  const [row] = await db
    .select({
      title: criticAlbumReview.naslov,
      rating10: criticAlbumReview.ocena,
      critiqueText: criticAlbumReview.tekstKritike,
      conclusion: criticAlbumReview.zakljucak,
    })
    .from(criticAlbumReview)
    .where(
      and(
        eq(criticAlbumReview.albumId, albumId),
        eq(criticAlbumReview.userId, userId),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    title: String(row.title),
    rating10: Number(row.rating10),
    critiqueText: String(row.critiqueText),
    conclusion: row.conclusion ? String(row.conclusion) : null,
  };
}

export async function getUserSongReviewDraft(
  songId: string,
  userId: string,
): Promise<{
  liked: boolean;
  rating10: number | null;
  description: string | null;
} | null> {
  const [row] = await db
    .select({
      liked: userSongReview.liked,
      rating10: userSongReview.ocena,
      description: userSongReview.description,
    })
    .from(userSongReview)
    .where(and(eq(userSongReview.songId, songId), eq(userSongReview.userId, userId)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    liked: Boolean(row.liked),
    rating10: row.rating10,
    description: row.description,
  };
}

export async function getCriticSongReviewDraft(
  songId: string,
  userId: string,
): Promise<{
  title: string;
  rating10: number;
  critiqueText: string;
  conclusion: string | null;
} | null> {
  const [row] = await db
    .select({
      title: criticSongReview.naslov,
      rating10: criticSongReview.ocena,
      critiqueText: criticSongReview.tekstKritike,
      conclusion: criticSongReview.zakljucak,
    })
    .from(criticSongReview)
    .where(
      and(eq(criticSongReview.songId, songId), eq(criticSongReview.userId, userId)),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    title: String(row.title),
    rating10: Number(row.rating10),
    critiqueText: String(row.critiqueText),
    conclusion: row.conclusion ? String(row.conclusion) : null,
  };
}
