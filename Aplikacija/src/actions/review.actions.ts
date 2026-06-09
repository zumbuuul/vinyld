"use server";

import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { getAlbumRecentReviews } from "@/db/queries/review.query";
import { db } from "@/db/db";
import {
  criticAlbumReview,
  criticAlbumReviewLikes,
  userAlbumReview,
  userAlbumReviewLikes,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getRecentReviewsForAlbum(
  albumId: string,
  viewerId?: string | null,
) {
  return getAlbumRecentReviews(albumId, viewerId);
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
