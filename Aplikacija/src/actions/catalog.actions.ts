"use server";

import { eq } from "drizzle-orm";

import {
  getAlbumDetailsFromDb,
  getAlbumIdBySpotifyId,
  getSongDetailsFromDb,
} from "@/db/queries/catalog.queries";
import { db } from "@/db/db";
import { album, albumGenres, genre, song } from "@/db/schema";
import type {
  CatalogAlbumDetails,
  CatalogSearchResult,
  CatalogSongDetails,
} from "@/features/catalog/catalog.types";
import {
  getSpotifyAlbum,
  getSpotifyAlbumTracks,
  getSpotifyArtist,
  getSpotifyTrack,
  searchSpotifyAlbumsByName,
  searchSpotifyTracksByName,
} from "@/lib/spotify";

function getReleaseYear(releaseDate: string): number {
  const parsedYear = Number.parseInt(releaseDate.slice(0, 4), 10);

  return Number.isNaN(parsedYear) ? new Date().getUTCFullYear() : parsedYear;
}

function isAlbumIngested(albumDetails: CatalogAlbumDetails | null): boolean {
  return Boolean(
    albumDetails &&
      albumDetails.artistDisplayName &&
      albumDetails.imageUrl &&
      albumDetails.tracks.length > 0,
  );
}

function isSongIngested(songDetails: CatalogSongDetails | null): boolean {
  return Boolean(
    songDetails &&
      songDetails.artistDisplayName &&
      songDetails.album.name &&
      songDetails.album.spotifyId,
  );
}

async function syncAlbumFromSpotify(spotifyId: string): Promise<void> {
  const spotifyAlbum = await getSpotifyAlbum(spotifyId);

  if (!spotifyAlbum) {
    return;
  }

  const [spotifyTracks, primaryArtist] = await Promise.all([
    getSpotifyAlbumTracks(spotifyId),
    spotifyAlbum.artists[0]?.id
      ? getSpotifyArtist(spotifyAlbum.artists[0].id)
      : Promise.resolve(null),
  ]);
  const now = new Date().toISOString();
  const artistDisplayName =
    spotifyAlbum.artists.map((artist) => artist.name).join(", ") || null;
  const imageUrl = spotifyAlbum.images[0]?.url ?? null;
  const externalUrl = spotifyAlbum.external_urls?.spotify ?? null;
  const genreNames = Array.from(
    new Set(
      (primaryArtist?.genres ?? [])
        .map((genreName) => genreName.trim())
        .filter(Boolean),
    ),
  );

  await db.transaction(async (tx) => {
    const [albumRow] = await tx
      .insert(album)
      .values({
        name: spotifyAlbum.name,
        godinaIzdavanja: getReleaseYear(spotifyAlbum.release_date),
        spotifyId: spotifyAlbum.id,
        imageUrl,
        artistDisplayName,
        releaseDate: spotifyAlbum.release_date,
        releaseDatePrecision: spotifyAlbum.release_date_precision,
        albumType: spotifyAlbum.album_type,
        totalTracks: spotifyAlbum.total_tracks,
        spotifyUri: spotifyAlbum.uri,
        spotifyExternalUrl: externalUrl,
        lastSpotifySyncAt: now,
      })
      .onConflictDoUpdate({
        target: album.spotifyId,
        set: {
          name: spotifyAlbum.name,
          godinaIzdavanja: getReleaseYear(spotifyAlbum.release_date),
          imageUrl,
          artistDisplayName,
          releaseDate: spotifyAlbum.release_date,
          releaseDatePrecision: spotifyAlbum.release_date_precision,
          albumType: spotifyAlbum.album_type,
          totalTracks: spotifyAlbum.total_tracks,
          spotifyUri: spotifyAlbum.uri,
          spotifyExternalUrl: externalUrl,
          lastSpotifySyncAt: now,
        },
      })
      .returning({ id: album.id });

    for (const track of spotifyTracks) {
      await tx
        .insert(song)
        .values({
          albumId: albumRow.id,
          name: track.name,
          spotifyId: track.id,
          artistDisplayName:
            track.artists.map((artist) => artist.name).join(", ") || null,
          durationMs: track.duration_ms,
          trackNumber: track.track_number,
          discNumber: track.disc_number,
          previewUrl: track.preview_url,
          spotifyUri: track.uri,
          spotifyExternalUrl: track.external_urls?.spotify ?? null,
          lastSpotifySyncAt: now,
        })
        .onConflictDoUpdate({
          target: song.spotifyId,
          set: {
            albumId: albumRow.id,
            name: track.name,
            artistDisplayName:
              track.artists.map((artist) => artist.name).join(", ") || null,
            durationMs: track.duration_ms,
            trackNumber: track.track_number,
            discNumber: track.disc_number,
            previewUrl: track.preview_url,
            spotifyUri: track.uri,
            spotifyExternalUrl: track.external_urls?.spotify ?? null,
            lastSpotifySyncAt: now,
          },
        });
    }

    await tx.delete(albumGenres).where(eq(albumGenres.albumId, albumRow.id));

    for (const genreName of genreNames) {
      const [insertedGenre] = await tx
        .insert(genre)
        .values({ name: genreName })
        .onConflictDoNothing()
        .returning({ id: genre.id });

      const targetGenre =
        insertedGenre ??
        (
          await tx
            .select({ id: genre.id })
            .from(genre)
            .where(eq(genre.name, genreName))
            .limit(1)
        )[0];

      if (!targetGenre) {
        continue;
      }

      await tx
        .insert(albumGenres)
        .values({
          albumId: albumRow.id,
          genreId: targetGenre.id,
        })
        .onConflictDoNothing();
    }
  });
}

