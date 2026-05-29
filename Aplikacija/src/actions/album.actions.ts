"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import {
  deleteCriticAlbumReview as deleteCriticAlbumReviewQuery,
  deleteCriticAlbumReviewLike,
  deleteUserAlbumReview,
  deleteUserAlbumReviewLike,
  getAlbumById,
  getAlbumBySpotifyId,
  getAlbumGenres,
  getAvgCriticAlbumScore,
  getAvgUserAlbumScore,
  getCriticAlbumReviewById,
  getCriticAlbumReviewByUser,
  getCriticAlbumReviews,
  getSongBySpotifyId,
  getSongsByAlbum,
  getUserAlbumReviewById,
  getUserAlbumReviewByUser,
  getUserAlbumReviews,
  insertAlbum,
  insertCriticAlbumReview,
  insertCriticAlbumReviewLike,
  insertGenre,
  insertSong,
  insertUserAlbumReview,
  insertUserAlbumReviewLike,
  isCriticAlbumReviewLiked,
  isUserAlbumReviewLiked,
  linkAlbumGenre,
  setUserAlbumReviewLiked,
  updateCriticAlbumReview as updateCriticAlbumReviewQuery,
  updateUserAlbumReview,
} from "@/db/queries/albums.queries";
import { getUserPreferences } from "@/db/queries/users.queries";
import type {
  AlbumDetails,
  AlbumReviewPage,
  AlbumScore,
  CriticAlbumReview,
  ExistingAlbumReview,
  UserAlbumReview,
  ViewerRole,
} from "@/features/album/album.types";
import { auth } from "@/lib/auth";
import { getSpotifyAlbum } from "@/lib/spotify";

const REVIEW_PAGE_SIZE = 3;

const spotifyIdSchema = z.string().trim().min(1).max(64);
const albumIdentifierSchema = z.string().trim().min(1).max(64);
const reviewIdSchema = z.string().trim().min(1).max(64);
const pageSchema = z.coerce.number().int().min(1);

const userReviewSchema = z.object({
  ocena: z.number().int().min(0).max(10).nullable(),
  liked: z.boolean(),
  description: z.string().max(2000).nullable(),
});

const criticReviewSchema = z.object({
  naslov: z.string().trim().min(1).max(128),
  ocena: z.number().int().min(0).max(10),
  tekstKritike: z.string().trim().min(1),
  zakljucak: z.string().trim().min(1).max(255),
});

export type AlbumActionResult<T = null> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

type SessionContext = {
  userId: string;
  role: ViewerRole;
};

function ok<T>(data: T): AlbumActionResult<T> {
  return {
    success: true,
    data,
  };
}

function fail<T>(error: string): AlbumActionResult<T> {
  return {
    success: false,
    error,
  };
}

function normalizeNullableString(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function getReleaseYearFromDate(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const year = Number.parseInt(value.slice(0, 4), 10);

  if (Number.isNaN(year)) {
    return fallback;
  }

  return year;
}

function getAlbumPath(spotifyId: string): string {
  return `/album/${spotifyId}`;
}

async function resolveAlbumRecord(
  albumIdentifier: string,
): Promise<{
  id: string;
  name: string;
  spotifyId: string;
  releaseYear: number;
} | null> {
  const albumById = await getAlbumById(albumIdentifier);

  if (albumById) {
    return albumById;
  }

  return getAlbumBySpotifyId(albumIdentifier);
}

async function getSessionContext(): Promise<SessionContext | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const preferences = await getUserPreferences(session.user.id);

  return {
    userId: session.user.id,
    role: preferences?.role ?? "user",
  };
}

async function requireSessionContext(): Promise<SessionContext> {
  const context = await getSessionContext();

  if (!context) {
    throw new Error("Unauthorized");
  }

  return context;
}

async function revalidateAlbumPathByAlbumId(albumIdentifier: string): Promise<void> {
  const albumRecord = await resolveAlbumRecord(albumIdentifier);

  if (!albumRecord) {
    return;
  }

  revalidatePath(getAlbumPath(albumRecord.spotifyId));
}

