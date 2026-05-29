"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createCriticAlbumReview,
  deleteCriticAlbumReview,
  updateCriticAlbumReview,
} from "@/actions/album.actions";

import { ProtectedAction } from "./ProtectedAction";

type CriticReviewFormProps = {
  albumId: string;
  existingReview: {
    id: string;
    naslov: string;
    ocena: number;
    tekstKritike: string;
    zakljucak: string | null;
  } | null;
  isAuthenticated: boolean;
  redirectUrl: string;
};

export function CriticReviewForm({
  albumId,
  existingReview,
  isAuthenticated,
  redirectUrl,
}: CriticReviewFormProps) {
  const router = useRouter();
  const [naslov, setNaslov] = useState(existingReview?.naslov ?? "");
  const [ocenaInput, setOcenaInput] = useState(
    existingReview ? String(existingReview.ocena) : "",
  );
  const [tekstKritike, setTekstKritike] = useState(
    existingReview?.tekstKritike ?? "",
  );
  const [zakljucak, setZakljucak] = useState(existingReview?.zakljucak ?? "");
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
        const parsedOcena = Number(ocenaInput);

        if (Number.isNaN(parsedOcena)) {
          setError("Rating must be a valid number.");
          return;
        }

        const result = await runProtectedAction(() => {
          if (existingReview) {
            return updateCriticAlbumReview(
              existingReview.id,
              naslov,
              parsedOcena,
              tekstKritike,
              zakljucak,
            );
          }

          return createCriticAlbumReview(
            albumId,
            naslov,
            parsedOcena,
            tekstKritike,
            zakljucak,
          );
        });

        if (!result) {
          return;
        }

        if (!result.success) {
          setError(result.error);
          return;
        }

        setMessage(existingReview ? "Critic review updated." : "Critic review created.");
        router.refresh();
      } catch {
        setError("Failed to save critic review.");
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
        const result = await runProtectedAction(() =>
          deleteCriticAlbumReview(existingReview.id),
        );

        if (!result) {
          return;
        }

        if (!result.success) {
          setError(result.error);
          return;
        }

        setMessage("Critic review deleted.");
        router.refresh();
      } catch {
        setError("Failed to delete critic review.");
      }
    });
  };

  return (
    <ProtectedAction isAuthenticated={isAuthenticated} redirectUrl={redirectUrl}>
      {(runProtectedAction) => (
        <section className="rounded-xl border border-white/10 bg-[#1c1b1b] p-4">
          <h2 className="text-lg font-serif font-semibold text-white">
            {existingReview ? "Edit critic review" : "Write critic review"}
          </h2>

          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => handleSubmit(event, runProtectedAction)}
          >
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                Title
              </label>
              <input
                type="text"
                value={naslov}
                onChange={(event) => setNaslov(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-sm text-[#f6edea] focus:border-[#ff8f6b] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                Rating (0-10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={1}
                value={ocenaInput}
                onChange={(event) => setOcenaInput(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-sm text-[#f6edea] focus:border-[#ff8f6b] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                Critique text
              </label>
              <textarea
                value={tekstKritike}
                onChange={(event) => setTekstKritike(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-sm text-[#f6edea] focus:border-[#ff8f6b] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                Conclusion
              </label>
              <textarea
                value={zakljucak}
                onChange={(event) => setZakljucak(event.target.value)}
                rows={2}
                maxLength={255}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#151515] px-3 py-2 text-sm text-[#f6edea] focus:border-[#ff8f6b] focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-linear-to-r from-[#ffb59e] to-[#ff5717] px-4 py-2 text-sm font-semibold text-[#521300] disabled:opacity-60"
              >
                {existingReview ? "Update critic review" : "Create critic review"}
              </button>
              {existingReview ? (
                <button
                  type="button"
                  onClick={() => handleDelete(runProtectedAction)}
                  disabled={isPending}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[#e6beb2] transition hover:border-[#ff8f6b]/50 hover:text-[#ffb59e] disabled:opacity-60"
                >
                  Delete critic review
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
