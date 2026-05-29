"use client";

import type { UserAlbumReview } from "@/features/album/album.types";

import { LikeButton } from "./LikeButton";

type ReviewItemProps = {
  review: UserAlbumReview;
  isAuthenticated: boolean;
  redirectUrl: string;
};

function renderStars(rating: number | null): string {
  if (rating === null) {
    return "No rating";
  }

  const filledStars = Math.max(0, Math.min(5, Math.round(rating / 2)));
  const emptyStars = 5 - filledStars;

  return `${"*".repeat(filledStars)}${"-".repeat(emptyStars)} (${rating}/10)`;
}

export function ReviewItem({
  review,
  isAuthenticated,
  redirectUrl,
}: ReviewItemProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#1c1b1b] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.userImage ? (
            <img
              src={review.userImage}
              alt={review.userName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a2a2a] text-xs text-[#ffb59e]">
              {review.userName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">{review.userName}</p>
            <p className="text-xs text-[#e6beb2]">{renderStars(review.ocena)}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-[#e6beb2]">
        {review.description ?? "No written description provided."}
      </p>

      <div className="mt-4">
        <LikeButton
          targetType="user_review"
          targetId={review.id}
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
          initialLiked={review.likedByCurrentUser}
          initialLikeCount={review.likeCount}
          compact
        />
      </div>
    </article>
  );
}
