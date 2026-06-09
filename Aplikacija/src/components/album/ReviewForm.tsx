"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

const STAR_PATH =
  "M12 3.75 14.6 9l5.8.84-4.2 4.1.99 5.78L12 16.98l-5.19 2.74.99-5.78-4.2-4.1L9.4 9Z";

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

function StarButton({
  fill,
  onSelect,
}: {
  fill: number;
  onSelect: (rating10: number) => void;
}) {
  return (
    <div className="relative h-7 w-7">
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7 fill-none text-[#8f7269]"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d={STAR_PATH} />
      </svg>
      {fill > 0 ? (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 fill-[#ffb59e] text-[#ffb59e]"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => onSelect(1)}
        className="absolute inset-y-0 left-0 w-1/2"
        aria-label="Select half star"
      />
      <button
        type="button"
        onClick={() => onSelect(2)}
        className="absolute inset-y-0 right-0 w-1/2"
        aria-label="Select full star"
      />
    </div>
  );
}

export function ReviewForm() {
  const [rating10, setRating10] = useState(8);

  return (
    <section className="space-y-6 rounded-[28px] border border-white/6 bg-[#141313]/95 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] sm:p-7">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif leading-none text-[#f5ebe8] sm:text-5xl">
          Nova Recenzija
        </h1>
        <p className="max-w-xl text-sm text-[#c9b0a7] sm:text-base">
          Podeli svoje utiske.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#9f8a82]">
          Tvoja ocena
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }, (_, index) => (
            <StarButton
              key={index}
              fill={getStarFill(rating10, index)}
              onSelect={(value) => setRating10(index * 2 + value)}
            />
          ))}
        </div>
        <p className="text-sm text-[#c9b0a7]">{(rating10 / 2).toFixed(1)} / 5</p>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="review-content"
          className="text-[11px] uppercase tracking-[0.28em] text-[#9f8a82]"
        >
          Sadrzaj recenzije
        </label>
        <textarea
          id="review-content"
          rows={10}
          placeholder="Sta mislis o albumu?"
          className="min-h-[280px] w-full resize-none rounded-[24px] border border-white/6 bg-[#101010] px-5 py-4 text-sm text-[#f5ebe8] outline-none transition placeholder:text-[#6f615d] focus:border-[#ff8f6a] sm:min-h-[340px] sm:text-base"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="h-11 flex-1 rounded-2xl bg-linear-to-r from-[#ffb59e] to-[#ff5d2d] text-xs uppercase tracking-[0.22em] text-[#341007] hover:from-[#ffbfa9] hover:to-[#ff6b3e]">
          Objavi
        </Button>
      </div>
    </section>
  );
}
