import "dotenv/config";

import { db } from "../db/db";
import {
  account,
  album,
  albumGenres,
  favoriteSongs,
  following,
  genre,
  session,
  song,
  story,
  storySongs,
  user,
  userAlbumReview,
  userPreferences,
  userSongReview,
  verification,
} from "../db/schema";

type SpotifyKind = "track" | "album";

const ALBUM_SPOTIFY_IDS = [
  "4aawyAB9vmqN3uQ7FjRGTy",
  "2noRn2Aes5aoNVsU6iWThc",
  "1ATL5GLyefJaxhQzSPVrLX",
  "6trNtQUgC8cgbWcqoMYkOR",
  "6s84u2TUpR3wdUv4NgKA2j",
  "2ODvWsOgouMbaA5xf0RkJe",
  "382ObEPsp2rxGrnsizN5TX",
  "3cfAM8b8KqJRoIzt3zLKqw",
  "0ETFjACtuP2ADo6LFhL6HN",
  "5h3WJG0aZjNOrayFu3MhCS",
  "4LH4d3cOWNNsVw41Gqt2kv",
  "6QaVfG1pHYl1z15ZxkvVDW",
];

const TRACK_SPOTIFY_IDS = [
  "3n3Ppam7vgaVa1iaRUc9Lp",
  "7ouMYWpwJ422jRcDASZB7P",
  "0VjIjW4GlUZAMYd2vXMi3b",
  "7qiZfU4dY1lWllzX7mPBI3",
  "1u8c2t2Cy7UBoG4ArRcF5g",
  "4VqPOruhp5EdPBeR92t6lQ",
  "2takcwOaAZWiXQijPHIx7B",
  "6DCZcSspjsKoFjzjrWoCdn",
  "3AJwUDP919kvQ9QcozQPxg",
  "5ChkMS8OtdzJeqyybCc9R5",
  "2Fxmhks0bxGSBdJ92vM42m",
  "7xGfFoTpQ2E7fRF5lN10tr",
  "4iV5W9uYEdYUVa79Axb7Rh",
  "1BxfuPKGuaTgP7aM0Bbdwr",
  "4cOdK2wGLETKBW3PvgPWqT",
  "6habFhsOp2NvshLv26DqMb",
];

const GENRE_NAMES = [
  "Rock",
  "Hip-Hop",
  "Pop",
  "Electronic",
  "Jazz",
  "R&B",
  "Indie",
  "Funk",
  "Soul",
  "Alternative",
];

const PLAYLIST_PREFIXES = [
  "Late Night",
  "Roadtrip",
  "Sunday Vibes",
  "Gym Session",
  "Focus Mode",
  "Rainy Day",
  "Retro Mix",
  "Midnight Drive",
];

const PLAYLIST_SUFFIXES = [
  "Essentials",
  "Selection",
  "Rotation",
  "Archive",
  "Collection",
  "Top Picks",
  "Radio",
  "Vault",
];

const REVIEW_SENTENCES = [
  "Produkcija je odlicna i vokal je bas u fokusu.",
  "Album drzi tempo i nema slabih momenata.",
  "Refren ostaje u glavi posle prvog slusanja.",
  "Aranzman je hrabar i zvuci sveze.",
  "Tekst je lican i dobro prenosi emociju.",
  "Instrumentali imaju jak groove i dobar balans.",
  "Odlican izbor pesama za playlist replay.",
  "Zvuk je cist, dinamican i moderan.",
];

const MAX_FAVORITE_SONGS_PER_USER = 4;

function nowIso(): string {
  return new Date().toISOString();
}

