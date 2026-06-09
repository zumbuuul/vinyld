"use client";

<<<<<<< HEAD
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
=======
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveAlbumReview } from "@/actions/album.actions";
import { ProtectedAction } from "@/components/ProtectedAction";
import { Button } from "@/components/ui/button";

const STAR_PATH =
  "M12 3.75 14.6 9l5.8.84-4.2 4.1.99 5.78L12 16.98l-5.19 2.74.99-5.78-4.2-4.1L9.4 9Z";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${
        filled ? "fill-[#ff8f6a] text-[#ff8f6a]" : "fill-none text-[#8f7269]"
      }`}
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 20.5 4.8 13.9a4.9 4.9 0 0 1 0-7 4.95 4.95 0 0 1 6.97 0L12 7.14l.23-.24a4.95 4.95 0 0 1 6.97 0 4.9 4.9 0 0 1 0 7Z" />
    </svg>
  );
}

function getStarFill(rating10: number, starIndex: number): number {
  const remaining = rating10 / 2 - starIndex;

  if (remaining >= 1) {
    return 1;
  }

  if (remaining >= 0.5) {
    return 0.5;
  }

  return 0;
}

function StarButton({
  fill,
  onSelect,
}: {
  fill: number;
  onSelect: (rating10: number) => void;
}) {
  return (
    <div className="relative h-7 w-7">
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7 fill-none text-[#8f7269]"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d={STAR_PATH} />
      </svg>
      {fill > 0 ? (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 fill-[#ffb59e] text-[#ffb59e]"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => onSelect(1)}
        className="absolute inset-y-0 left-0 w-1/2"
        aria-label="Select half star"
      />
      <button
        type="button"
        onClick={() => onSelect(2)}
        className="absolute inset-y-0 right-0 w-1/2"
        aria-label="Select full star"
      />
    </div>
  );
}

export function ReviewForm({
  albumId,
  albumSpotifyId,
  initialLiked,
  initialRating10,
  initialDescription,
  isAuthenticated,
  redirectUrl,
}: {
  albumId: string;
  albumSpotifyId: string;
  initialLiked: boolean;
  initialRating10: number;
  initialDescription: string;
  isAuthenticated: boolean;
  redirectUrl: string;
}) {
  const router = useRouter();
  const [rating10, setRating10] = useState(initialRating10);
  const [liked, setLiked] = useState(initialLiked);
  const [description, setDescription] = useState(initialDescription);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleLike = () => {
    setLiked((currentLiked) => !currentLiked);
  };

  const handleSubmit = () => {
    setSubmitError(null);

    startTransition(async () => {
      try {
        const result = await saveAlbumReview({
          albumId,
          albumSpotifyId,
          rating10,
          liked,
          description,
        });

        setLiked(result.liked);
        setRating10(result.rating10);
        setDescription(result.description);
        router.refresh();
      } catch {
        setSubmitError("Nismo uspeli da sacuvamo recenziju.");
>>>>>>> albumpage
      }
    });
  };

  return (
<<<<<<< HEAD
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
=======
    <section className="space-y-6 rounded-[28px] border border-white/6 bg-[#141313]/95 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif leading-none text-[#f5ebe8] sm:text-5xl">
            Nova Recenzija
          </h1>
          <p className="max-w-xl text-sm text-[#c9b0a7] sm:text-base">
            Podeli svoje utiske.
          </p>
        </div>
        <ProtectedAction
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
          onAction={handleToggleLike}
        >
          {({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              disabled={isPending}
              aria-pressed={liked}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/8 bg-[#1d1b1b] transition hover:bg-[#262323] disabled:opacity-60"
            >
              <HeartIcon filled={liked} />
            </button>
          )}
        </ProtectedAction>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#9f8a82]">
          Tvoja ocena
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }, (_, index) => (
            <StarButton
              key={index}
              fill={getStarFill(rating10, index)}
              onSelect={(value) => setRating10(index * 2 + value)}
            />
          ))}
        </div>
        <p className="text-sm text-[#c9b0a7]">{(rating10 / 2).toFixed(1)} / 5</p>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="review-content"
          className="text-[11px] uppercase tracking-[0.28em] text-[#9f8a82]"
        >
          Sadrzaj recenzije
        </label>
        <textarea
          id="review-content"
          rows={10}
          placeholder="Sta mislis o albumu?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[280px] w-full resize-none rounded-[24px] border border-white/6 bg-[#101010] px-5 py-4 text-sm text-[#f5ebe8] outline-none transition placeholder:text-[#6f615d] focus:border-[#ff8f6a] sm:min-h-[340px] sm:text-base"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ProtectedAction
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
          onAction={handleSubmit}
        >
          {({ onClick }) => (
            <Button
              onClick={onClick}
              disabled={isPending}
              className="h-11 flex-1 rounded-2xl bg-linear-to-r from-[#ffb59e] to-[#ff5d2d] text-xs uppercase tracking-[0.22em] text-[#341007] hover:from-[#ffbfa9] hover:to-[#ff6b3e]"
            >
              {isPending ? "Cuvanje..." : "Objavi"}
            </Button>
          )}
        </ProtectedAction>
      </div>

      {submitError ? (
        <p className="text-sm text-[#ff9f87]">{submitError}</p>
      ) : null}
    </section>
>>>>>>> albumpage
  );
}
