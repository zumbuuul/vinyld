"use client";

import type { CriticAlbumReview } from "@/features/album/album.types";

import { LikeButton } from "./LikeButton";

type CriticReviewItemProps = {
  review: CriticAlbumReview;
  isAuthenticated: boolean;
  redirectUrl: string;
};

function renderStars(rating: number): string {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating / 2)));
  const emptyStars = 5 - filledStars;

  return `${"*".repeat(filledStars)}${"-".repeat(emptyStars)} (${rating}/10)`;
}

export function CriticReviewItem({
  review,
  isAuthenticated,
  redirectUrl,
}: CriticReviewItemProps) {
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

      <h3 className="mt-3 text-base font-semibold text-white">{review.naslov}</h3>
      <p className="mt-2 text-sm text-[#e6beb2]">{review.tekstKritike}</p>
      <p className="mt-2 text-sm text-[#f6edea]">
        <span className="font-semibold text-[#ffb59e]">Conclusion: </span>
        {review.zakljucak ?? "No conclusion provided."}
      </p>

      <div className="mt-4">
        <LikeButton
          targetType="critic_review"
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
