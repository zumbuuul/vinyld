"use server";

import {
  getAlbumDetailsFromDb,
} from "@/db/queries/catalog.queries";
import { db } from "@/db/db";
import { album, song } from "@/db/schema";
import type { CatalogAlbumDetails } from "@/features/catalog/catalog.types";
import { getSpotifyAlbum, getSpotifyAlbumTracks } from "@/lib/spotify";

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

export async function syncAlbumFromSpotify(spotifyId: string): Promise<void> {
  const spotifyAlbum = await getSpotifyAlbum(spotifyId);

  if (!spotifyAlbum) {
    return;
  }

  const spotifyTracks = await getSpotifyAlbumTracks(spotifyId);
  const now = new Date().toISOString();
  const artistDisplayName =
    spotifyAlbum.artists.map((artist) => artist.name).join(", ") || null;
  const imageUrl = spotifyAlbum.images[0]?.url ?? null;
  const externalUrl = spotifyAlbum.external_urls?.spotify ?? null;

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
  });
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
