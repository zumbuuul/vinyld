"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import {
  getAlbumBySpotifyId,
  getGenreByName,
  getSongBySpotifyId,
  insertAlbum,
  insertGenre,
  insertSong,
  linkAlbumGenre,
} from "@/db/queries/albums.queries";
import {
  getStoriesByUser,
  getTopStoriesByUser,
  getTotalStoriesByUser,
  getStoryById,
  insertStory,
  insertStorySong,
  isSongInStory,
  updateStoryDetails,
} from "@/db/queries/stories.queries";
import { getUserById } from "@/db/queries/users.queries";
import type { UserStoryListItem } from "@/features/album/album.types";
import { auth } from "@/lib/auth";
import { getSpotifyAlbum, getSpotifyTrack } from "@/lib/spotify";

const storyIdSchema = z.string().trim().min(1).max(64);
const spotifyIdSchema = z.string().trim().min(1).max(64);
const userIdSchema = z.string().trim().min(1);
const pageSchema = z.coerce.number().int().min(1);
const updateStoryInputSchema = z.object({
  userId: z.string().trim().min(1),
  storyId: z.string().trim().min(1),
  name: z.string().trim().min(1, "Story title is required").max(64),
  description: z.string().trim().max(500).optional().default(""),
});

export type StoryActionResult<T = null> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

function ok<T>(data: T): StoryActionResult<T> {
  return {
    success: true,
    data,
  };
}