export async function getAlbumDetails(spotifyId: string): Promise<AlbumDetails> {
  const parsedSpotifyId = spotifyIdSchema.parse(spotifyId);

  let localAlbum = await getAlbumBySpotifyId(parsedSpotifyId);
  const spotifyAlbum = await getSpotifyAlbum(parsedSpotifyId);

  if (!localAlbum) {
    if (!spotifyAlbum) {
      throw new Error("Album not found.");
    }

    localAlbum = await insertAlbum({
      name: spotifyAlbum.name,
      releaseYear: getReleaseYearFromDate(spotifyAlbum.release_date, 0),
      spotifyId: parsedSpotifyId,
    });
  }

  if (spotifyAlbum) {
    localAlbum = await insertAlbum({
      name: spotifyAlbum.name,
      releaseYear: getReleaseYearFromDate(
        spotifyAlbum.release_date,
        localAlbum.releaseYear,
      ),
      spotifyId: parsedSpotifyId,
    });

    for (const track of spotifyAlbum.tracks?.items ?? []) {
      if (!track.id) {
        continue;
      }

      const existingSong = await getSongBySpotifyId(track.id);

      if (existingSong) {
        continue;
      }

      await insertSong({
        albumId: localAlbum.id,
        name: track.name,
        spotifyId: track.id,
      });
    }

    const uniqueGenres = Array.from(
      new Set(
        (spotifyAlbum.genres ?? [])
          .map((genreName) => genreName.trim())
          .filter(Boolean),
      ),
    );

    for (const genreName of uniqueGenres) {
      const persistedGenre = await insertGenre(genreName);

      await linkAlbumGenre(localAlbum.id, persistedGenre.id);
    }
  }

  const localTracks = await getSongsByAlbum(localAlbum.id);
  const localGenres = await getAlbumGenres(localAlbum.id);

  return {
    id: localAlbum.id,
    spotifyId: localAlbum.spotifyId,
    name: spotifyAlbum?.name ?? localAlbum.name,
    releaseYear: spotifyAlbum
      ? getReleaseYearFromDate(spotifyAlbum.release_date, localAlbum.releaseYear)
      : localAlbum.releaseYear,
    artists: (spotifyAlbum?.artists ?? []).map((artist) => artist.name),
    imageUrl: spotifyAlbum?.images?.[0]?.url ?? null,
    genres:
      (spotifyAlbum?.genres ?? []).filter(Boolean).length > 0
        ? (spotifyAlbum?.genres ?? []).filter(Boolean)
        : localGenres,
    tracks:
      (spotifyAlbum?.tracks?.items ?? []).length > 0
        ? (spotifyAlbum?.tracks?.items ?? []).map((track) => ({
            id: track.id,
            spotifyId: track.id,
            name: track.name,
            durationMs: track.duration_ms,
            trackNumber: track.track_number,
          }))
        : localTracks.map((track, index) => ({
            id: track.id,
            spotifyId: track.spotifyId,
            name: track.name,
            durationMs: 0,
            trackNumber: index + 1,
          })),
  };
}

export async function getUserReviews(
  albumId: string,
  page: number,
): Promise<AlbumReviewPage<UserAlbumReview>> {
  const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);
  const parsedPage = pageSchema.parse(page);

  const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

  if (!albumRecord) {
    throw new Error("Album not found.");
  }

  const sessionContext = await getSessionContext();

  const reviewPage = await getUserAlbumReviews(
    albumRecord.id,
    parsedPage,
    REVIEW_PAGE_SIZE,
    sessionContext?.userId ?? null,
  );

  return {
    items: reviewPage.items,
    page: reviewPage.page,
    pageSize: reviewPage.pageSize,
    totalCount: reviewPage.totalCount,
    totalPages: reviewPage.totalPages,
  };
}

export async function getCriticReviews(
  albumId: string,
  page: number,
): Promise<AlbumReviewPage<CriticAlbumReview>> {
  const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);
  const parsedPage = pageSchema.parse(page);

  const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

  if (!albumRecord) {
    throw new Error("Album not found.");
  }

  const sessionContext = await getSessionContext();

  const reviewPage = await getCriticAlbumReviews(
    albumRecord.id,
    parsedPage,
    REVIEW_PAGE_SIZE,
    sessionContext?.userId ?? null,
  );

  return {
    items: reviewPage.items,
    page: reviewPage.page,
    pageSize: reviewPage.pageSize,
    totalCount: reviewPage.totalCount,
    totalPages: reviewPage.totalPages,
  };
}

export async function getUserScore(albumId: string): Promise<AlbumScore> {
  const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);
  const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

  if (!albumRecord) {
    throw new Error("Album not found.");
  }

  return getAvgUserAlbumScore(albumRecord.id);
}

export async function getCriticScore(albumId: string): Promise<AlbumScore> {
  const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);
  const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

  if (!albumRecord) {
    throw new Error("Album not found.");
  }

  return getAvgCriticAlbumScore(albumRecord.id);
}

