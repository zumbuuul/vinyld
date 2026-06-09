"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveAlbumReview } from "@/actions/album.actions";
import {
  FormField,
  FormShell,
  HeartToggle,
  RatingInput,
  SubmitAction,
} from "@/components/album/form.shared";

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
      }
    });
  };

  return (
    <FormShell
      title="Nova Recenzija"
      description="Podeli svoje utiske."
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
          id="review-content"
          rows={10}
          placeholder="Sta mislis o albumu?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[280px] w-full resize-none rounded-[24px] border border-white/6 bg-[#101010] px-5 py-4 text-sm text-[#f5ebe8] outline-none transition placeholder:text-[#6f615d] focus:border-[#ff8f6a] sm:min-h-[340px] sm:text-base"
        />
      </FormField>

      <SubmitAction
        isAuthenticated={isAuthenticated}
        redirectUrl={redirectUrl}
        onAction={handleSubmit}
        disabled={isPending}
        pendingLabel="Cuvanje..."
        idleLabel="Objavi"
        className="h-11 w-full rounded-2xl bg-linear-to-r from-[#ffb59e] to-[#ff5d2d] text-xs uppercase tracking-[0.22em] text-[#341007] hover:from-[#ffbfa9] hover:to-[#ff6b3e]"
      />

      {submitError ? (
        <p className="text-sm text-[#ff9f87]">{submitError}</p>
      ) : null}
    </FormShell>
  );
}
