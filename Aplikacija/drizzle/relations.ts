import { relations } from "drizzle-orm/relations";
import { user, session, account, album, albumGenres, genre, userAlbumReview, userPreferences } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	userAlbumReviews: many(userAlbumReview),
	userPreferences: many(userPreferences),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const albumGenresRelations = relations(albumGenres, ({one}) => ({
	album: one(album, {
		fields: [albumGenres.albumId],
		references: [album.id]
	}),
	genre: one(genre, {
		fields: [albumGenres.genreId],
		references: [genre.id]
	}),
}));

export const albumRelations = relations(album, ({many}) => ({
	albumGenres: many(albumGenres),
}));

export const genreRelations = relations(genre, ({many}) => ({
	albumGenres: many(albumGenres),
}));

export const userAlbumReviewRelations = relations(userAlbumReview, ({one}) => ({
	user: one(user, {
		fields: [userAlbumReview.userId],
		references: [user.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(user, {
		fields: [userPreferences.userId],
		references: [user.id]
	}),
}));