async function syncSongFromSpotify(spotifyId: string): Promise<void> {
  const spotifyTrack = await getSpotifyTrack(spotifyId);

  if (!spotifyTrack) {
    return;
  }

  await syncAlbumFromSpotify(spotifyTrack.album.id);

  const albumId = await getAlbumIdBySpotifyId(spotifyTrack.album.id);

  if (!albumId) {
    return;
  }

  const now = new Date().toISOString();

  await db
    .insert(song)
    .values({
      albumId,
      name: spotifyTrack.name,
      spotifyId: spotifyTrack.id,
      artistDisplayName:
        spotifyTrack.artists.map((artist) => artist.name).join(", ") || null,
      durationMs: spotifyTrack.duration_ms,
      trackNumber: spotifyTrack.track_number,
      discNumber: spotifyTrack.disc_number,
      previewUrl: spotifyTrack.preview_url,
      spotifyUri: spotifyTrack.uri,
      spotifyExternalUrl: spotifyTrack.external_urls?.spotify ?? null,
      lastSpotifySyncAt: now,
    })
    .onConflictDoUpdate({
      target: song.spotifyId,
      set: {
        albumId,
        name: spotifyTrack.name,
        artistDisplayName:
          spotifyTrack.artists.map((artist) => artist.name).join(", ") || null,
        durationMs: spotifyTrack.duration_ms,
        trackNumber: spotifyTrack.track_number,
        discNumber: spotifyTrack.disc_number,
        previewUrl: spotifyTrack.preview_url,
        spotifyUri: spotifyTrack.uri,
        spotifyExternalUrl: spotifyTrack.external_urls?.spotify ?? null,
        lastSpotifySyncAt: now,
      },
    });
}

export async function searchCatalog(
  query: string,
): Promise<CatalogSearchResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const [albumResponse, trackResponse] = await Promise.all([
    searchSpotifyAlbumsByName(trimmedQuery, 1),
    searchSpotifyTracksByName(trimmedQuery, 1),
  ]);

  const albumResults: CatalogSearchResult[] = (albumResponse?.items ?? []).map(
    (item) => ({
      spotifyId: item.id,
      type: "album",
      name: item.name,
      subtitle: item.artists.map((artist) => artist.name).join(", "),
      imageUrl: item.images[0]?.url ?? null,
      href: `/album/${item.id}`,
    }),
  );

  const songResults: CatalogSearchResult[] = (trackResponse?.items ?? []).map(
    (item) => ({
      spotifyId: item.id,
      type: "song",
      name: item.name,
      subtitle: `${item.artists.map((artist) => artist.name).join(", ")} • ${item.album.name}`,
      imageUrl: item.album.images[0]?.url ?? null,
      href: `/song/${item.id}`,
    }),
  );

  return [...albumResults, ...songResults];
}

export async function getAlbumDetails(
  spotifyId: string,
): Promise<CatalogAlbumDetails | null> {
  const localAlbum = await getAlbumDetailsFromDb(spotifyId);

  if (isAlbumIngested(localAlbum)) {
    return localAlbum;
  }

  await syncAlbumFromSpotify(spotifyId);

  return getAlbumDetailsFromDb(spotifyId);
}

export async function getSongDetails(
  spotifyId: string,
): Promise<CatalogSongDetails | null> {
  const localSong = await getSongDetailsFromDb(spotifyId);

  if (isSongIngested(localSong)) {
    return localSong;
  }

  await syncSongFromSpotify(spotifyId);

  return getSongDetailsFromDb(spotifyId);
}
