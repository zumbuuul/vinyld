import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAlbumDetails } from "@/actions/catalog.actions";

function AlbumPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-6 py-28 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#1c1b1b] p-6">
        Loading album...
      </div>
    </main>
  );
}

async function AlbumDetailsView({ spotifyId }: { spotifyId: string }) {
  const album = await getAlbumDetails(spotifyId);

  if (!album) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#131313] px-6 py-28 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl bg-[#1c1b1b] p-6">
        <Link href="/" className="text-sm text-[#ffb59e]">
          Back to feed
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {album.imageUrl ? (
            <img
              src={album.imageUrl}
              alt={album.name}
              className="h-40 w-40 rounded-xl object-cover"
            />
          ) : null}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
              Album test page
            </p>
            <h1 className="text-3xl font-serif font-bold">{album.name}</h1>
            <p className="text-lg text-[#e6beb2]">
              {album.artistDisplayName ?? "Unknown Artist"}
            </p>
            <ul className="space-y-1 text-sm text-white/70">
              <li>Spotify ID: {album.spotifyId}</li>
              <li>Release date: {album.releaseDate ?? "Unknown"}</li>
              <li>Type: {album.albumType ?? "Unknown"}</li>
              <li>Total tracks: {album.totalTracks ?? album.tracks.length}</li>
              <li>
                Genres: {album.genres.length > 0 ? album.genres.join(", ") : "None"}
              </li>
            </ul>
            {album.spotifyExternalUrl ? (
              <a
                href={album.spotifyExternalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm text-[#ffb59e]"
              >
                Open on Spotify
              </a>
            ) : null}
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Tracks</h2>
          {album.tracks.length === 0 ? (
            <p className="text-sm text-white/60">No tracks stored yet.</p>
          ) : (
            <ul className="space-y-2">
              {album.tracks.map((track) => (
                <li
                  key={track.id}
                  className="rounded-xl bg-[#131313] px-4 py-3 text-sm text-white/80"
                >
                  <Link
                    href={`/song/${track.spotifyId}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <span>
                      {track.discNumber}.{track.trackNumber ?? "?"} {track.name}
                    </span>
                    <span className="text-xs text-[#e6beb2]">
                      {track.artistDisplayName ?? "Unknown Artist"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
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
