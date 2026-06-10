"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import {
  deleteStoryLike,
  deleteStory,
  deleteStorySong,
  getStoriesByUser,
  getSongsForStory,
  isStoryLikedByUser,
  getTopStoriesByUser,
  getTotalStoriesByUser,
  getStoryById,
  insertStoryLike,
  insertStory,
  insertStorySong,
  isSongInStory,
  updateStoryDetails,
} from "@/db/queries/stories.queries";
import { getUserById } from "@/db/queries/users.queries";
import type { UserStoryListItem } from "@/features/album/album.types";
import { auth } from "@/lib/auth";

const storyIdSchema = z.string().trim().min(1).max(64);
const songIdSchema = z.string().trim().min(1);
const userIdSchema = z.string().trim().min(1);
const pageSchema = z.coerce.number().int().min(1);
const updateStoryInputSchema = z.object({
  userId: z.string().trim().min(1),
  storyId: z.string().trim().min(1),
  name: z.string().trim().min(1, "Story title is required").max(64),
  description: z.string().trim().max(500).optional().default(""),
  imageUrl: z.string().trim().url().max(2048).optional().nullable(),
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

async function requireSessionUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
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

export async function getOwnStoriesForSelection(): Promise<UserStoryListItem[]> {
  const sessionUserId = await requireSessionUserId();
  const stories = await getStoriesByUser(sessionUserId, 1, 100);

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
  imageUrl?: string | null;
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
    imageUrl: parsed.imageUrl?.trim() || undefined,
  });

  revalidatePath(`/user/${parsed.userId}/stories`);
  revalidatePath(`/user/${parsed.userId}/stories/${parsed.storyId}`);

  return { success: true };
}

export async function addSongToStory(
  storyId: string,
  songId: string,
): Promise<StoryActionResult<null>> {
  try {
    const parsedStoryId = storyIdSchema.parse(storyId);
    const parsedSongId = songIdSchema.parse(songId);

    const sessionUserId = await requireSessionUserId();
    const storyRecord = await getStoryById(parsedStoryId);

    if (!storyRecord) {
      return fail("Playlist not found.");
    }

    if (storyRecord.userId !== sessionUserId) {
      return fail("Only the playlist owner can add songs.");
    }

    const alreadyInStory = await isSongInStory(parsedStoryId, parsedSongId);

    if (alreadyInStory) {
      return fail("Song is already in this playlist.");
    }

    await insertStorySong(parsedStoryId, parsedSongId);

    revalidatePath(`/user/${sessionUserId}/stories/${parsedStoryId}`);
    revalidatePath(`/user/${sessionUserId}/stories`);

    return ok(null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid playlist action input.");
    }

    return fail("Failed to add song to playlist.");
  }
}

export async function getStorySongs(storyId: string) {
  const parsedStoryId = storyIdSchema.parse(storyId);
  const storyRecord = await getStoryById(parsedStoryId);

  if (!storyRecord) {
    throw new Error("Story not found.");
  }

  return getSongsForStory(parsedStoryId);
}

export async function toggleStoryLike(
  storyId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const parsedStoryId = storyIdSchema.parse(storyId);
  const sessionUserId = await requireSessionUserId();
  const storyRecord = await getStoryById(parsedStoryId);

  if (!storyRecord) {
    throw new Error("Story not found.");
  }

  const alreadyLiked = await isStoryLikedByUser(parsedStoryId, sessionUserId);

  if (alreadyLiked) {
    await deleteStoryLike(parsedStoryId, sessionUserId);
  } else {
    await insertStoryLike(parsedStoryId, sessionUserId);
  }

  const refreshedStory = await getStoryById(parsedStoryId);

  if (!refreshedStory) {
    throw new Error("Story not found.");
  }

  revalidatePath(`/user/${storyRecord.userId}/stories/${parsedStoryId}`);
  revalidatePath(`/user/${storyRecord.userId}/stories`);
  revalidatePath(`/user/${storyRecord.userId}`);
  revalidatePath("/");

  return {
    liked: !alreadyLiked,
    likeCount: refreshedStory.likeCount,
  };
}

export async function removeSongFromStory(
  storyId: string,
  songId: string,
): Promise<StoryActionResult<null>> {
  try {
    const parsedStoryId = storyIdSchema.parse(storyId);
    const parsedSongId = z.string().trim().min(1).parse(songId);
    const sessionUserId = await requireSessionUserId();
    const storyRecord = await getStoryById(parsedStoryId);

    if (!storyRecord) {
      return fail("Playlist not found.");
    }

    if (storyRecord.userId !== sessionUserId) {
      return fail("Only the playlist owner can remove songs.");
    }

    await deleteStorySong(parsedStoryId, parsedSongId);

    revalidatePath(`/user/${sessionUserId}/stories/${parsedStoryId}`);
    revalidatePath(`/user/${sessionUserId}/stories`);

    return ok(null);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid playlist action input.");
    }

    return fail("Failed to remove song from playlist.");
  }
}

export async function deleteStoryAction(
  userId: string,
  storyId: string,
): Promise<{ success: true }> {
  const parsedUserId = userIdSchema.parse(userId);
  const parsedStoryId = storyIdSchema.parse(storyId);
  const sessionUserId = await requireSessionUserId();

  if (sessionUserId !== parsedUserId) {
    throw new Error("Unauthorized");
  }

  const storyRecord = await getStoryById(parsedStoryId);

  if (!storyRecord) {
    throw new Error("Story not found.");
  }

  if (storyRecord.userId !== sessionUserId) {
    throw new Error("Only the playlist owner can delete this story.");
  }

  await deleteStory(parsedStoryId);

  revalidatePath(`/user/${parsedUserId}/stories`);
  revalidatePath(`/user/${parsedUserId}`);

  return { success: true };
}