export async function getExistingReview(
  albumId: string,
  userId: string,
): Promise<ExistingAlbumReview> {
  const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);

  const sessionContext = await requireSessionContext();

  if (sessionContext.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

  if (!albumRecord) {
    throw new Error("Album not found.");
  }

  if (sessionContext.role === "critic") {
    const criticReview = await getCriticAlbumReviewByUser(
      albumRecord.id,
      sessionContext.userId,
    );

    return {
      role: sessionContext.role,
      userReview: null,
      criticReview,
    };
  }

  const userReview = await getUserAlbumReviewByUser(
    albumRecord.id,
    sessionContext.userId,
  );

  return {
    role: sessionContext.role,
    userReview,
    criticReview: null,
  };
}

export async function createAlbumReview(
  albumId: string,
  ocena: number | null,
  liked: boolean,
  description: string | null,
): Promise<AlbumActionResult<null>> {
  try {
    const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);
    const parsedInput = userReviewSchema.parse({
      ocena,
      liked,
      description: normalizeNullableString(description),
    });

    const context = await requireSessionContext();

    if (context.role === "critic") {
      return fail("Critics cannot create user reviews.");
    }

    const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

    if (!albumRecord) {
      return fail("Album not found.");
    }

    const existingReview = await getUserAlbumReviewByUser(
      albumRecord.id,
      context.userId,
    );

    if (existingReview) {
      return fail("You already have a review for this album.");
    }

    await insertUserAlbumReview({
      albumId: albumRecord.id,
      userId: context.userId,
      ocena: parsedInput.ocena,
      liked: parsedInput.liked,
      description: parsedInput.description,
    });

    revalidatePath(getAlbumPath(albumRecord.spotifyId));

    return ok(null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid review input.");
    }

    return fail("Failed to create album review.");
  }
}

export async function updateAlbumReview(
  reviewId: string,
  ocena: number | null,
  liked: boolean,
  description: string | null,
): Promise<AlbumActionResult<null>> {
  try {
    const parsedReviewId = reviewIdSchema.parse(reviewId);
    const parsedInput = userReviewSchema.parse({
      ocena,
      liked,
      description: normalizeNullableString(description),
    });

    const context = await requireSessionContext();
    const review = await getUserAlbumReviewById(parsedReviewId);

    if (!review) {
      return fail("Review not found.");
    }

    if (review.userId !== context.userId) {
      return fail("Only the review author can update this review.");
    }

    await updateUserAlbumReview(parsedReviewId, {
      ocena: parsedInput.ocena,
      liked: parsedInput.liked,
      description: parsedInput.description,
    });

    await revalidateAlbumPathByAlbumId(review.albumId);

    return ok(null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid review input.");
    }

    return fail("Failed to update album review.");
  }
}

export async function deleteAlbumReview(
  reviewId: string,
): Promise<AlbumActionResult<null>> {
  try {
    const parsedReviewId = reviewIdSchema.parse(reviewId);

    const context = await requireSessionContext();
    const review = await getUserAlbumReviewById(parsedReviewId);

    if (!review) {
      return fail("Review not found.");
    }

    if (review.userId !== context.userId) {
      return fail("Only the review author can delete this review.");
    }

    await deleteUserAlbumReview(parsedReviewId);
    await revalidateAlbumPathByAlbumId(review.albumId);

    return ok(null);
  } catch {
    return fail("Failed to delete album review.");
  }
}

export async function createCriticAlbumReview(
  albumId: string,
  naslov: string,
  ocena: number,
  tekstKritike: string,
  zakljucak: string | null,
): Promise<AlbumActionResult<null>> {
  try {
    const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);
    const parsedInput = criticReviewSchema.parse({
      naslov,
      ocena,
      tekstKritike,
      zakljucak: normalizeNullableString(zakljucak) ?? "",
    });

    const context = await requireSessionContext();

    if (context.role !== "critic") {
      return fail("Only critics can create professional album reviews.");
    }

    const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

    if (!albumRecord) {
      return fail("Album not found.");
    }

    const existingReview = await getCriticAlbumReviewByUser(
      albumRecord.id,
      context.userId,
    );

    if (existingReview) {
      return fail("You already have a critic review for this album.");
    }

    await insertCriticAlbumReview({
      albumId: albumRecord.id,
      userId: context.userId,
      naslov: parsedInput.naslov,
      ocena: parsedInput.ocena,
      tekstKritike: parsedInput.tekstKritike,
      zakljucak: parsedInput.zakljucak,
    });

    revalidatePath(getAlbumPath(albumRecord.spotifyId));

    return ok(null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid critic review input.");
    }

    return fail("Failed to create critic review.");
  }
}

