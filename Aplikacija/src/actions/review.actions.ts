"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  getCriticAlbumReviewDraft,
  getCriticSongReviewDraft,
  getUserAlbumReviewDraft,
  getUserSongReviewDraft,
} from "@/db/queries/catalog.queries";
import {
  getAlbumRecentReviews,
  getSongRecentReviews,
  getUserRecentReviews,
} from "@/db/queries/review.query";
import { getUserPreferences } from "@/db/queries/users.queries";
import { db } from "@/db/db";
import {
  criticAlbumReview,
  criticAlbumReviewLikes,
  criticSongReview,
  criticSongReviewLikes,
  userAlbumReview,
  userAlbumReviewLikes,
  userSongReview,
  userSongReviewLikes,
} from "@/db/schema";
import {
  albumReviewInputSchema,
  criticAlbumReviewInputSchema,
  criticSongReviewInputSchema,
  songReviewInputSchema,
  type AlbumReviewInput,
  type CriticAlbumReviewInput,
  type CriticSongReviewInput,
  type SongReviewInput,
} from "@/features/album/review.schemas";
import { auth } from "@/lib/auth";

export async function getRecentReviewsForAlbum(
  albumId: string,
  viewerId?: string | null,
) {
  return getAlbumRecentReviews(albumId, viewerId);
}

export async function getRecentReviewsForSong(
  songId: string,
  viewerId?: string | null,
) {
  return getSongRecentReviews(songId, viewerId);
}

export async function getUserReviews(
  userId: string,
  viewerId?: string | null,
  limit = 5,
) {
  return getUserRecentReviews(userId, viewerId, limit);
}

export async function saveAlbumReview(input: AlbumReviewInput): Promise<{
  liked: boolean;
  rating10: number;
  description: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);
  const role = preferences?.role ?? "user";

  if (role === "critic") {
    throw new Error("Critics must use the critique form");
  }

  const parsed = albumReviewInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Neispravan unos recenzije",
    );
  }

  const trimmedDescription = parsed.data.description.trim();
  const rating10 = parsed.data.rating10;
  const existingReview = await getUserAlbumReviewDraft(
    parsed.data.albumId,
    session.user.id,
  );

  if (!existingReview) {
    await db.insert(userAlbumReview).values({
      albumId: parsed.data.albumId,
      userId: session.user.id,
      ocena: rating10,
      liked: parsed.data.liked,
      description: trimmedDescription || null,
    });
  } else {
    await db
      .update(userAlbumReview)
      .set({
        ocena: rating10,
        liked: parsed.data.liked,
        description: trimmedDescription || null,
      })
      .where(
        and(
          eq(userAlbumReview.albumId, parsed.data.albumId),
          eq(userAlbumReview.userId, session.user.id),
        ),
      );
  }

  revalidatePath("/");
  revalidatePath(`/album/${parsed.data.albumSpotifyId}`);

  return {
    liked: parsed.data.liked,
    rating10,
    description: trimmedDescription,
  };
}

export async function deleteAlbumReview(input: {
  albumId: string;
  albumSpotifyId: string;
}): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);
  const role = preferences?.role ?? "user";

  if (role === "critic") {
    throw new Error("Critics must use the critique form");
  }

  await db
    .delete(userAlbumReview)
    .where(
      and(
        eq(userAlbumReview.albumId, input.albumId),
        eq(userAlbumReview.userId, session.user.id),
      ),
    );

  revalidatePath("/");
  revalidatePath(`/album/${input.albumSpotifyId}`);
}

export async function saveSongReview(input: SongReviewInput): Promise<{
  liked: boolean;
  rating10: number;
  description: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);
  const role = preferences?.role ?? "user";

  if (role === "critic") {
    throw new Error("Critics must use the critique form");
  }

  const parsed = songReviewInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Neispravan unos recenzije",
    );
  }

  const trimmedDescription = parsed.data.description.trim();
  const rating10 = parsed.data.rating10;
  const existingReview = await getUserSongReviewDraft(
    parsed.data.songId,
    session.user.id,
  );

  if (!existingReview) {
    await db.insert(userSongReview).values({
      songId: parsed.data.songId,
      userId: session.user.id,
      ocena: rating10,
      liked: parsed.data.liked,
      description: trimmedDescription || null,
    });
  } else {
    await db
      .update(userSongReview)
      .set({
        ocena: rating10,
        liked: parsed.data.liked,
        description: trimmedDescription || null,
      })
      .where(
        and(
          eq(userSongReview.songId, parsed.data.songId),
          eq(userSongReview.userId, session.user.id),
        ),
      );
  }

  revalidatePath("/");
  revalidatePath(`/song/${parsed.data.songSpotifyId}`);

  return {
    liked: parsed.data.liked,
    rating10,
    description: trimmedDescription,
  };
}

