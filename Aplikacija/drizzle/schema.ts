import { pgTable, text, boolean, timestamp, foreignKey, unique, uuid, varchar, integer, check, date, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	token: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}).onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	scope: text(),
	idToken: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
});

export const song = pgTable("Song", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	albumId: uuid("album_id").notNull(),
	name: varchar({ length: 64 }).notNull(),
	spotifyId: varchar("spotify_id", { length: 22 }).notNull(),
}, (table) => [
	unique("Song_spotify_id_key").on(table.spotifyId),
]);

export const album = pgTable("Album", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 64 }).notNull(),
	godinaIzdavanja: integer("godina_izdavanja").notNull(),
	spotifyId: varchar("spotify_id", { length: 22 }).notNull(),
}, (table) => [
	unique("Album_spotify_id_key").on(table.spotifyId),
]);

export const userSongReview = pgTable("User_Song_Review", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	songId: uuid("song_id").notNull(),
	ocena: integer(),
	liked: boolean(),
	description: text(),
	dateCreated: date("date_created").defaultNow(),
}, (table) => [
	check("ocena_in_range", sql`(ocena >= 0) AND (ocena <= 10)`),
]);

export const albumGenres = pgTable("Album_Genres", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	albumId: uuid("album_id").notNull(),
	genreId: uuid("genre_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.albumId],
			foreignColumns: [album.id],
			name: "album_has_genres"
		}),
	foreignKey({
			columns: [table.genreId],
			foreignColumns: [genre.id],
			name: "genre_of_album"
		}),
]);

export const genre = pgTable("Genre", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 64 }).notNull(),
}, (table) => [
	unique("Genre_name_key").on(table.name),
]);

export const userAlbumReview = pgTable("User_Album_Review", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	albumId: uuid("album_id").notNull(),
	ocena: integer(),
	liked: boolean(),
	description: text(),
	dateCreated: date("date_created").defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_reviewed_album"
		}),
	check("ocena_in_range", sql`(ocena >= 0) AND (ocena <= 10)`),
]);

export const story = pgTable("Story", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	description: text(),
	image: text().notNull(),
	name: varchar({ length: 64 }).notNull(),
	dateCreated: date("date_created").defaultNow().notNull(),
});

export const storySongs = pgTable("Story_Songs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	storyId: uuid("story_id").notNull(),
	songId: uuid("song_id").notNull(),
	dateAdded: timestamp("date_added", { mode: 'string' }).defaultNow().notNull(),
});

export const following = pgTable("Following", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	followedId: text("followed_id").notNull(),
	followingId: text("following_id").notNull(),
	dateFollowed: timestamp("date_followed", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("unique_following_followed").on(table.followedId, table.followingId),
]);

export const favoriteSongs = pgTable("Favorite_Songs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	songId: uuid("song_id").notNull(),
}, (table) => [
	unique("unique_user_favorite_song").on(table.userId, table.songId),
]);

export const userPreferences = pgTable("UserPreferences", {
	userId: text("user_id").notNull(),
	preferenceId: uuid("preference_id").defaultRandom().notNull(),
	accentColor: varchar("accent_color", { length: 6 }),
	backgroundColor: varchar("background_color", { length: 6 }),
	textColor: varchar("text_color", { length: 6 }),
	anthem: varchar({ length: 22 }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "fk_user"
		}),
	primaryKey({ columns: [table.userId, table.preferenceId], name: "UserPreferences_pkey"}),
	unique("UserPreferences_anthem_key").on(table.anthem),
]);
