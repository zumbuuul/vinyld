import Image from "next/image";

interface StarRatingProps {
  rating: number;
  starSrc: string;
}

export function StarRating({ rating, starSrc }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: Math.max(0, Math.min(rating, 5)) }).map((_, i) => (
        <Image
          key={i}
          src={starSrc}
          alt="star"
          width={12}
          height={11}
          unoptimized={true}
          className="w-[11.67px] h-[11.08px]"
        />
      ))}
    </div>
  );
}
