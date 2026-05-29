"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createAlbumReview,
  deleteAlbumReview,
  updateAlbumReview,
} from "@/actions/album.actions";

import { ProtectedAction } from "./ProtectedAction";

type ReviewFormProps = {
  albumId: string;
  existingReview: {
    id: string;
    ocena: number | null;
    liked: boolean;
    description: string | null;
  } | null;
  isAuthenticated: boolean;
  redirectUrl: string;
};

export function ReviewForm({
  albumId,
  existingReview,
  isAuthenticated,
  redirectUrl,
}: ReviewFormProps) {
  const router = useRouter();
  const [ratingInput, setRatingInput] = useState(
    existingReview?.ocena !== null && existingReview?.ocena !== undefined
      ? String(existingReview.ocena)
      : "",
  );
  const [liked, setLiked] = useState(existingReview?.liked ?? false);
  const [description, setDescription] = useState(existingReview?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    runProtectedAction: <T>(action: () => Promise<T>) => Promise<T | null>,
  ) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const parsedRating = ratingInput.trim().length === 0 ? null : Number(ratingInput);

        if (parsedRating !== null && Number.isNaN(parsedRating)) {
          setError("Rating must be a valid number.");
          return;
        }

        const result = await runProtectedAction(() => {
          if (existingReview) {
            return updateAlbumReview(
              existingReview.id,
              parsedRating,
              liked,
              description,
            );
          }

          return createAlbumReview(albumId, parsedRating, liked, description);
        });

        if (!result) {
          return;
        }

        if (!result.success) {
          setError(result.error);
          return;
        }

        setMessage(existingReview ? "Review updated." : "Review created.");
        router.refresh();
      } catch {
        setError("Failed to save review.");
      }
    });
  };

  const handleDelete = (
    runProtectedAction: <T>(action: () => Promise<T>) => Promise<T | null>,
  ) => {
    if (!existingReview || isPending) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await runProtectedAction(() => deleteAlbumReview(existingReview.id));

        if (!result) {
          return;
        }

        if (!result.success) {
          setError(result.error);
          return;
        }

        setMessage("Review deleted.");
        router.refresh();
      } catch {
        setError("Failed to delete review.");
      }
    });
  };

  return (
    <ProtectedAction isAuthenticated={isAuthenticated} redirectUrl={redirectUrl}>
      {(runProtectedAction) => (
        <section className="rounded-xl border border-white/10 bg-[#1c1b1b] p-4">
          <h2 className="text-lg font-serif font-semibold text-white">
            {existingReview ? "Edit your review" : "Write a review"}
          </h2>

          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => handleSubmit(event, runProtectedAction)}
          >
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                Rating (0-10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={1}
                value={ratingInput}
                onChange={(event) => setRatingInput(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-sm text-[#f6edea] focus:border-[#ff8f6b] focus:outline-none"
                placeholder="Optional"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="user-liked-toggle"
                type="checkbox"
                checked={liked}
                onChange={(event) => setLiked(event.target.checked)}
              />
              <label htmlFor="user-liked-toggle" className="text-sm text-[#e6beb2]">
                I like this album
              </label>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                Review
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                maxLength={2000}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-sm text-[#f6edea] focus:border-[#ff8f6b] focus:outline-none"
                placeholder="Tell everyone what you think."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-linear-to-r from-[#ffb59e] to-[#ff5717] px-4 py-2 text-sm font-semibold text-[#521300] disabled:opacity-60"
              >
                {existingReview ? "Update review" : "Create review"}
              </button>
              {existingReview ? (
                <button
                  type="button"
                  onClick={() => handleDelete(runProtectedAction)}
                  disabled={isPending}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[#e6beb2] transition hover:border-[#ff8f6b]/50 hover:text-[#ffb59e] disabled:opacity-60"
                >
                  Delete review
                </button>
              ) : null}
            </div>
          </form>

          {error ? <p className="mt-3 text-sm text-[#ffb59e]">{error}</p> : null}
          {message ? <p className="mt-3 text-sm text-[#9ed8c6]">{message}</p> : null}
        </section>
      )}
    </ProtectedAction>
  );
}
