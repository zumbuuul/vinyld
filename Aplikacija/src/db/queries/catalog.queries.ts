import { asc, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { album, albumGenres, genre, song } from "@/db/schema";
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

  const [trackRows, genreRows] = await Promise.all([
    db
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
      .orderBy(asc(song.discNumber), asc(song.trackNumber), asc(song.name)),
    db
      .select({
        name: genre.name,
      })
      .from(albumGenres)
      .innerJoin(genre, eq(albumGenres.genreId, genre.id))
      .where(eq(albumGenres.albumId, albumRow.id))
      .orderBy(asc(genre.name)),
  ]);

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
    genres: genreRows.map((row) => row.name),
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
