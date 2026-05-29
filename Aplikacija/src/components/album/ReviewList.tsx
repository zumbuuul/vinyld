"use client";

import { useState, useTransition } from "react";

import { getUserReviews } from "@/actions/album.actions";
import type { AlbumReviewPage, UserAlbumReview } from "@/features/album/album.types";

import { ReviewItem } from "./ReviewItem";

type ReviewListProps = {
  albumId: string;
  initialReviewPage: AlbumReviewPage<UserAlbumReview>;
  isAuthenticated: boolean;
  redirectUrl: string;
};

export function ReviewList({
  albumId,
  initialReviewPage,
  isAuthenticated,
  redirectUrl,
}: ReviewListProps) {
  const [reviewPage, setReviewPage] = useState(initialReviewPage);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (nextPage: number) => {
    if (isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const nextReviewPage = await getUserReviews(albumId, nextPage);

        setReviewPage(nextReviewPage);
      } catch {
        setError("Failed to load user reviews.");
      }
    });
  };

  const canGoBack = reviewPage.page > 1;
  const canGoForward = reviewPage.page < reviewPage.totalPages;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-serif font-semibold text-white">User Reviews</h2>
        <p className="text-xs text-[#e6beb2]">{reviewPage.totalCount} total</p>
      </div>

      {reviewPage.items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1c1b1b] p-4 text-sm text-[#e6beb2]">
          No user reviews yet.
        </div>
      ) : (
        <div className="space-y-3">
          {reviewPage.items.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              isAuthenticated={isAuthenticated}
              redirectUrl={redirectUrl}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canGoBack || isPending}
          onClick={() => handlePageChange(reviewPage.page - 1)}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#e6beb2] transition hover:border-[#ff8f6b]/60 hover:text-[#ffb59e] disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-xs text-[#e6beb2]">
          Page {reviewPage.page} / {reviewPage.totalPages}
        </span>
        <button
          type="button"
          disabled={!canGoForward || isPending}
          onClick={() => handlePageChange(reviewPage.page + 1)}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#e6beb2] transition hover:border-[#ff8f6b]/60 hover:text-[#ffb59e] disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {error ? <p className="text-xs text-[#ffb59e]">{error}</p> : null}
    </section>
  );
}
