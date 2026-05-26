import { relations } from "drizzle-orm/relations";
import {
  user,
  session,
  account,
  album,
  song,
  genre,
  albumGenres,
  userAlbumReview,
  userSongReview,
  criticAlbumReview,
  criticSongReview,
  story,
  storySongs,
  following,
  userPreferences,
  roleRequest,
  storyLikes,
  userAlbumReviewLikes,
  userSongReviewLikes,
  criticAlbumReviewLikes,
  criticSongReviewLikes,
} from "./schema";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  userAlbumReviews: many(userAlbumReview),
  userSongReviews: many(userSongReview),
  criticAlbumReviews: many(criticAlbumReview),
  criticSongReviews: many(criticSongReview),
  stories: many(story),
  sentRoleRequests: many(roleRequest, { relationName: "requester" }),
  resolvedRoleRequests: many(roleRequest, { relationName: "resolver" }),
  preferences: one(userPreferences, {
    fields: [user.id],
    references: [userPreferences.userId],
  }),
  storyLikes: many(storyLikes),
  userAlbumReviewLikes: many(userAlbumReviewLikes),
  userSongReviewLikes: many(userSongReviewLikes),
  criticAlbumReviewLikes: many(criticAlbumReviewLikes),
  criticSongReviewLikes: many(criticSongReviewLikes),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const albumRelations = relations(album, ({ many }) => ({
  songs: many(song),
  albumGenres: many(albumGenres),
  userAlbumReviews: many(userAlbumReview),
  criticAlbumReviews: many(criticAlbumReview),
}));

export const songRelations = relations(song, ({ one, many }) => ({
  album: one(album, { fields: [song.albumId], references: [album.id] }),
  userSongReviews: many(userSongReview),
  criticSongReviews: many(criticSongReview),
  storySongs: many(storySongs),
}));

export const genreRelations = relations(genre, ({ many }) => ({
  albumGenres: many(albumGenres),
}));

export const albumGenresRelations = relations(albumGenres, ({ one }) => ({
  album: one(album, { fields: [albumGenres.albumId], references: [album.id] }),
  genre: one(genre, { fields: [albumGenres.genreId], references: [genre.id] }),
}));

export const userAlbumReviewRelations = relations(
  userAlbumReview,
  ({ one, many }) => ({
    user: one(user, {
      fields: [userAlbumReview.userId],
      references: [user.id],
    }),
    album: one(album, {
      fields: [userAlbumReview.albumId],
      references: [album.id],
    }),
    likes: many(userAlbumReviewLikes),
  }),
);

export const userSongReviewRelations = relations(
  userSongReview,
  ({ one, many }) => ({
    user: one(user, { fields: [userSongReview.userId], references: [user.id] }),
    song: one(song, { fields: [userSongReview.songId], references: [song.id] }),
    likes: many(userSongReviewLikes),
  }),
);

export const criticAlbumReviewRelations = relations(
  criticAlbumReview,
  ({ one, many }) => ({
    user: one(user, {
      fields: [criticAlbumReview.userId],
      references: [user.id],
    }),
    album: one(album, {
      fields: [criticAlbumReview.albumId],
      references: [album.id],
    }),
    likes: many(criticAlbumReviewLikes),
  }),
);

export const criticSongReviewRelations = relations(
  criticSongReview,
  ({ one, many }) => ({
    user: one(user, {
      fields: [criticSongReview.userId],
      references: [user.id],
    }),
    song: one(song, {
      fields: [criticSongReview.songId],
      references: [song.id],
    }),
    likes: many(criticSongReviewLikes),
  }),
);

export const storyRelations = relations(story, ({ one, many }) => ({
  user: one(user, { fields: [story.userId], references: [user.id] }),
  storySongs: many(storySongs),
  likes: many(storyLikes),
}));

export const storySongsRelations = relations(storySongs, ({ one }) => ({
  story: one(story, { fields: [storySongs.storyId], references: [story.id] }),
  song: one(song, { fields: [storySongs.songId], references: [song.id] }),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
);

export const roleRequestRelations = relations(roleRequest, ({ one }) => ({
  requester: one(user, {
    fields: [roleRequest.userId],
    references: [user.id],
    relationName: "requester",
  }),
  resolver: one(user, {
    fields: [roleRequest.resolvedBy],
    references: [user.id],
    relationName: "resolver",
  }),
}));

export const storyLikesRelations = relations(storyLikes, ({ one }) => ({
  story: one(story, { fields: [storyLikes.storyId], references: [story.id] }),
  user: one(user, { fields: [storyLikes.userId], references: [user.id] }),
}));

export const userAlbumReviewLikesRelations = relations(
  userAlbumReviewLikes,
  ({ one }) => ({
    review: one(userAlbumReview, {
      fields: [userAlbumReviewLikes.reviewId],
      references: [userAlbumReview.id],
    }),
    user: one(user, {
      fields: [userAlbumReviewLikes.userId],
      references: [user.id],
    }),
  }),
);

export const userSongReviewLikesRelations = relations(
  userSongReviewLikes,
  ({ one }) => ({
    review: one(userSongReview, {
      fields: [userSongReviewLikes.reviewId],
      references: [userSongReview.id],
    }),
    user: one(user, {
      fields: [userSongReviewLikes.userId],
      references: [user.id],
    }),
  }),
);

export const criticAlbumReviewLikesRelations = relations(
  criticAlbumReviewLikes,
  ({ one }) => ({
    review: one(criticAlbumReview, {
      fields: [criticAlbumReviewLikes.reviewId],
      references: [criticAlbumReview.id],
    }),
    user: one(user, {
      fields: [criticAlbumReviewLikes.userId],
      references: [user.id],
    }),
  }),
);

export const criticSongReviewLikesRelations = relations(
  criticSongReviewLikes,
  ({ one }) => ({
    review: one(criticSongReview, {
      fields: [criticSongReviewLikes.reviewId],
      references: [criticSongReview.id],
    }),
    user: one(user, {
      fields: [criticSongReviewLikes.userId],
      references: [user.id],
    }),
  }),
);
