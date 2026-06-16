"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeSongFromStory } from "@/actions/story.actions";
import { Button } from "@/components/ui/button";

type StorySongListItem = {
  id: string;
  spotifyId: string;
  name: string;
  artistDisplayName: string | null;
  durationMs: number | null;
  trackNumber: number | null;
  discNumber: number;
  albumName: string;
  albumImageUrl: string | null;
};

function formatDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return "--:--";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function StorySongList({
  storyId,
  songs,
  isOwner,
}: {
  storyId: string;
  songs: StorySongListItem[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingSongId, setPendingSongId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (songId: string) => {
    setError(null);
    setPendingSongId(songId);

    startTransition(async () => {
      try {
        await removeSongFromStory(storyId, songId);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not remove this song from the story.",
        );
      } finally {
        setPendingSongId(null);
      }
    });
  };

  return (
    <section className="rounded-[32px] bg-[#1c1b1b] p-5 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            Song list
          </p>
          <h2 className="mt-2 text-3xl font-serif text-[#f5ebe8]">
            Tracks in this story
          </h2>
        </div>
        <p className="text-sm text-[#a68f87]">{songs.length} songs</p>
      </div>

      {songs.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-[#2a2a2a] px-4 py-5 text-sm text-[#d7b8ad]">
          This story does not have any songs yet.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {songs.map((song, index) => (
            <article
              key={song.id}
              className="flex items-center gap-3 rounded-2xl bg-[#2a2a2a] p-3"
            >
              {song.albumImageUrl ? (
                <img
                  src={song.albumImageUrl}
                  alt={song.albumName}
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[#1c1b1b] text-[10px] uppercase tracking-[0.22em] text-[#8f7b74]">
                  Song
                </div>
              )}

              <Link
                href={`/song/${song.spotifyId}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-base font-medium text-[#f5ebe8]">
                  {index + 1}.{" "}
                  {song.name}
                </p>
                <p className="mt-1 truncate text-sm text-[#d7b8ad]">
                  {song.artistDisplayName || "Unknown Artist"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[#8f7b74]">
                  <span>{song.albumName}</span>
                  <span>{formatDuration(song.durationMs)}</span>
                </div>
              </Link>

              {isOwner ? (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending && pendingSongId === song.id}
                  onClick={() => handleRemove(song.id)}
                  className="shrink-0 text-[#ffb59e] hover:bg-[#1c1b1b] hover:text-white"
                  aria-label={`Remove ${song.name} from story`}
                >
                  -
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {error ? <p className="mt-4 text-sm text-[#ffb59e]">{error}</p> : null}
    </section>
  );
}
