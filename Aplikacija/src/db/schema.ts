import {
  pgTable,
  text,
  boolean,
  timestamp,
  foreignKey,
  unique,
  uuid,
  varchar,
  integer,
  check,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const user = pgTable("user", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  emailVerified: boolean().notNull(),
  image: text(),
  createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    token: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_fkey",
    }).onDelete("cascade"),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true, mode: "string" }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: "string" }),
    scope: text(),
    idToken: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_fkey",
    }).onDelete("cascade"),
  ],
);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
});

export const album = pgTable(
  "Album",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    godinaIzdavanja: integer("godina_izdavanja").notNull(),
    spotifyId: varchar("spotify_id", { length: 22 }).notNull(),
    imageUrl: text("image_url"),
    artistDisplayName: text("artist_display_name"),
    releaseDate: varchar("release_date", { length: 10 }),
    releaseDatePrecision: varchar("release_date_precision", { length: 10 }),
    albumType: varchar("album_type", { length: 20 }),
    totalTracks: integer("total_tracks"),
    spotifyUri: text("spotify_uri"),
    spotifyExternalUrl: text("spotify_external_url"),
    lastSpotifySyncAt: timestamp("last_spotify_sync_at", { mode: "string" }),
  },
  (table) => [
    unique("Album_spotify_id_key").on(table.spotifyId),
    index("album_godina_izdavanja_idx").on(table.godinaIzdavanja),
  ],
);

export const song = pgTable(
  "Song",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    albumId: uuid("album_id").notNull(),
    name: text().notNull(),
    spotifyId: varchar("spotify_id", { length: 22 }).notNull(),
    artistDisplayName: text("artist_display_name"),
    durationMs: integer("duration_ms"),
    trackNumber: integer("track_number"),
    discNumber: integer("disc_number").default(1).notNull(),
    previewUrl: text("preview_url"),
    spotifyUri: text("spotify_uri"),
    spotifyExternalUrl: text("spotify_external_url"),
    lastSpotifySyncAt: timestamp("last_spotify_sync_at", { mode: "string" }),
  },
  (table) => [
    unique("Song_spotify_id_key").on(table.spotifyId),
    foreignKey({
      columns: [table.albumId],
      foreignColumns: [album.id],
      name: "song_belongs_to_album",
    }).onDelete("cascade"),
    index("song_album_id_idx").on(table.albumId),
    index("song_album_track_order_idx").on(
      table.albumId,
      table.discNumber,
      table.trackNumber,
    ),
  ],
);

export const genre = pgTable(
  "Genre",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 64 }).notNull(),
  },
  (table) => [unique("Genre_name_key").on(table.name)],
);

export const albumGenres = pgTable(
  "Album_Genres",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    albumId: uuid("album_id").notNull(),
    genreId: uuid("genre_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.albumId],
      foreignColumns: [album.id],
      name: "album_has_genres",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.genreId],
      foreignColumns: [genre.id],
      name: "genre_of_album",
    }).onDelete("cascade"),
    unique("unique_album_genre").on(table.albumId, table.genreId),
  ],
);

export const userAlbumReview = pgTable(
  "User_Album_Review",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    albumId: uuid("album_id").notNull(),
    ocena: integer(),
    liked: boolean(),
    description: text(),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_reviewed_album",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.albumId],
      foreignColumns: [album.id],
      name: "review_of_album",
    }).onDelete("cascade"),
    check("ocena_in_range", sql`(ocena >= 0) AND (ocena <= 10)`),
    unique("unique_user_album_review").on(table.userId, table.albumId),
    index("user_album_review_date_created_idx").on(table.dateCreated),
  ],
);

export const userSongReview = pgTable(
  "User_Song_Review",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    songId: uuid("song_id").notNull(),
    ocena: integer(),
    liked: boolean(),
    description: text(),
    dateCreated: timestamp("date_created", { mode: "string" }).defaultNow(),
  },
  (table) => [
    check("ocena_in_range", sql`(ocena >= 0) AND (ocena <= 10)`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_reviewed_song",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.songId],
      foreignColumns: [song.id],
      name: "review_of_song",
    }).onDelete("cascade"),
    unique("unique_user_song_review").on(table.userId, table.songId),
    index("user_song_review_date_created_idx").on(table.dateCreated),
  ],
);

export const criticAlbumReview = pgTable(
  "Critic_Album_Review",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    albumId: uuid("album_id").notNull(),
    naslov: varchar({ length: 128 }).notNull(),
    ocena: integer().notNull(),
    tekstKritike: text("tekst_kritike").notNull(),
    zakljucak: varchar({ length: 255 }),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "critic_reviewed_album_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.albumId],
      foreignColumns: [album.id],
      name: "critic_review_of_album_fk",
    }).onDelete("cascade"),
    check("critic_album_ocena_in_range", sql`(ocena >= 0) AND (ocena <= 10)`),
    unique("unique_critic_album_review").on(table.userId, table.albumId),
    index("critic_album_review_date_created_idx").on(table.dateCreated),
  ],
);

export const criticSongReview = pgTable(
  "Critic_Song_Review",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    songId: uuid("song_id").notNull(),
    naslov: varchar({ length: 128 }).notNull(),
    ocena: integer().notNull(),
    tekstKritike: text("tekst_kritike").notNull(),
    zakljucak: varchar({ length: 255 }),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "critic_reviewed_song_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.songId],
      foreignColumns: [song.id],
      name: "critic_review_of_song_fk",
    }).onDelete("cascade"),
    check("critic_song_ocena_in_range", sql`(ocena >= 0) AND (ocena <= 10)`),
    unique("unique_critic_song_review").on(table.userId, table.songId),
    index("critic_song_review_date_created_idx").on(table.dateCreated),
  ],
);

