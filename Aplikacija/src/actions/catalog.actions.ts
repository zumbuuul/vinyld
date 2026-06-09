"use server";

import { syncAlbumFromSpotify } from "@/actions/album.actions";
import {
  getAlbumIdBySpotifyId,
  getSongDetailsFromDb,
} from "@/db/queries/catalog.queries";
import { db } from "@/db/db";
import { song } from "@/db/schema";
import type {
  CatalogSearchResult,
  CatalogSongDetails,
} from "@/features/catalog/catalog.types";
import {
  getSpotifyTrack,
  searchSpotifyAlbumsByName,
  searchSpotifyTracksByName,
} from "@/lib/spotify";

function isSongIngested(songDetails: CatalogSongDetails | null): boolean {
  return Boolean(
    songDetails &&
    songDetails.artistDisplayName &&
    songDetails.album.name &&
    songDetails.album.spotifyId,
  );
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
