import type { AlbumScore } from "@/features/album/album.types";

type ScoreDisplayProps = {
  userScore: AlbumScore;
  criticScore: AlbumScore;
};

function formatScore(score: AlbumScore): string {
  if (score.average === null || score.reviewCount === 0) {
    return "No reviews yet";
  }

  return `${score.average.toFixed(1)} / 10`;
}

function formatCountLabel(count: number): string {
  if (count === 1) {
    return "1 review";
  }

  return `${count} reviews`;
}

export function ScoreDisplay({ userScore, criticScore }: ScoreDisplayProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-xl border border-white/10 bg-[#1c1b1b] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">User Score</p>
        <p className="mt-2 text-2xl font-serif font-semibold text-white">
          {formatScore(userScore)}
        </p>
        <p className="mt-1 text-xs text-[#e6beb2]">{formatCountLabel(userScore.reviewCount)}</p>
      </article>

      <article className="rounded-xl border border-white/10 bg-[#1c1b1b] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">Critic Score</p>
        <p className="mt-2 text-2xl font-serif font-semibold text-white">
          {formatScore(criticScore)}
        </p>
        <p className="mt-1 text-xs text-[#e6beb2]">{formatCountLabel(criticScore.reviewCount)}</p>
      </article>
    </section>
  );
}