export async function deleteSongReview(input: {
  songId: string;
  songSpotifyId: string;
}): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);
  const role = preferences?.role ?? "user";

  if (role === "critic") {
    throw new Error("Critics must use the critique form");
  }

  await db
    .delete(userSongReview)
    .where(
      and(
        eq(userSongReview.songId, input.songId),
        eq(userSongReview.userId, session.user.id),
      ),
    );

  revalidatePath("/");
  revalidatePath(`/song/${input.songSpotifyId}`);
}

export async function saveCriticAlbumReview(
  input: CriticAlbumReviewInput,
): Promise<{
  title: string;
  rating10: number;
  critiqueText: string;
  conclusion: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "critic") {
    throw new Error("Only critics can submit album critiques");
  }

  const parsed = criticAlbumReviewInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Neispravan unos kritike",
    );
  }

  const trimmedTitle = parsed.data.title;
  const trimmedCritiqueText = parsed.data.critiqueText;
  const trimmedConclusion = parsed.data.conclusion;
  const rating10 = parsed.data.rating10;

  const existingReview = await getCriticAlbumReviewDraft(
    parsed.data.albumId,
    session.user.id,
  );

  if (!existingReview) {
    await db.insert(criticAlbumReview).values({
      albumId: parsed.data.albumId,
      userId: session.user.id,
      naslov: trimmedTitle,
      ocena: rating10,
      tekstKritike: trimmedCritiqueText,
      zakljucak: trimmedConclusion || null,
    });
  } else {
    await db
      .update(criticAlbumReview)
      .set({
        naslov: trimmedTitle,
        ocena: rating10,
        tekstKritike: trimmedCritiqueText,
        zakljucak: trimmedConclusion || null,
      })
      .where(
        and(
          eq(criticAlbumReview.albumId, parsed.data.albumId),
          eq(criticAlbumReview.userId, session.user.id),
        ),
      );
  }

  revalidatePath("/");
  revalidatePath(`/album/${parsed.data.albumSpotifyId}`);

  return {
    title: trimmedTitle,
    rating10,
    critiqueText: trimmedCritiqueText,
    conclusion: trimmedConclusion,
  };
}

export async function deleteCriticAlbumReview(input: {
  albumId: string;
  albumSpotifyId: string;
}): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "critic") {
    throw new Error("Only critics can delete album critiques");
  }

  await db
    .delete(criticAlbumReview)
    .where(
      and(
        eq(criticAlbumReview.albumId, input.albumId),
        eq(criticAlbumReview.userId, session.user.id),
      ),
    );

  revalidatePath("/");
  revalidatePath(`/album/${input.albumSpotifyId}`);
}

export async function saveCriticSongReview(
  input: CriticSongReviewInput,
): Promise<{
  title: string;
  rating10: number;
  critiqueText: string;
  conclusion: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "critic") {
    throw new Error("Only critics can submit song critiques");
  }

  const parsed = criticSongReviewInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Neispravan unos kritike",
    );
  }

  const trimmedTitle = parsed.data.title;
  const trimmedCritiqueText = parsed.data.critiqueText;
  const trimmedConclusion = parsed.data.conclusion;
  const rating10 = parsed.data.rating10;
  const existingReview = await getCriticSongReviewDraft(
    parsed.data.songId,
    session.user.id,
  );

  if (!existingReview) {
    await db.insert(criticSongReview).values({
      songId: parsed.data.songId,
      userId: session.user.id,
      naslov: trimmedTitle,
      ocena: rating10,
      tekstKritike: trimmedCritiqueText,
      zakljucak: trimmedConclusion || null,
    });
  } else {
    await db
      .update(criticSongReview)
      .set({
        naslov: trimmedTitle,
        ocena: rating10,
        tekstKritike: trimmedCritiqueText,
        zakljucak: trimmedConclusion || null,
      })
      .where(
        and(
          eq(criticSongReview.songId, parsed.data.songId),
          eq(criticSongReview.userId, session.user.id),
        ),
      );
  }

  revalidatePath("/");
  revalidatePath(`/song/${parsed.data.songSpotifyId}`);

  return {
    title: trimmedTitle,
    rating10,
    critiqueText: trimmedCritiqueText,
    conclusion: trimmedConclusion,
  };
}

export async function deleteCriticSongReview(input: {
  songId: string;
  songSpotifyId: string;
}): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "critic") {
    throw new Error("Only critics can delete song critiques");
  }

  await db
    .delete(criticSongReview)
    .where(
      and(
        eq(criticSongReview.songId, input.songId),
        eq(criticSongReview.userId, session.user.id),
      ),
    );

  revalidatePath("/");
  revalidatePath(`/song/${input.songSpotifyId}`);
}

