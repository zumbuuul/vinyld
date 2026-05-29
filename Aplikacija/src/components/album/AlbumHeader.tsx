import { LikeButton } from "./LikeButton";

type AlbumHeaderProps = {
  albumId: string;
  albumName: string;
  albumImageUrl: string | null;
  artists: string[];
  releaseYear: number | null;
  genres: string[];
  isAuthenticated: boolean;
  redirectUrl: string;
  initialLiked: boolean;
};

export function AlbumHeader({
  albumId,
  albumName,
  albumImageUrl,
  artists,
  releaseYear,
  genres,
  isAuthenticated,
  redirectUrl,
  initialLiked,
}: AlbumHeaderProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#1c1b1b] p-5 md:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="h-44 w-44 shrink-0 overflow-hidden rounded-xl bg-[#2a2a2a]">
          {albumImageUrl ? (
            <img
              src={albumImageUrl}
              alt={albumName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
              No cover
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#ffb59e]">Album</p>
            <h1 className="mt-2 text-3xl font-serif font-bold text-white md:text-4xl">
              {albumName}
            </h1>
            <p className="mt-2 text-sm text-[#e6beb2]">
              {artists.length > 0 ? artists.join(", ") : "Unknown artist"}
              {releaseYear ? ` - ${releaseYear}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {genres.length > 0 ? (
              genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-[#e6beb2]"
                >
                  {genre}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-[#e6beb2]">
                Genre unavailable
              </span>
            )}
          </div>

          <LikeButton
            targetType="album"
            targetId={albumId}
            isAuthenticated={isAuthenticated}
            redirectUrl={redirectUrl}
            initialLiked={initialLiked}
          />
        </div>
      </div>
    </section>
  );
}