function fail<T>(error: string): StoryActionResult<T> {
  return {
    success: false,
    error,
  };
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

async function requireSessionUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

async function ensureSongExists(spotifyId: string): Promise<{ id: string }> {
  const existingSong = await getSongBySpotifyId(spotifyId);

  if (existingSong) {
    return { id: existingSong.id };
  }

  const spotifyTrack = await getSpotifyTrack(spotifyId);

  if (!spotifyTrack) {
    throw new Error("Song not found on Spotify.");
  }

  let albumRecord = await getAlbumBySpotifyId(spotifyTrack.album.id);
  const spotifyAlbum = await getSpotifyAlbum(spotifyTrack.album.id);

  if (!albumRecord) {
    if (!spotifyAlbum) {
      albumRecord = await insertAlbum({
        name: spotifyTrack.album.name,
        releaseYear: 0,
        spotifyId: spotifyTrack.album.id,
      });
    } else {
      albumRecord = await insertAlbum({
        name: spotifyAlbum.name,
        releaseYear: getReleaseYearFromDate(spotifyAlbum.release_date, 0),
        spotifyId: spotifyTrack.album.id,
      });
    }
  }

  if (spotifyAlbum) {
    for (const track of spotifyAlbum.tracks?.items ?? []) {
      if (!track.id) {
        continue;
      }

      const existingTrack = await getSongBySpotifyId(track.id);

      if (existingTrack) {
        continue;
      }

      await insertSong({
        albumId: albumRecord.id,
        name: track.name,
        spotifyId: track.id,
      });
    }

    for (const genreName of spotifyAlbum.genres ?? []) {
      const trimmed = genreName.trim();

      if (!trimmed) {
        continue;
      }

      const existingGenre = await getGenreByName(trimmed);
      const genreRecord = existingGenre ?? (await insertGenre(trimmed));

      await linkAlbumGenre(albumRecord.id, genreRecord.id);
    }
  } else {
    await insertSong({
      albumId: albumRecord.id,
      name: spotifyTrack.name,
      spotifyId: spotifyTrack.id,
    });
  }

  const resolvedSong = await getSongBySpotifyId(spotifyId);

  if (!resolvedSong) {
    throw new Error("Failed to persist song.");
  }

  return { id: resolvedSong.id };
}

export async function getUserStories(
  userId: string,
  page: number,
): Promise<UserStoryListItem[]> {
  const parsedUserId = userIdSchema.parse(userId);
  const parsedPage = pageSchema.parse(page);
  const userRecord = await getUserById(parsedUserId);

  if (!userRecord) {
    throw new Error("User not found.");
  }

  const stories = await getStoriesByUser(parsedUserId, parsedPage, 5);

  return stories.map((story) => ({
    id: story.id,
    name: story.name,
    imageUrl: story.imageUrl,
    songCount: story.songCount,
    likeCount: story.likeCount,
  }));
}

export async function getTotalStories(userId: string): Promise<number> {
  const parsedUserId = userIdSchema.parse(userId);
  const userRecord = await getUserById(parsedUserId);

  if (!userRecord) {
    throw new Error("User not found.");
  }

  return getTotalStoriesByUser(parsedUserId);
}

export async function getTopStories(
  userId: string,
  limit = 3,
): Promise<UserStoryListItem[]> {
  const parsedUserId = userIdSchema.parse(userId);
  const userRecord = await getUserById(parsedUserId);

  if (!userRecord) {
    throw new Error("User not found.");
  }

  const stories = await getTopStoriesByUser(parsedUserId, limit);

  return stories.map((story) => ({
    id: story.id,
    name: story.name,
    imageUrl: story.imageUrl,
    songCount: story.songCount,
    likeCount: story.likeCount,
  }));
}

export async function beginNewStory(): Promise<{ storyId: string; userId: string }> {
  const sessionUserId = await requireSessionUserId();
  const createdStory = await insertStory(sessionUserId, {
    name: "Untitled Story",
    imageUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231c1b1b'/%3E%3Ccircle cx='200' cy='200' r='94' fill='%23ffb59e' fill-opacity='0.16'/%3E%3Ccircle cx='200' cy='200' r='44' fill='%23ff5717' fill-opacity='0.7'/%3E%3C/svg%3E",
  });

  revalidatePath(`/user/${sessionUserId}/stories`);

  return {
    storyId: createdStory.id,
    userId: sessionUserId,
  };
}

export async function updateStory(input: {
  userId: string;
  storyId: string;
  name: string;
  description: string;
}): Promise<{ success: true }> {
  const parsed = updateStoryInputSchema.parse(input);
  const sessionUserId = await requireSessionUserId();

  if (sessionUserId !== parsed.userId) {
    throw new Error("Unauthorized");
  }

  const storyRecord = await getStoryById(parsed.storyId);

  if (!storyRecord) {
    throw new Error("Story not found.");
  }

  if (storyRecord.userId !== sessionUserId) {
    throw new Error("Only the playlist owner can update this story.");
  }

  await updateStoryDetails(parsed.storyId, {
    name: parsed.name,
    description: parsed.description.trim() || null,
  });

  revalidatePath(`/user/${parsed.userId}/stories`);
  revalidatePath(`/user/${parsed.userId}/stories/${parsed.storyId}`);

  return { success: true };
}

export async function addSongToStory(
  storyId: string,
  spotifyId: string,
): Promise<StoryActionResult<null>> {
  try {
    const parsedStoryId = storyIdSchema.parse(storyId);
    const parsedSpotifyId = spotifyIdSchema.parse(spotifyId);

    const sessionUserId = await requireSessionUserId();
    const storyRecord = await getStoryById(parsedStoryId);

    if (!storyRecord) {
      return fail("Playlist not found.");
    }

    if (storyRecord.userId !== sessionUserId) {
      return fail("Only the playlist owner can add songs.");
    }

    const songRecord = await ensureSongExists(parsedSpotifyId);
    const alreadyInStory = await isSongInStory(parsedStoryId, songRecord.id);

    if (alreadyInStory) {
      return fail("Song is already in this playlist.");
    }

    await insertStorySong(parsedStoryId, songRecord.id);

    revalidatePath(`/story/${parsedStoryId}`);

    return ok(null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid playlist action input.");
    }

    return fail("Failed to add song to playlist.");
  }
}
