import "dotenv/config";

import { randomUUID } from "node:crypto";

import { and, eq, like } from "drizzle-orm";

import { db } from "../../../src/db/db";
import {
  album,
  criticAlbumReview,
  criticSongReview,
  roleRequest,
  song,
  story,
  storySongs,
  user,
  userAlbumReview,
  userPreferences,
  userSongReview,
} from "../../../src/db/schema";

export const TEST_PASSWORD = "kukuruz1";

export const TEST_USERS = {
  user: {
    email: "lazar@test.com",
    role: "user",
  },
  critic: {
    email: "critic@test.com",
    role: "critic",
  },
  artist: {
    email: "muzicar@test.com",
    role: "artist",
  },
  admin: {
    email: "admin@test.com",
    role: "admin",
  },
} as const;

type TestUserKey = keyof typeof TEST_USERS;
type KnownRole = (typeof TEST_USERS)[keyof typeof TEST_USERS]["role"];
const TEST_USER_KEYS = Object.keys(TEST_USERS) as TestUserKey[];

export type KnownUser = {
  id: string;
  email: string;
  name: string;
  role: KnownRole;
};

export type CatalogFixture = {
  tag: string;
  albumId: string;
  albumSpotifyId: string;
  albumName: string;
  songId: string;
  songSpotifyId: string;
  songName: string;
};

