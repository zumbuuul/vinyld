import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getSongDetails } from "@/actions/catalog.actions";
import { getRecentReviewsForSong } from "@/actions/review.actions";
import { CriticSongReviewForm } from "@/components/song/CriticSongReviewForm";
import { SongReviewForm } from "@/components/song/SongReviewForm";
import { RecentReviewsList } from "@/components/reviews/RecentReviewsList";
import {
  getCriticSongReviewDraft,
  getUserSongReviewDraft,
} from "@/db/queries/catalog.queries";
import { getUserPreferences } from "@/db/queries/users.queries";
import { getCurrentSession } from "@/lib/session";

function SongPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-white/6 bg-[#171515] p-6 sm:p-8">
        Loading song...
      </div>
    </main>
  );
}

function formatDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return "--:--";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function SongDetailsView({
  params,
}: {
  params: Promise<{ spotifyId: string }>;
}) {
  const { spotifyId } = await params;
  const [song, session] = await Promise.all([
    getSongDetails(spotifyId),
    getCurrentSession(),
  ]);

  if (!song) {
    notFound();
  }

  const [preferences, existingReview, existingCritique, recentReviews] =
    await Promise.all([
      session ? getUserPreferences(session.user.id) : null,
      session ? getUserSongReviewDraft(song.id, session.user.id) : null,
      session ? getCriticSongReviewDraft(song.id, session.user.id) : null,
      getRecentReviewsForSong(song.id, session?.user.id ?? null),
    ]);

  const role = preferences?.role ?? null;

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/6 bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.14),_transparent_34%),#171515] p-4 shadow-[0_40px_140px_-60px_rgba(0,0,0,0.92)] sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:gap-8">
            <aside className="space-y-5 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,181,158,0.05),rgba(255,181,158,0)),#1a1717] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="text-sm text-[#ffb59e] transition hover:text-white"
                >
                  Back to feed
                </Link>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
                  Song
                </p>
              </div>

              {song.album.imageUrl ? (
                <div className="overflow-hidden rounded-[24px] bg-[#0f0f0f] shadow-[0_20px_60px_-24px_rgba(255,127,92,0.45)]">
                  <img
                    src={song.album.imageUrl}
                    alt={song.album.name}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-[24px] bg-[#0f0f0f] text-xs uppercase tracking-[0.28em] text-[#8f7b74]">
                  No artwork
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-3xl font-serif leading-tight text-[#f5ebe8]">
                  {song.name}
                </h2>
                <p className="text-lg text-[#d4b1a3]">
                  {song.artistDisplayName ?? "Unknown Artist"}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/6 bg-[#111010] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                  Details
                </p>
                <dl className="mt-3 space-y-3 text-sm text-[#d7b8ad]">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8f7b74]">Duration</dt>
                    <dd>{formatDuration(song.durationMs)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8f7b74]">Disc</dt>
                    <dd>{song.discNumber}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#8f7b74]">Track</dt>
                    <dd>{song.trackNumber ?? "Unknown"}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-[#8f7b74]">Album</dt>
                    <dd>
                      <Link
                        href={`/album/${song.album.spotifyId}`}
                        className="text-[#ffb59e] transition hover:text-white"
                      >
                        {song.album.name}
                      </Link>
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>

            <div className="space-y-6">
              {session && role !== "critic" ? (
                <SongReviewForm
                  songId={song.id}
                  songSpotifyId={song.spotifyId}
                  initialLiked={existingReview?.liked ?? false}
                  initialRating10={existingReview?.rating10 ?? 0}
                  initialDescription={existingReview?.description ?? ""}
                  hasExistingReview={Boolean(existingReview)}
                  isAuthenticated
                  redirectUrl={`/song/${song.spotifyId}`}
                />
              ) : null}

              {session && role === "critic" ? (
                <CriticSongReviewForm
                  songId={song.id}
                  songSpotifyId={song.spotifyId}
                  initialTitle={existingCritique?.title ?? ""}
                  initialRating10={existingCritique?.rating10 ?? 0}
                  initialCritiqueText={existingCritique?.critiqueText ?? ""}
                  initialConclusion={existingCritique?.conclusion ?? ""}
                  hasExistingReview={Boolean(existingCritique)}
                  isAuthenticated
                  redirectUrl={`/song/${song.spotifyId}`}
                />
              ) : null}
            </div>
          </div>

          <RecentReviewsList
            reviews={recentReviews}
            isAuthenticated={Boolean(session)}
            redirectUrl={`/song/${song.spotifyId}`}
            reviewSubject="song"
            eyebrow="Recenzije"
            title="Skoriji utisci o pesmi"
            emptyText="Jos nema recenzija za ovu pesmu."
            countLabel="reviews"
            likedPositiveLabel="Liked song"
            likedNegativeLabel="Did not like song"
          />
        </div>
      </div>
    </main>
  );
}

export default function SongPage({
  params,
}: {
  params: Promise<{ spotifyId: string }>;
}) {
  return (
    <Suspense fallback={<SongPageFallback />}>
      <SongDetailsView params={params} />
    </Suspense>
  );
}
