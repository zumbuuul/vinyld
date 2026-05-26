import { desc, sql } from "drizzle-orm";

import type { RawHomeActivity, RawHomeAlbum } from "./types";

type DbModule = typeof import("@/db/db");
type SchemaModule = typeof import("@/db/schema");

interface DbRuntime {
  db: DbModule["db"];
  schema: SchemaModule;
}

async function loadDbRuntime(): Promise<DbRuntime | null> {
  if (!process.env.DB_URL) {
    return null;
  }

  try {
    const [{ db }, schema] = await Promise.all([
      import("@/db/db"),
      import("@/db/schema"),
    ]);

    return { db, schema };
  } catch {
    return null;
  }
}

export async function queryFeaturedAlbums(): Promise<RawHomeAlbum[]> {
  const runtime = await loadDbRuntime();

  if (!runtime) {
    return [];
  }

  const { db, schema } = runtime;
  const album = schema.album;
  const userAlbumReview = schema.userAlbumReview;

  const rows = await db
    .select({
      id: album.id,
      title: album.name,
      spotifyId: album.spotifyId,
      averageRating10: sql<number>`coalesce(avg(${userAlbumReview.ocena}), 0)`,
    })
    .from(album)
    .leftJoin(userAlbumReview, sql`${userAlbumReview.albumId} = ${album.id}`)
    .groupBy(album.id, album.name, album.spotifyId)
    .orderBy(desc(sql`coalesce(avg(${userAlbumReview.ocena}), 0)`))
    .limit(4);

  return rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    artist: "Unknown Artist",
    spotifyId: String(row.spotifyId),
    averageRating10: Number(row.averageRating10 ?? 0),
  }));
}

export async function queryRecentActivity(): Promise<RawHomeActivity[]> {
  const runtime = await loadDbRuntime();

  if (!runtime) {
    return [];
  }

  const { db, schema } = runtime;
  const user = schema.user;
  const album = schema.album;
  const userAlbumReview = schema.userAlbumReview;

  const rows = await db
    .select({
      id: userAlbumReview.id,
      userName: user.name,
      albumTitle: album.name,
      description: userAlbumReview.description,
      rating10: userAlbumReview.ocena,
      createdAt: userAlbumReview.dateCreated,
    })
    .from(userAlbumReview)
    .innerJoin(user, sql`${user.id} = ${userAlbumReview.userId}`)
    .innerJoin(album, sql`${album.id} = ${userAlbumReview.albumId}`)
    .orderBy(desc(userAlbumReview.dateCreated))
    .limit(6);

  return rows.map((row) => ({
    id: String(row.id),
    user: String(row.userName),
    albumTitle: String(row.albumTitle),
    description: String(row.description ?? ""),
    rating10: Number(row.rating10 ?? 0),
    createdAt: String(row.createdAt ?? ""),
  }));
}
