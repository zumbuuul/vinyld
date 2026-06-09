import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAlbumDetails } from "@/actions/catalog.actions";
import { ReviewForm } from "@/components/album/ReviewForm";

function AlbumPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-white/6 bg-[#171515] p-6 sm:p-8">
        Loading album...
      </div>
    </main>
  );
}

function formatReleaseYear(releaseDate: string | null): string {
  if (!releaseDate) {
    return "Unknown year";
  }

  return releaseDate.slice(0, 4);
}

function formatTrackDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return "--:--";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function AlbumDetailsView({ spotifyId }: { spotifyId: string }) {
  const album = await getAlbumDetails(spotifyId);

  if (!album) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/6 bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.14),_transparent_34%),#171515] p-4 shadow-[0_40px_140px_-60px_rgba(0,0,0,0.92)] sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:gap-8">
            <aside className="space-y-5 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,181,158,0.05),rgba(255,181,158,0)),#1a1717] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-sm text-[#ffb59e] transition hover:text-white">
                  Back to feed
                </Link>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
                  Album
                </p>
              </div>

              {album.imageUrl ? (
                <div className="overflow-hidden rounded-[24px] bg-[#0f0f0f] shadow-[0_20px_60px_-24px_rgba(255,127,92,0.45)]">
                  <img
                    src={album.imageUrl}
                    alt={album.name}
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
                  {album.name}
                </h2>
                <p className="text-lg text-[#d4b1a3]">
                  {album.artistDisplayName ?? "Unknown Artist"}{" "}
                  <span className="text-[#7f6a64]">
                    • {formatReleaseYear(album.releaseDate)}
                  </span>
                </p>
              </div>

              <div className="rounded-[22px] bg-[#211e1e] p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
                  Zanrovi
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {album.genres.length > 0 ? (
                    album.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-[#181616] px-3 py-1.5 text-xs text-[#e6beb2]"
                      >
                        {genre}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#8f7b74]">No genres yet.</span>
                  )}
                </div>
              </div>
            </aside>

            <ReviewForm />
          </div>

          <section className="mt-6 rounded-[28px] border border-white/6 bg-[#141313]/88 p-5 sm:mt-8 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
                  TrackList
                </p>
                <h3 className="mt-1 text-2xl font-serif text-[#f5ebe8]">
                  Pesme sa albuma
                </h3>
              </div>
              <p className="text-sm text-[#a68f87]">
                {album.totalTracks ?? album.tracks.length} tracks
              </p>
            </div>

            {album.tracks.length === 0 ? (
              <p className="mt-5 text-sm text-[#8f7b74]">No tracks stored yet.</p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[22px] border border-white/6">
                <ul className="divide-y divide-white/6">
                  {album.tracks.map((track) => (
                    <li key={track.id} className="bg-[#111010]">
                      <Link
                        href={`/song/${track.spotifyId}`}
                        className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-[#191717] sm:px-5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#f5ebe8]">
                            <span className="mr-2 text-[#8f7b74]">
                              {track.trackNumber ?? "?"}.
                            </span>
                            {track.name}
                          </p>
                          <p className="truncate text-xs text-[#a68f87]">
                            {track.artistDisplayName ?? album.artistDisplayName ?? "Unknown Artist"}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-[#8f7b74]">
                          {formatTrackDuration(track.durationMs)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ spotifyId: string }>;
}) {
  const { spotifyId } = await params;

  return (
    <Suspense fallback={<AlbumPageFallback />}>
      <AlbumDetailsView spotifyId={spotifyId} />
    </Suspense>
  );
}