export function makeTag(label: string) {
  return `PW-E2E-${label}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

function makeSpotifyId() {
  return randomUUID().replace(/-/g, "").slice(0, 22);
}

export async function getKnownUsers(): Promise<Record<TestUserKey, KnownUser>> {
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: userPreferences.role,
    })
    .from(user)
    .innerJoin(userPreferences, eq(userPreferences.userId, user.id));

  const result = {} as Record<TestUserKey, KnownUser>;

  for (const key of TEST_USER_KEYS) {
    const expected = TEST_USERS[key];
    const row = rows.find((candidate) => candidate.email === expected.email);

    if (!row) {
      throw new Error(`Missing Playwright test user: ${expected.email}`);
    }

    result[key] = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: expected.role,
    };
  }

  return result;
}

export async function restoreKnownUsers() {
  const users = await getKnownUsers();

  for (const key of TEST_USER_KEYS) {
    const expected = TEST_USERS[key];

    await db
      .update(userPreferences)
      .set({ role: expected.role })
      .where(eq(userPreferences.userId, users[key].id));
  }
}

export async function getUserRole(userId: string) {
  const [row] = await db
    .select({ role: userPreferences.role })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  return row?.role ?? null;
}

export async function setUserName(userId: string, name: string) {
  await db.update(user).set({ name }).where(eq(user.id, userId));
}

export async function createCatalogFixture(tag = makeTag("catalog")): Promise<CatalogFixture> {
  const albumSpotifyId = makeSpotifyId();
  const songSpotifyId = makeSpotifyId();
  const albumName = `${tag} Album`;
  const songName = `${tag} Song`;

  const [createdAlbum] = await db
    .insert(album)
    .values({
      name: albumName,
      godinaIzdavanja: 2026,
      spotifyId: albumSpotifyId,
      imageUrl: null,
      artistDisplayName: "Playwright Artist",
      releaseDate: "2026-01-01",
      releaseDatePrecision: "day",
      albumType: "album",
      totalTracks: 1,
      spotifyUri: `spotify:album:${albumSpotifyId}`,
      spotifyExternalUrl: null,
      lastSpotifySyncAt: null,
    })
    .returning({ id: album.id });

  const [createdSong] = await db
    .insert(song)
    .values({
      albumId: createdAlbum.id,
      name: songName,
      spotifyId: songSpotifyId,
      artistDisplayName: "Playwright Artist",
      durationMs: 185000,
      trackNumber: 1,
      discNumber: 1,
      previewUrl: null,
      spotifyUri: `spotify:track:${songSpotifyId}`,
      spotifyExternalUrl: null,
      lastSpotifySyncAt: null,
    })
    .returning({ id: song.id });

  return {
    tag,
    albumId: createdAlbum.id,
    albumSpotifyId,
    albumName,
    songId: createdSong.id,
    songSpotifyId,
    songName,
  };
}

export async function createStoryFixture(userId: string, tag = makeTag("story")) {
  const [createdStory] = await db
    .insert(story)
    .values({
      userId,
      name: `${tag} Story`,
      description: `${tag} description`,
      image:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%231c1b1b'/%3E%3C/svg%3E",
    })
    .returning({ id: story.id });

  return {
    tag,
    storyId: createdStory.id,
    storyName: `${tag} Story`,
  };
}

export async function addSongToStoryFixture(storyId: string, songId: string) {
  await db.insert(storySongs).values({ storyId, songId });
}

export async function isSongInStoryFixture(storyId: string, songId: string) {
  const [row] = await db
    .select({ id: storySongs.id })
    .from(storySongs)
    .where(and(eq(storySongs.storyId, storyId), eq(storySongs.songId, songId)))
    .limit(1);

  return Boolean(row);
}

export async function getStoryName(storyId: string) {
  const [row] = await db
    .select({ name: story.name })
    .from(story)
    .where(eq(story.id, storyId))
    .limit(1);

  return row?.name ?? null;
}

export async function deleteStoryById(storyId: string) {
  await db.delete(story).where(eq(story.id, storyId));
}

export async function getUserAlbumReviewDescription(
  userId: string,
  albumId: string,
) {
  const [row] = await db
    .select({ description: userAlbumReview.description })
    .from(userAlbumReview)
    .where(
      and(eq(userAlbumReview.userId, userId), eq(userAlbumReview.albumId, albumId)),
    )
    .limit(1);

  return row?.description ?? null;
}

export async function getUserSongReviewDescription(
  userId: string,
  songId: string,
) {
  const [row] = await db
    .select({ description: userSongReview.description })
    .from(userSongReview)
    .where(and(eq(userSongReview.userId, userId), eq(userSongReview.songId, songId)))
    .limit(1);

  return row?.description ?? null;
}

export async function createPendingRoleRequest(
  userId: string,
  requestedRole: "critic" | "artist" | "admin",
  tag = makeTag("role"),
) {
  const [request] = await db
    .insert(roleRequest)
    .values({
      userId,
      requestedRole,
      status: "pending",
      obrazlozenje: `${tag} role request reason with enough detail`,
    })
    .returning({ id: roleRequest.id });

  return {
    tag,
    requestId: request.id,
  };
}

export async function deleteRegisteredUserByEmail(email: string) {
  await db.delete(user).where(eq(user.email, email));
}

export async function cleanupTag(tag: string) {
  await db.delete(roleRequest).where(like(roleRequest.obrazlozenje, `%${tag}%`));
  await db.delete(story).where(like(story.name, `${tag}%`));
  await db.delete(album).where(like(album.name, `${tag}%`));
}

export async function cleanupReviewForUser(
  userId: string,
  fixture: CatalogFixture,
) {
  await db
    .delete(userAlbumReview)
    .where(
      and(
        eq(userAlbumReview.userId, userId),
        eq(userAlbumReview.albumId, fixture.albumId),
      ),
    );
  await db
    .delete(userSongReview)
    .where(
      and(
        eq(userSongReview.userId, userId),
        eq(userSongReview.songId, fixture.songId),
      ),
    );
  await db
    .delete(criticAlbumReview)
    .where(
      and(
        eq(criticAlbumReview.userId, userId),
        eq(criticAlbumReview.albumId, fixture.albumId),
      ),
    );
  await db
    .delete(criticSongReview)
    .where(
      and(
        eq(criticSongReview.userId, userId),
        eq(criticSongReview.songId, fixture.songId),
      ),
    );
}
