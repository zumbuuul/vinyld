import type { AlbumTrack } from "@/features/album/album.types";

import { TrackItem } from "./TrackItem";

type TrackListProps = {
  tracks: AlbumTrack[];
  userId: string | null;
  isAuthenticated: boolean;
  redirectUrl: string;
};

export function TrackList({
  tracks,
  userId,
  isAuthenticated,
  redirectUrl,
}: TrackListProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-serif font-semibold text-white">Tracklist</h2>
      {tracks.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-[#e6beb2]">
          Track list is unavailable.
        </div>
      ) : (
        <ol className="space-y-2">
          {tracks.map((track) => (
            <TrackItem
              key={track.id}
              track={track}
              userId={userId}
              isAuthenticated={isAuthenticated}
              redirectUrl={redirectUrl}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
