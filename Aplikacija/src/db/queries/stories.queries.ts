import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import { story, storySongs } from "@/db/schema";

export interface StoryListItem {
  id: string;
  userId: string;
  name: string;
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
    })
    .from(story)
    .where(eq(story.userId, userId))
    .orderBy(desc(story.dateCreated), asc(story.name))
    .limit(resolvedPageSize)
    .offset(offset);

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.userId),
    name: String(row.name),
  }));
}

export async function getStoryById(storyId: string): Promise<StoryListItem | null> {
  const [row] = await db
    .select({
      id: story.id,
      userId: story.userId,
      name: story.name,
    })
    .from(story)
    .where(eq(story.id, storyId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    userId: String(row.userId),
    name: String(row.name),
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

export async function getStorySongCount(storyId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storySongs)
    .where(eq(storySongs.storyId, storyId));

  return Number(row?.count ?? 0);
}
