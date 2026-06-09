import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getSongDetails } from "@/actions/catalog.actions";

function SongPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-6 py-28 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl bg-[#1c1b1b] p-6">
        Loading song...
      </div>
    </main>
  );
}

function formatDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return "Unknown";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function SongDetailsView({ spotifyId }: { spotifyId: string }) {
  const song = await getSongDetails(spotifyId);

  if (!song) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#131313] px-6 py-28 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-[#1c1b1b] p-6">
        <Link href="/" className="text-sm text-[#ffb59e]">
          Back to feed
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {song.album.imageUrl ? (
            <img
              src={song.album.imageUrl}
              alt={song.album.name}
              className="h-32 w-32 rounded-xl object-cover"
            />
          ) : null}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
              Song test page
            </p>
            <h1 className="text-3xl font-serif font-bold">{song.name}</h1>
            <p className="text-lg text-[#e6beb2]">
              {song.artistDisplayName ?? "Unknown Artist"}
            </p>
            <ul className="space-y-1 text-sm text-white/70">
              <li>Spotify ID: {song.spotifyId}</li>
              <li>Duration: {formatDuration(song.durationMs)}</li>
              <li>Disc: {song.discNumber}</li>
              <li>Track number: {song.trackNumber ?? "Unknown"}</li>
              <li>
                Album:{" "}
                <Link
                  href={`/album/${song.album.spotifyId}`}
                  className="text-[#ffb59e]"
                >
                  {song.album.name}
                </Link>
              </li>
            </ul>
            {song.spotifyExternalUrl ? (
              <a
                href={song.spotifyExternalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm text-[#ffb59e]"
              >
                Open on Spotify
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ spotifyId: string }>;
}) {
  const { spotifyId } = await params;

  return (
    <Suspense fallback={<SongPageFallback />}>
      <SongDetailsView spotifyId={spotifyId} />
    </Suspense>
  );
}
