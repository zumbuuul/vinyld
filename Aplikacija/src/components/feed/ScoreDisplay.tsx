const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function formatStarScore(rating10: number): string {
  const rating5 = rating10 / 2;

  return Number.isInteger(rating5) ? String(rating5) : rating5.toFixed(1);
}

function getStarFill(rating10: number, starIndex: number): number {
  const remaining = rating10 / 2 - starIndex;

  if (remaining >= 1) {
    return 1;
  }

  if (remaining >= 0.5) {
    return 0.5;
  }

  return 0;
}

function Star({
  fill,
}: {
  fill: number;
}) {
  return (
    <span className="relative block h-4 w-4">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4 fill-[#3b2b26]"
      >
        <path d={STAR_PATH} />
      </svg>
      {fill > 0 ? (
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-[#ffb59e]"
          >
            <path d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

export function ScoreDisplay({
  rating10,
  className = "",
}: {
  rating10: number | null;
  className?: string;
}) {
  if (rating10 === null) {
    return null;
  }

  return (
    <div
      aria-label={`${formatStarScore(rating10)} out of 5 stars`}
      className={`inline-flex items-center gap-1 ${className}`.trim()}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} fill={getStarFill(rating10, index)} />
      ))}
    </div>
  );
}
