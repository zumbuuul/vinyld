"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteCriticAlbumReview,
  saveCriticAlbumReview,
} from "@/actions/review.actions";
import {
  FormField,
  FormShell,
  RatingInput,
  SubmitAction,
} from "@/components/album/form.shared";
import { criticAlbumReviewInputSchema } from "@/features/album/review.schemas";

export function CriticReviewForm({
  albumId,
  albumSpotifyId,
  initialTitle,
  initialRating10,
  initialCritiqueText,
  initialConclusion,
  hasExistingReview,
  isAuthenticated,
  redirectUrl,
}: {
  albumId: string;
  albumSpotifyId: string;
  initialTitle: string;
  initialRating10: number;
  initialCritiqueText: string;
  initialConclusion: string;
  hasExistingReview: boolean;
  isAuthenticated: boolean;
  redirectUrl: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [rating10, setRating10] = useState(initialRating10);
  const [critiqueText, setCritiqueText] = useState(initialCritiqueText);
  const [conclusion, setConclusion] = useState(initialConclusion);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setSubmitError(null);

    const parsed = criticAlbumReviewInputSchema.safeParse({
      albumId,
      albumSpotifyId,
      title,
      rating10,
      critiqueText,
      conclusion,
    });

    if (!parsed.success) {
      setSubmitError(
        parsed.error.issues[0]?.message ?? "Neispravan unos kritike.",
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveCriticAlbumReview(parsed.data);

        setTitle(result.title);
        setRating10(result.rating10);
        setCritiqueText(result.critiqueText);
        setConclusion(result.conclusion);
        router.refresh();
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Nismo uspeli da sacuvamo kritiku.",
        );
      }
    });
  };

  const handleDelete = () => {
    setSubmitError(null);

    startTransition(async () => {
      try {
        await deleteCriticAlbumReview({
          albumId,
          albumSpotifyId,
        });

        setTitle("");
        setRating10(1);
        setCritiqueText("");
        setConclusion("");
        router.refresh();
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Nismo uspeli da obrisemo kritiku.",
        );
      }
    });
  };

  return (
    <FormShell
      title="Nova Kritika"
      description="Napisi profesionalni osvrt na album."
      className="border border-[#8d5bff]/35 bg-[linear-gradient(180deg,rgba(141,91,255,0.12),rgba(141,91,255,0.03)),#141313] text-[#f2ecff]"
    >
      <FormField
        label="Naslov"
        labelClassName="text-[11px] uppercase tracking-[0.28em] text-[#b89cff]"
      >
        <input
          id="critique-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Kako bi naslovio kritiku?"
          className="h-12 w-full rounded-[20px] border border-[#8d5bff]/25 bg-[#101010] px-4 text-sm text-[#f2ecff] outline-none transition placeholder:text-[#7f70a0] focus:border-[#b89cff] sm:text-base"
        />
      </FormField>

      <RatingInput
        rating10={rating10}
        onChange={setRating10}
        label="Ocena kritike"
        labelClassName="text-[11px] uppercase tracking-[0.28em] text-[#b89cff]"
        valueClassName="text-sm text-[#d9cdfc]"
        emptyStarClassName="text-[#8d5bff]"
        filledStarClassName="fill-[#c6b0ff] text-[#c6b0ff]"
      />

      <FormField
        label="Tekst kritike"
        labelClassName="text-[11px] uppercase tracking-[0.28em] text-[#b89cff]"
      >
        <textarea
          id="critique-content"
          rows={10}
          placeholder="Napisi detaljnu kritiku albuma."
          value={critiqueText}
          onChange={(event) => setCritiqueText(event.target.value)}
          className="min-h-[260px] w-full resize-none rounded-[24px] border border-[#8d5bff]/20 bg-[#101010] px-5 py-4 text-sm text-[#f2ecff] outline-none transition placeholder:text-[#7f70a0] focus:border-[#b89cff] sm:min-h-[320px] sm:text-base"
        />
      </FormField>

      <FormField
        label="Zakljucak"
        labelClassName="text-[11px] uppercase tracking-[0.28em] text-[#b89cff]"
      >
        <textarea
          id="critique-conclusion"
          rows={4}
          placeholder="Kratak zavrsni zakljucak."
          value={conclusion}
          onChange={(event) => setConclusion(event.target.value)}
          className="min-h-[120px] w-full resize-none rounded-[24px] border border-[#8d5bff]/20 bg-[#101010] px-5 py-4 text-sm text-[#f2ecff] outline-none transition placeholder:text-[#7f70a0] focus:border-[#b89cff] sm:text-base"
        />
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitAction
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
          onAction={handleSubmit}
          disabled={isPending}
          pendingLabel="Cuvanje..."
          idleLabel="Objavi kritiku"
          className="h-11 w-full rounded-2xl bg-linear-to-r from-[#c6b0ff] to-[#8d5bff] text-xs uppercase tracking-[0.22em] text-[#170a35] hover:from-[#d1c0ff] hover:to-[#9b6fff] sm:flex-1"
        />
        {hasExistingReview ? (
          <SubmitAction
            isAuthenticated={isAuthenticated}
            redirectUrl={redirectUrl}
            onAction={handleDelete}
            disabled={isPending}
            pendingLabel="Brisanje..."
            idleLabel="Obrisi"
            className="h-11 w-full rounded-2xl border border-[#5f4a96] bg-transparent text-xs uppercase tracking-[0.22em] text-[#d9cdfc] hover:bg-[#221a33] sm:w-auto sm:px-6"
          />
        ) : null}
      </div>

      {submitError ? (
        <p className="text-sm text-[#d7c4ff]">{submitError}</p>
      ) : null}
    </FormShell>
  );
}
