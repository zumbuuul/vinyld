import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import { album, song, story, storyLikes, storySongs } from "@/db/schema";

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

export interface StorySongListItem {
  id: string;
  spotifyId: string;
  name: string;
  artistDisplayName: string | null;
  durationMs: number | null;
  trackNumber: number | null;
  discNumber: number;
  albumName: string;
  albumImageUrl: string | null;
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

export async function deleteStorySong(
  storyId: string,
  songId: string,
): Promise<void> {
  await db
    .delete(storySongs)
    .where(and(eq(storySongs.storyId, storyId), eq(storySongs.songId, songId)));
}

export async function deleteStory(storyId: string): Promise<void> {
  await db.delete(story).where(eq(story.id, storyId));
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

export async function getSongsForStory(
  storyId: string,
): Promise<StorySongListItem[]> {
  const rows = await db
    .select({
      id: song.id,
      spotifyId: song.spotifyId,
      name: song.name,
      artistDisplayName: song.artistDisplayName,
      durationMs: song.durationMs,
      trackNumber: song.trackNumber,
      discNumber: song.discNumber,
      albumName: album.name,
      albumImageUrl: album.imageUrl,
      dateAdded: storySongs.dateAdded,
    })
    .from(storySongs)
    .innerJoin(song, eq(song.id, storySongs.songId))
    .innerJoin(album, eq(album.id, song.albumId))
    .where(eq(storySongs.storyId, storyId))
    .orderBy(desc(storySongs.dateAdded), asc(song.discNumber), asc(song.trackNumber));

  return rows.map((row) => ({
    id: String(row.id),
    spotifyId: String(row.spotifyId),
    name: String(row.name),
    artistDisplayName: row.artistDisplayName
      ? String(row.artistDisplayName)
      : null,
    durationMs: row.durationMs ?? null,
    trackNumber: row.trackNumber ?? null,
    discNumber: Number(row.discNumber),
    albumName: String(row.albumName),
    albumImageUrl: row.albumImageUrl ? String(row.albumImageUrl) : null,
  }));
}