export async function updateCriticAlbumReview(
  reviewId: string,
  naslov: string,
  ocena: number,
  tekstKritike: string,
  zakljucak: string | null,
): Promise<AlbumActionResult<null>> {
  try {
    const parsedReviewId = reviewIdSchema.parse(reviewId);
    const parsedInput = criticReviewSchema.parse({
      naslov,
      ocena,
      tekstKritike,
      zakljucak: normalizeNullableString(zakljucak) ?? "",
    });

    const context = await requireSessionContext();

    if (context.role !== "critic") {
      return fail("Only critics can update professional reviews.");
    }

    const review = await getCriticAlbumReviewById(parsedReviewId);

    if (!review) {
      return fail("Critic review not found.");
    }

    if (review.userId !== context.userId) {
      return fail("Only the review author can update this critic review.");
    }

    await updateCriticAlbumReviewQuery(parsedReviewId, {
      naslov: parsedInput.naslov,
      ocena: parsedInput.ocena,
      tekstKritike: parsedInput.tekstKritike,
      zakljucak: parsedInput.zakljucak,
    });

    await revalidateAlbumPathByAlbumId(review.albumId);

    return ok(null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid critic review input.");
    }

    return fail("Failed to update critic review.");
  }
}

export async function deleteCriticAlbumReview(
  reviewId: string,
): Promise<AlbumActionResult<null>> {
  try {
    const parsedReviewId = reviewIdSchema.parse(reviewId);

    const context = await requireSessionContext();
    const review = await getCriticAlbumReviewById(parsedReviewId);

    if (!review) {
      return fail("Critic review not found.");
    }

    if (review.userId !== context.userId) {
      return fail("Only the review author can delete this critic review.");
    }

    await deleteCriticAlbumReviewQuery(parsedReviewId);
    await revalidateAlbumPathByAlbumId(review.albumId);

    return ok(null);
  } catch {
    return fail("Failed to delete critic review.");
  }
}

export async function toggleAlbumLike(
  albumId: string,
): Promise<AlbumActionResult<{ liked: boolean }>> {
  try {
    const parsedAlbumIdentifier = albumIdentifierSchema.parse(albumId);

    const context = await requireSessionContext();
    const albumRecord = await resolveAlbumRecord(parsedAlbumIdentifier);

    if (!albumRecord) {
      return fail("Album not found.");
    }

    const review = await getUserAlbumReviewByUser(albumRecord.id, context.userId);

    if (!review) {
      return fail("Create your own album review first to like this album.");
    }

    const nextLikedState = !review.liked;

    await setUserAlbumReviewLiked(review.id, nextLikedState);

    await revalidateAlbumPathByAlbumId(albumRecord.id);

    return ok({ liked: nextLikedState });
  } catch {
    return fail("Failed to toggle album like.");
  }
}

export async function toggleAlbumReviewLike(
  reviewId: string,
): Promise<AlbumActionResult<{ liked: boolean }>> {
  try {
    const parsedReviewId = reviewIdSchema.parse(reviewId);

    const context = await requireSessionContext();
    const review = await getUserAlbumReviewById(parsedReviewId);

    if (!review) {
      return fail("Review not found.");
    }

    const isLiked = await isUserAlbumReviewLiked(parsedReviewId, context.userId);

    if (isLiked) {
      await deleteUserAlbumReviewLike(parsedReviewId, context.userId);
    } else {
      await insertUserAlbumReviewLike(parsedReviewId, context.userId);
    }

    await revalidateAlbumPathByAlbumId(review.albumId);

    return ok({ liked: !isLiked });
  } catch {
    return fail("Failed to toggle review like.");
  }
}

export async function toggleCriticAlbumReviewLike(
  reviewId: string,
): Promise<AlbumActionResult<{ liked: boolean }>> {
  try {
    const parsedReviewId = reviewIdSchema.parse(reviewId);

    const context = await requireSessionContext();
    const review = await getCriticAlbumReviewById(parsedReviewId);

    if (!review) {
      return fail("Critic review not found.");
    }

    const isLiked = await isCriticAlbumReviewLiked(parsedReviewId, context.userId);

    if (isLiked) {
      await deleteCriticAlbumReviewLike(parsedReviewId, context.userId);
    } else {
      await insertCriticAlbumReviewLike(parsedReviewId, context.userId);
    }

    await revalidateAlbumPathByAlbumId(review.albumId);

    return ok({ liked: !isLiked });
  } catch {
    return fail("Failed to toggle critic review like.");
  }
}
