"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  getCriticAlbumReviewDraft,
  getAlbumDetailsFromDb,
  getUserAlbumReviewDraft,
} from "@/db/queries/catalog.queries";
import { getUserPreferences } from "@/db/queries/users.queries";
import { db } from "@/db/db";
import { album, criticAlbumReview, song, userAlbumReview } from "@/db/schema";
import type { CatalogAlbumDetails } from "@/features/catalog/catalog.types";
import { auth } from "@/lib/auth";
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

export async function saveAlbumReview(input: {
  albumId: string;
  albumSpotifyId: string;
  rating10: number;
  liked: boolean;
  description: string;
}): Promise<{
  liked: boolean;
  rating10: number;
  description: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "user") {
    throw new Error("Only users can submit standard album reviews");
  }

  const trimmedDescription = input.description.trim();
  const rating10 = Math.min(10, Math.max(0, Math.round(input.rating10)));
  const existingReview = await getUserAlbumReviewDraft(
    input.albumId,
    session.user.id,
  );

  if (!existingReview) {
    await db.insert(userAlbumReview).values({
      albumId: input.albumId,
      userId: session.user.id,
      ocena: rating10,
      liked: input.liked,
      description: trimmedDescription || null,
    });
  } else {
    await db
      .update(userAlbumReview)
      .set({
        ocena: rating10,
        liked: input.liked,
        description: trimmedDescription || null,
      })
      .where(
        and(
          eq(userAlbumReview.albumId, input.albumId),
          eq(userAlbumReview.userId, session.user.id),
        ),
      );
  }

  revalidatePath("/");
  revalidatePath(`/album/${input.albumSpotifyId}`);

  return {
    liked: input.liked,
    rating10,
    description: trimmedDescription,
  };
}

export async function saveCriticAlbumReview(input: {
  albumId: string;
  albumSpotifyId: string;
  title: string;
  rating10: number;
  critiqueText: string;
  conclusion: string;
}): Promise<{
  title: string;
  rating10: number;
  critiqueText: string;
  conclusion: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "critic") {
    throw new Error("Only critics can submit album critiques");
  }

  const trimmedTitle = input.title.trim();
  const trimmedCritiqueText = input.critiqueText.trim();
  const trimmedConclusion = input.conclusion.trim();
  const rating10 = Math.min(10, Math.max(0, Math.round(input.rating10)));

  if (!trimmedTitle || !trimmedCritiqueText) {
    throw new Error("Critique title and text are required");
  }

  const existingReview = await getCriticAlbumReviewDraft(
    input.albumId,
    session.user.id,
  );

  if (!existingReview) {
    await db.insert(criticAlbumReview).values({
      albumId: input.albumId,
      userId: session.user.id,
      naslov: trimmedTitle,
      ocena: rating10,
      tekstKritike: trimmedCritiqueText,
      zakljucak: trimmedConclusion || null,
    });
  } else {
    await db
      .update(criticAlbumReview)
      .set({
        naslov: trimmedTitle,
        ocena: rating10,
        tekstKritike: trimmedCritiqueText,
        zakljucak: trimmedConclusion || null,
      })
      .where(
        and(
          eq(criticAlbumReview.albumId, input.albumId),
          eq(criticAlbumReview.userId, session.user.id),
        ),
      );
  }

  revalidatePath("/");
  revalidatePath(`/album/${input.albumSpotifyId}`);

  return {
    title: trimmedTitle,
    rating10,
    critiqueText: trimmedCritiqueText,
    conclusion: trimmedConclusion,
  };
}