function dateStringInPast(maxDaysBack: number): string {
  const daysBack = randomInt(1, maxDaysBack);
  const ts = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  return new Date(ts).toISOString().slice(0, 10);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(values: T[]): T[] {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRandom<T>(values: T[]): T {
  return values[randomInt(0, values.length - 1)];
}

function pickN<T>(values: T[], count: number): T[] {
  return shuffle(values).slice(0, Math.min(count, values.length));
}

function makeSeedTag(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

function buildReviewText(): string {
  const size = randomInt(1, 3);
  return pickN(REVIEW_SENTENCES, size).join(" ");
}

function truncate64(value: string): string {
  return value.length > 64 ? value.slice(0, 64) : value;
}

function randomHexColor(): string {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
}

function randomToken(length = 48): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

async function fetchSpotifyTitles(
  kind: SpotifyKind,
  ids: string[],
  strict: boolean,
): Promise<Map<string, string>> {
  const titleMap = new Map<string, string>();
  const failed: string[] = [];

  for (const id of ids) {
    try {
      const response = await fetch(
        `https://open.spotify.com/oembed?url=spotify:${kind}:${id}`,
      );

      if (!response.ok) {
        failed.push(id);
        continue;
      }

      const payload = (await response.json()) as { title?: string };
      const parsed = payload.title?.trim();
      if (!parsed) {
        failed.push(id);
        continue;
      }

      titleMap.set(id, parsed);
    } catch {
      failed.push(id);
    }
  }

  if (strict && failed.length > 0) {
    throw new Error(
      `Spotify ${kind} ID validacija nije prosla za: ${failed.join(", ")}`,
    );
  }

  return titleMap;
}

async function resetSeedTables(): Promise<void> {
  await db.delete(storySongs);
  await db.delete(story);
  await db.delete(favoriteSongs);
  await db.delete(following);
  await db.delete(userSongReview);
  await db.delete(userAlbumReview);
  await db.delete(albumGenres);
  await db.delete(song);
  await db.delete(album);
  await db.delete(genre);
  await db.delete(session);
  await db.delete(account);
  await db.delete(userPreferences);
  await db.delete(verification);
  await db.delete(user);
}

async function seed(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const doReset = args.has("--reset");
  const skipSpotifyValidation = args.has("--skip-spotify-validation");
  const seedTag = makeSeedTag();

  if (doReset) {
    console.log("Resetujem postojece podatke pre seed-a...");
    await resetSeedTables();
  }

  const [existingAlbums, existingSongs] = await Promise.all([
    db.select({ spotifyId: album.spotifyId }).from(album),
    db.select({ spotifyId: song.spotifyId }).from(song),
  ]);

  const existingAlbumIds = new Set(existingAlbums.map((row) => row.spotifyId));
  const existingSongIds = new Set(existingSongs.map((row) => row.spotifyId));

  const availableAlbumSpotifyIds = ALBUM_SPOTIFY_IDS.filter(
    (id) => !existingAlbumIds.has(id),
  );
  const availableTrackSpotifyIds = TRACK_SPOTIFY_IDS.filter(
    (id) => !existingSongIds.has(id),
  );

  const albumSpotifyIds = pickN(availableAlbumSpotifyIds, 10);
  const trackSpotifyIds = pickN(availableTrackSpotifyIds, 16);

  if (albumSpotifyIds.length < 6 || trackSpotifyIds.length < 10) {
    throw new Error(
      "Nema dovoljno slobodnih validnih Spotify ID-jeva. Pokreni seed sa --reset ili dopuni ID pool u skripti.",
    );
  }

  const [albumTitleMap, trackTitleMap] = await Promise.all([
    fetchSpotifyTitles("album", albumSpotifyIds, !skipSpotifyValidation),
    fetchSpotifyTitles("track", trackSpotifyIds, !skipSpotifyValidation),
  ]);

  const timestamp = nowIso();

  const usersToInsert = Array.from({ length: 8 }).map((_, index) => {
    const userIndex = index + 1;
    const userId = `seed_user_${seedTag}_${userIndex}`;
    return {
      id: userId,
      name: `Test User ${userIndex}`,
      email: `test.user.${seedTag}.${userIndex}@example.com`,
      emailVerified: true,
      image: `https://api.dicebear.com/9.x/identicon/svg?seed=${userId}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  await db.insert(user).values(usersToInsert);
  const userIds = usersToInsert.map((row) => row.id);

  const sessionsToInsert = userIds.map((userId) => ({
    id: crypto.randomUUID(),
    userId,
    token: randomToken(64),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    ipAddress: `10.0.0.${randomInt(1, 220)}`,
    userAgent: "SeedScript/1.0",
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  await db.insert(session).values(sessionsToInsert);

  const accountsToInsert = userIds.map((userId, index) => ({
    id: crypto.randomUUID(),
    userId,
    accountId: `seed_credentials_${seedTag}_${index + 1}`,
    providerId: "credentials",
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    idToken: null,
    password: `seed-password-${index + 1}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  await db.insert(account).values(accountsToInsert);

  await db
    .insert(genre)
    .values(
      GENRE_NAMES.map((name) => ({
        id: crypto.randomUUID(),
        name,
      })),
    )
    .onConflictDoNothing();

  const genreRows = await db.select({ id: genre.id }).from(genre);
  const genreIds = genreRows.map((row) => row.id);

  const albumsToInsert = albumSpotifyIds.map((spotifyId, index) => {
    const title = albumTitleMap.get(spotifyId) ?? `Album ${index + 1}`;
    return {
      id: crypto.randomUUID(),
      name: truncate64(title),
      godinaIzdavanja: randomInt(1994, 2025),
      spotifyId,
    };
  });

  await db.insert(album).values(albumsToInsert);
  const albumIds = albumsToInsert.map((row) => row.id);

  const songsToInsert = trackSpotifyIds.map((spotifyId, index) => {
    const title = trackTitleMap.get(spotifyId) ?? `Track ${index + 1}`;
    return {
      id: crypto.randomUUID(),
      albumId: pickRandom(albumIds),
      name: truncate64(title),
      spotifyId,
    };
  });

  await db.insert(song).values(songsToInsert);
  const songIds = songsToInsert.map((row) => row.id);

  const albumGenrePairs = new Set<string>();
  const albumGenresToInsert: Array<{
    id: string;
    albumId: string;
    genreId: string;
  }> = [];

  for (const albumId of albumIds) {
    const perAlbum = randomInt(1, 3);
    for (const genreId of pickN(genreIds, perAlbum)) {
      const key = `${albumId}::${genreId}`;
      if (albumGenrePairs.has(key)) {
        continue;
      }
      albumGenrePairs.add(key);
      albumGenresToInsert.push({
        id: crypto.randomUUID(),
        albumId,
        genreId,
      });
    }
  }

  if (albumGenresToInsert.length > 0) {
    await db.insert(albumGenres).values(albumGenresToInsert);
  }

  const albumReviewsToInsert: Array<{
    id: string;
    userId: string;
    albumId: string;
    ocena: number;
    liked: boolean;
    description: string;
    dateCreated: string;
  }> = [];

  for (const userId of userIds) {
    for (const reviewedAlbumId of pickN(albumIds, randomInt(2, 4))) {
      const ocena = randomInt(6, 10);
      albumReviewsToInsert.push({
        id: crypto.randomUUID(),
        userId,
        albumId: reviewedAlbumId,
        ocena,
        liked: ocena >= 7,
        description: buildReviewText(),
        dateCreated: dateStringInPast(180),
      });
    }
  }

  if (albumReviewsToInsert.length > 0) {
    await db.insert(userAlbumReview).values(albumReviewsToInsert);
  }

  const songReviewsToInsert: Array<{
    id: string;
    userId: string;
    songId: string;
    ocena: number;
    liked: boolean;
    description: string;
    dateCreated: string;
  }> = [];

  for (const userId of userIds) {
    for (const reviewedSongId of pickN(songIds, randomInt(3, 5))) {
      const ocena = randomInt(5, 10);
      songReviewsToInsert.push({
        id: crypto.randomUUID(),
        userId,
        songId: reviewedSongId,
        ocena,
        liked: ocena >= 7,
        description: buildReviewText(),
        dateCreated: dateStringInPast(120),
      });
    }
  }

  if (songReviewsToInsert.length > 0) {
    await db.insert(userSongReview).values(songReviewsToInsert);
  }

  const storiesToInsert: Array<{
    id: string;
    userId: string;
    description: string;
    image: string;
    name: string;
    dateCreated: string;
  }> = [];

  for (const userId of userIds) {
    const storyCount = randomInt(1, 2);
    for (let i = 0; i < storyCount; i += 1) {
      const name = `${pickRandom(PLAYLIST_PREFIXES)} ${pickRandom(PLAYLIST_SUFFIXES)}`;
      const storyId = crypto.randomUUID();
      storiesToInsert.push({
        id: storyId,
        userId,
        description: "Fake playlist za testiranje feed-a i library ekrana.",
        image: `https://picsum.photos/seed/${storyId}/640/640`,
        name: truncate64(name),
        dateCreated: dateStringInPast(90),
      });
    }
  }

  await db.insert(story).values(storiesToInsert);

  const storySongsToInsert: Array<{
    id: string;
    storyId: string;
    songId: string;
    dateAdded: string;
  }> = [];

  for (const storyRow of storiesToInsert) {
    const songsForStory = pickN(songIds, randomInt(4, 8));
    for (const songId of songsForStory) {
      storySongsToInsert.push({
        id: crypto.randomUUID(),
        storyId: storyRow.id,
        songId,
        dateAdded: nowIso(),
      });
    }
  }

  if (storySongsToInsert.length > 0) {
    await db.insert(storySongs).values(storySongsToInsert);
  }

  const followingPairs = new Set<string>();
  const followingToInsert: Array<{
    id: string;
    followedId: string;
    followingId: string;
    dateFollowed: string;
  }> = [];

  for (const followerId of userIds) {
    const candidates = userIds.filter((candidate) => candidate !== followerId);
    for (const followedId of pickN(candidates, randomInt(2, 4))) {
      const key = `${followedId}::${followerId}`;
      if (followingPairs.has(key)) {
        continue;
      }
      followingPairs.add(key);
      followingToInsert.push({
        id: crypto.randomUUID(),
        followedId,
        followingId: followerId,
        dateFollowed: nowIso(),
      });
    }
  }

  if (followingToInsert.length > 0) {
    await db.insert(following).values(followingToInsert).onConflictDoNothing();
  }

  const favoritePairs = new Set<string>();
  const favoriteSongsToInsert: Array<{
    id: string;
    userId: string;
    songId: string;
  }> = [];

  for (const userId of userIds) {
    const maxFavoritesForUser = Math.min(
      MAX_FAVORITE_SONGS_PER_USER,
      songIds.length,
    );
    const favoritesCount = randomInt(1, maxFavoritesForUser);
    for (const favSongId of pickN(songIds, favoritesCount)) {
      const key = `${userId}::${favSongId}`;
      if (favoritePairs.has(key)) {
        continue;
      }
      favoritePairs.add(key);
      favoriteSongsToInsert.push({
        id: crypto.randomUUID(),
        userId,
        songId: favSongId,
      });
    }
  }

  if (favoriteSongsToInsert.length > 0) {
    await db
      .insert(favoriteSongs)
      .values(favoriteSongsToInsert)
      .onConflictDoNothing();
  }

  const anthemPool = shuffle(trackSpotifyIds);
  const userPreferencesToInsert = userIds.map((userId, index) => ({
    userId,
    preferenceId: crypto.randomUUID(),
    accentColor: randomHexColor(),
    backgroundColor: randomHexColor(),
    textColor: randomHexColor(),
    anthem: index < anthemPool.length ? anthemPool[index] : null,
  }));

  await db.insert(userPreferences).values(userPreferencesToInsert);

  console.log("Seed uspesno zavrsen.");
  console.log(
    JSON.stringify(
      {
        users: usersToInsert.length,
        albums: albumsToInsert.length,
        songs: songsToInsert.length,
        albumReviews: albumReviewsToInsert.length,
        songReviews: songReviewsToInsert.length,
        stories: storiesToInsert.length,
        storySongs: storySongsToInsert.length,
        followings: followingToInsert.length,
        favorites: favoriteSongsToInsert.length,
      },
      null,
      2,
    ),
  );
}

seed().catch((error) => {
  console.error("Seed nije uspeo.");
  console.error(error);
  process.exit(1);
});
