"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteSongReview, saveSongReview } from "@/actions/review.actions";
import {
  FormField,
  FormShell,
  HeartToggle,
  RatingInput,
  SubmitAction,
} from "@/components/album/form.shared";
import { songReviewInputSchema } from "@/features/album/review.schemas";

export function SongReviewForm({
  songId,
  songSpotifyId,
  initialLiked,
  initialRating10,
  initialDescription,
  hasExistingReview,
  isAuthenticated,
  redirectUrl,
}: {
  songId: string;
  songSpotifyId: string;
  initialLiked: boolean;
  initialRating10: number;
  initialDescription: string;
  hasExistingReview: boolean;
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

    const parsed = songReviewInputSchema.safeParse({
      songId,
      songSpotifyId,
      rating10,
      liked,
      description,
    });

    if (!parsed.success) {
      setSubmitError(
        parsed.error.issues[0]?.message ?? "Neispravan unos recenzije.",
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveSongReview(parsed.data);

        setLiked(result.liked);
        setRating10(result.rating10);
        setDescription(result.description);
        router.refresh();
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Nismo uspeli da sacuvamo recenziju.",
        );
      }
    });
  };

  const handleDelete = () => {
    setSubmitError(null);

    startTransition(async () => {
      try {
        await deleteSongReview({
          songId,
          songSpotifyId,
        });

        setLiked(false);
        setRating10(1);
        setDescription("");
        router.refresh();
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Nismo uspeli da obrisemo recenziju.",
        );
      }
    });
  };

  return (
    <FormShell
      title="Nova Recenzija"
      description="Podeli svoje utiske o pesmi."
      className="border border-white/6 bg-[#141313]/95 text-[#f5ebe8]"
    >
      <div className="flex items-start justify-between gap-4">
        <div />
        <HeartToggle
          filled={liked}
          disabled={isPending}
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
          onAction={handleToggleLike}
        />
      </div>

      <RatingInput
        rating10={rating10}
        onChange={setRating10}
        label="Tvoja ocena"
        labelClassName="text-[11px] uppercase tracking-[0.28em] text-[#9f8a82]"
        valueClassName="text-sm text-[#c9b0a7]"
        emptyStarClassName="text-[#8f7269]"
        filledStarClassName="fill-[#ffb59e] text-[#ffb59e]"
      />

      <FormField
        label="Sadrzaj recenzije"
        labelClassName="text-[11px] uppercase tracking-[0.28em] text-[#9f8a82]"
      >
        <textarea
          id="song-review-content"
          rows={10}
          placeholder="Sta mislis o pesmi?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[280px] w-full resize-none rounded-[24px] border border-white/6 bg-[#101010] px-5 py-4 text-sm text-[#f5ebe8] outline-none transition placeholder:text-[#6f615d] focus:border-[#ff8f6a] sm:min-h-[340px] sm:text-base"
        />
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitAction
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
          onAction={handleSubmit}
          disabled={isPending}
          pendingLabel="Cuvanje..."
          idleLabel="Objavi"
          className="h-11 w-full rounded-2xl bg-linear-to-r from-[#ffb59e] to-[#ff5d2d] text-xs uppercase tracking-[0.22em] text-[#341007] hover:from-[#ffbfa9] hover:to-[#ff6b3e] sm:flex-1"
        />
        {hasExistingReview ? (
          <SubmitAction
            isAuthenticated={isAuthenticated}
            redirectUrl={redirectUrl}
            onAction={handleDelete}
            disabled={isPending}
            pendingLabel="Brisanje..."
            idleLabel="Obrisi"
            className="h-11 w-full rounded-2xl border border-[#4a2e28] bg-transparent text-xs uppercase tracking-[0.22em] text-[#ffb59e] hover:bg-[#241714] sm:w-auto sm:px-6"
          />
        ) : null}
      </div>

      {submitError ? (
        <p className="text-sm text-[#ff9f87]">{submitError}</p>
      ) : null}
    </FormShell>
  );
}
