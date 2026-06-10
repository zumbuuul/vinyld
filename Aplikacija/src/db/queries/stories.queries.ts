import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import { story, storyLikes, storySongs } from "@/db/schema";

export interface StoryListItem {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  songCount: number;
  likeCount: number;
  description: string | null;
  dateCreated: string;
}

export async function getStoriesByUser(
  userId: string,
  page = 1,
  pageSize = 50,
): Promise<StoryListItem[]> {
  const resolvedPage = Math.max(1, page);
  const resolvedPageSize = Math.max(1, pageSize);
  const offset = (resolvedPage - 1) * resolvedPageSize;

  const rows = await db
    .select({
      id: story.id,
      userId: story.userId,
      name: story.name,
      imageUrl: story.image,
      description: story.description,
      dateCreated: story.dateCreated,
      songCount: sql<number>`count(distinct ${storySongs.id})::int`,
      likeCount: sql<number>`count(distinct ${storyLikes.id})::int`,
    })
    .from(story)
    .leftJoin(storySongs, eq(storySongs.storyId, story.id))
    .leftJoin(storyLikes, eq(storyLikes.storyId, story.id))
    .where(eq(story.userId, userId))
    .groupBy(
      story.id,
      story.userId,
      story.name,
      story.image,
      story.description,
      story.dateCreated,
    )
    .orderBy(desc(story.dateCreated), asc(story.name))
    .limit(resolvedPageSize)
    .offset(offset);

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.userId),
    name: String(row.name),
    imageUrl: String(row.imageUrl),
    songCount: Number(row.songCount ?? 0),
    likeCount: Number(row.likeCount ?? 0),
    description: row.description ? String(row.description) : null,
    dateCreated: String(row.dateCreated),
  }));
}

export async function getTopStoriesByUser(
  userId: string,
  limit = 3,
): Promise<StoryListItem[]> {
  const resolvedLimit = Math.max(1, limit);

  const rows = await db
    .select({
      id: story.id,
      userId: story.userId,
      name: story.name,
      imageUrl: story.image,
      description: story.description,
      dateCreated: story.dateCreated,
      songCount: sql<number>`count(distinct ${storySongs.id})::int`,
      likeCount: sql<number>`count(distinct ${storyLikes.id})::int`,
    })
    .from(story)
    .leftJoin(storySongs, eq(storySongs.storyId, story.id))
    .leftJoin(storyLikes, eq(storyLikes.storyId, story.id))
    .where(eq(story.userId, userId))
    .groupBy(
      story.id,
      story.userId,
      story.name,
      story.image,
      story.description,
      story.dateCreated,
    )
    .orderBy(desc(sql<number>`count(distinct ${storyLikes.id})::int`), desc(story.dateCreated), asc(story.name))
    .limit(resolvedLimit);

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.userId),
    name: String(row.name),
    imageUrl: String(row.imageUrl),
    songCount: Number(row.songCount ?? 0),
    likeCount: Number(row.likeCount ?? 0),
    description: row.description ? String(row.description) : null,
    dateCreated: String(row.dateCreated),
  }));
}

export async function getTotalStoriesByUser(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(story)
    .where(eq(story.userId, userId));

  return Number(row?.count ?? 0);
}

export async function getStoryById(storyId: string): Promise<StoryListItem | null> {
  const [row] = await db
    .select({
      id: story.id,
      userId: story.userId,
      name: story.name,
      imageUrl: story.image,
      description: story.description,
      dateCreated: story.dateCreated,
      songCount: sql<number>`count(distinct ${storySongs.id})::int`,
      likeCount: sql<number>`count(distinct ${storyLikes.id})::int`,
    })
    .from(story)
    .leftJoin(storySongs, eq(storySongs.storyId, story.id))
    .leftJoin(storyLikes, eq(storyLikes.storyId, story.id))
    .where(eq(story.id, storyId))
    .groupBy(
      story.id,
      story.userId,
      story.name,
      story.image,
      story.description,
      story.dateCreated,
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    userId: String(row.userId),
    name: String(row.name),
    imageUrl: String(row.imageUrl),
    songCount: Number(row.songCount ?? 0),
    likeCount: Number(row.likeCount ?? 0),
    description: row.description ? String(row.description) : null,
    dateCreated: String(row.dateCreated),
  };
}

export async function isSongInStory(
  storyId: string,
  songId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: storySongs.id })
    .from(storySongs)
    .where(and(eq(storySongs.storyId, storyId), eq(storySongs.songId, songId)))
    .limit(1);

  return Boolean(row);
}

export async function insertStorySong(
  storyId: string,
  songId: string,
): Promise<void> {
  await db.insert(storySongs).values({ storyId, songId });
}

export async function insertStory(
  userId: string,
  values?: {
    name?: string;
    imageUrl?: string;
    description?: string | null;
  },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(story)
    .values({
      userId,
      name: values?.name ?? "Untitled Story",
      image: values?.imageUrl ?? "/images/story-placeholder.png",
      description: values?.description ?? null,
    })
    .returning({ id: story.id });

  return {
    id: String(row.id),
  };
}

export async function updateStoryDetails(
  storyId: string,
  values: {
    name: string;
    description: string | null;
  },
): Promise<void> {
  await db
    .update(story)
    .set({
      name: values.name,
      description: values.description,
    })
    .where(eq(story.id, storyId));
}

export async function getStorySongCount(storyId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storySongs)
    .where(eq(storySongs.storyId, storyId));

  return Number(row?.count ?? 0);
}