export async function toggleAlbumReviewLike(reviewId: string): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return db.transaction(async (tx) => {
    const [review] = await tx
      .select({ userId: userAlbumReview.userId })
      .from(userAlbumReview)
      .where(eq(userAlbumReview.id, reviewId))
      .limit(1);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId === session.user.id) {
      throw new Error("You cannot like your own review");
    }

    const [existingLike] = await tx
      .select({ id: userAlbumReviewLikes.id })
      .from(userAlbumReviewLikes)
      .where(
        and(
          eq(userAlbumReviewLikes.reviewId, reviewId),
          eq(userAlbumReviewLikes.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existingLike) {
      await tx
        .delete(userAlbumReviewLikes)
        .where(eq(userAlbumReviewLikes.id, existingLike.id));
    } else {
      await tx.insert(userAlbumReviewLikes).values({
        reviewId,
        userId: session.user.id,
      });
    }

    const [countRow] = await tx
      .select({ value: count() })
      .from(userAlbumReviewLikes)
      .where(eq(userAlbumReviewLikes.reviewId, reviewId));

    return {
      liked: !existingLike,
      likeCount: Number(countRow?.value ?? 0),
    };
  });
}

export async function toggleCriticAlbumReviewLike(reviewId: string): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return db.transaction(async (tx) => {
    const [review] = await tx
      .select({ userId: criticAlbumReview.userId })
      .from(criticAlbumReview)
      .where(eq(criticAlbumReview.id, reviewId))
      .limit(1);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId === session.user.id) {
      throw new Error("You cannot like your own review");
    }

    const [existingLike] = await tx
      .select({ id: criticAlbumReviewLikes.id })
      .from(criticAlbumReviewLikes)
      .where(
        and(
          eq(criticAlbumReviewLikes.reviewId, reviewId),
          eq(criticAlbumReviewLikes.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existingLike) {
      await tx
        .delete(criticAlbumReviewLikes)
        .where(eq(criticAlbumReviewLikes.id, existingLike.id));
    } else {
      await tx.insert(criticAlbumReviewLikes).values({
        reviewId,
        userId: session.user.id,
      });
    }

    const [countRow] = await tx
      .select({ value: count() })
      .from(criticAlbumReviewLikes)
      .where(eq(criticAlbumReviewLikes.reviewId, reviewId));

    return {
      liked: !existingLike,
      likeCount: Number(countRow?.value ?? 0),
    };
  });
}

export async function toggleSongReviewLike(reviewId: string): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return db.transaction(async (tx) => {
    const [review] = await tx
      .select({ userId: userSongReview.userId })
      .from(userSongReview)
      .where(eq(userSongReview.id, reviewId))
      .limit(1);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId === session.user.id) {
      throw new Error("You cannot like your own review");
    }

    const [existingLike] = await tx
      .select({ id: userSongReviewLikes.id })
      .from(userSongReviewLikes)
      .where(
        and(
          eq(userSongReviewLikes.reviewId, reviewId),
          eq(userSongReviewLikes.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existingLike) {
      await tx
        .delete(userSongReviewLikes)
        .where(eq(userSongReviewLikes.id, existingLike.id));
    } else {
      await tx.insert(userSongReviewLikes).values({
        reviewId,
        userId: session.user.id,
      });
    }

    const [countRow] = await tx
      .select({ value: count() })
      .from(userSongReviewLikes)
      .where(eq(userSongReviewLikes.reviewId, reviewId));

    return {
      liked: !existingLike,
      likeCount: Number(countRow?.value ?? 0),
    };
  });
}

export async function toggleCriticSongReviewLike(reviewId: string): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return db.transaction(async (tx) => {
    const [review] = await tx
      .select({ userId: criticSongReview.userId })
      .from(criticSongReview)
      .where(eq(criticSongReview.id, reviewId))
      .limit(1);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId === session.user.id) {
      throw new Error("You cannot like your own review");
    }

    const [existingLike] = await tx
      .select({ id: criticSongReviewLikes.id })
      .from(criticSongReviewLikes)
      .where(
        and(
          eq(criticSongReviewLikes.reviewId, reviewId),
          eq(criticSongReviewLikes.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existingLike) {
      await tx
        .delete(criticSongReviewLikes)
        .where(eq(criticSongReviewLikes.id, existingLike.id));
    } else {
      await tx.insert(criticSongReviewLikes).values({
        reviewId,
        userId: session.user.id,
      });
    }

    const [countRow] = await tx
      .select({ value: count() })
      .from(criticSongReviewLikes)
      .where(eq(criticSongReviewLikes.reviewId, reviewId));

    return {
      liked: !existingLike,
      likeCount: Number(countRow?.value ?? 0),
    };
  });
}
