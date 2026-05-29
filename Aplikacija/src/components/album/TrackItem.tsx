import Link from "next/link";

import type { AlbumTrack } from "@/features/album/album.types";

import { AddToPlaylistPopover } from "./AddToPlaylistPopover";

type TrackItemProps = {
  track: AlbumTrack;
  userId: string | null;
  isAuthenticated: boolean;
  redirectUrl: string;
};

function formatDuration(durationMs: number): string {
  if (!durationMs || durationMs < 0) {
    return "--:--";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TrackItem({
  track,
  userId,
  isAuthenticated,
  redirectUrl,
}: TrackItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-[#e6beb2]">Track {track.trackNumber}</p>
        <Link
          href={`/song/${track.spotifyId}`}
          className="block truncate text-sm font-semibold text-[#f6edea] transition hover:text-[#ffb59e]"
        >
          {track.name}
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#e6beb2]">{formatDuration(track.durationMs)}</span>
        <AddToPlaylistPopover
          songSpotifyId={track.spotifyId}
          userId={userId}
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
        />
      </div>
    </li>
  );
}