export const story = pgTable(
  "Story",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    description: text(),
    image: text().notNull(),
    name: varchar({ length: 64 }).notNull(),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "story_owned_by_user",
    }).onDelete("cascade"),
    index("story_date_created_idx").on(table.dateCreated),
  ],
);

export const storySongs = pgTable(
  "Story_Songs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    storyId: uuid("story_id").notNull(),
    songId: uuid("song_id").notNull(),
    dateAdded: timestamp("date_added", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.storyId],
      foreignColumns: [story.id],
      name: "story_contains_song",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.songId],
      foreignColumns: [song.id],
      name: "song_is_in_story",
    }).onDelete("cascade"),
    unique("unique_story_song").on(table.storyId, table.songId),
  ],
);

export const following = pgTable(
  "Following",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    followedId: text("followed_id").notNull(),
    followingId: text("following_id").notNull(),
    dateFollowed: timestamp("date_followed", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("unique_following_followed").on(table.followedId, table.followingId),
    foreignKey({
      columns: [table.followedId],
      foreignColumns: [user.id],
      name: "fk_followed_user",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.followingId],
      foreignColumns: [user.id],
      name: "fk_following_user",
    }).onDelete("cascade"),
    index("following_followed_id_idx").on(table.followedId),
    index("following_following_id_idx").on(table.followingId),
  ],
);

export const userPreferences = pgTable(
  "UserPreferences",
  {
    userId: text("user_id").notNull(),
    preferenceId: uuid("preference_id").defaultRandom().notNull(),

    // 'user', 'critic', 'artist', 'admin'
    role: varchar("role", { length: 20 }).default("user").notNull(),

    profilePictureUrl: text("profile_picture_url"),
    artistBio: text("artist_bio"),
    anthem: varchar({ length: 22 }),
    spotifyConnected: boolean("spotify_connected").default(false).notNull(),
    spotifyAccessToken: text("spotify_access_token"),
    spotifyRefreshToken: text("spotify_refresh_token"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "fk_user",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.preferenceId],
      name: "UserPreferences_pkey",
    }),
    unique("UserPreferences_anthem_key").on(table.anthem),
  ],
);

export const roleRequest = pgTable(
  "Role_Request",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    requestedRole: varchar("requested_role", { length: 20 }).notNull(),
    // 'pending', 'approved', 'rejected'
    status: varchar({ length: 20 }).default("pending").notNull(),
    obrazlozenje: text(),
    resolvedBy: text("resolved_by"),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
    dateResolved: timestamp("date_resolved", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "role_request_user_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.resolvedBy],
      foreignColumns: [user.id],
      name: "role_request_resolved_by_fk",
    }).onDelete("set null"),
    check(
      "valid_requested_role",
      sql`requested_role IN ('critic', 'artist', 'admin')`,
    ),
    check("valid_status", sql`status IN ('pending', 'approved', 'rejected')`),
  ],
);

export const storyLikes = pgTable(
  "Story_Likes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    storyId: uuid("story_id").notNull(),
    userId: text("user_id").notNull(),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.storyId],
      foreignColumns: [story.id],
      name: "story_like_story_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "story_like_user_fk",
    }).onDelete("cascade"),
    unique("unique_story_like").on(table.storyId, table.userId),
    index("story_likes_date_created_idx").on(table.dateCreated),
  ],
);

export const userAlbumReviewLikes = pgTable(
  "User_Album_Review_Likes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    reviewId: uuid("review_id").notNull(),
    userId: text("user_id").notNull(),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [userAlbumReview.id],
      name: "user_album_review_like_review_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_album_review_like_user_fk",
    }).onDelete("cascade"),
    unique("unique_user_album_review_like").on(table.reviewId, table.userId),
    index("user_album_review_likes_date_created_idx").on(table.dateCreated),
  ],
);

export const userSongReviewLikes = pgTable(
  "User_Song_Review_Likes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    reviewId: uuid("review_id").notNull(),
    userId: text("user_id").notNull(),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [userSongReview.id],
      name: "user_song_review_like_review_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_song_review_like_user_fk",
    }).onDelete("cascade"),
    unique("unique_user_song_review_like").on(table.reviewId, table.userId),
    index("user_song_review_likes_date_created_idx").on(table.dateCreated),
  ],
);

export const criticAlbumReviewLikes = pgTable(
  "Critic_Album_Review_Likes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    reviewId: uuid("review_id").notNull(),
    userId: text("user_id").notNull(),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [criticAlbumReview.id],
      name: "critic_album_review_like_review_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "critic_album_review_like_user_fk",
    }).onDelete("cascade"),
    unique("unique_critic_album_review_like").on(table.reviewId, table.userId),
  ],
);

export const criticSongReviewLikes = pgTable(
  "Critic_Song_Review_Likes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    reviewId: uuid("review_id").notNull(),
    userId: text("user_id").notNull(),
    dateCreated: timestamp("date_created", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [criticSongReview.id],
      name: "critic_song_review_like_review_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "critic_song_review_like_user_fk",
    }).onDelete("cascade"),
    unique("unique_critic_song_review_like").on(table.reviewId, table.userId),
  ],
);
