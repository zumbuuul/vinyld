"use client";

import Link from "next/link";

import { ScoreDisplay } from "@/components/feed/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchResultItem } from "@/features/search/search.types";

function SearchResultCard({ item }: { item: SearchResultItem }) {
  return (
    <li className="rounded-[20px] bg-[#1c1b1b] p-3 sm:p-4">
      <Link
        href={item.href}
        className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center"
      >
        {item.imageUrl ? (
          <div className="overflow-hidden rounded-[14px] bg-[#131313]">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="aspect-square w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-[14px] bg-[#131313] text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
            No art
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#2a2a2a] px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-[#ffb59e]">
              {item.type}
            </span>
            {item.releaseYear ? (
              <span className="text-xs text-[#8f7b74]">{item.releaseYear}</span>
            ) : null}
          </div>
          <h3 className="mt-2 truncate text-2xl font-serif text-[#f5ebe8]">
            {item.name}
          </h3>
          <p className="mt-1 truncate text-sm text-[#d7b8ad]">
            {item.subtitle}
          </p>
          {item.averageRating !== null ? (
            <div className="mt-4 flex items-center gap-3">
              <ScoreDisplay
                rating10={item.averageRating}
                className="shrink-0"
              />
              <span className="text-xs text-[#a68f87]">Community rating</span>
            </div>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

function SearchResultsSkeleton() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="rounded-[20px] bg-[#1c1b1b] p-4">
          <div className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center">
            <Skeleton className="aspect-square w-full rounded-[14px] bg-[#2a2a2a]" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 bg-[#2a2a2a]" />
              <Skeleton className="h-10 w-2/3 bg-[#2a2a2a]" />
              <Skeleton className="h-4 w-1/2 bg-[#2a2a2a]" />
              <Skeleton className="h-4 w-28 bg-[#2a2a2a]" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SearchResultsList({
  items,
  isLoading,
  hasSearched,
  onNextPage,
  onPreviousPage,
  canGoBack,
  hasNextPage,
}: {
  items: SearchResultItem[];
  isLoading: boolean;
  hasSearched: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  canGoBack: boolean;
  hasNextPage: boolean;
}) {
  if (!hasSearched) {
    return (
      <section className="rounded-[28px] bg-[#1c1b1b] p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
          Results
        </p>
        <h2 className="mt-2 text-3xl font-serif text-[#f5ebe8]">
          Tune the chips, then surface the stack.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[#d7b8ad]">
          Choose a type, a release period, and a sorting mode.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] bg-[#1c1b1b] p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            Results
          </p>
          <h2 className="mt-2 text-3xl font-serif text-[#f5ebe8]">
            Best matches for this filter set
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canGoBack || isLoading}
            onClick={onPreviousPage}
          >
            ← Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || isLoading}
            onClick={onNextPage}
          >
            Next →
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <SearchResultsSkeleton />
        ) : items.length === 0 ? (
          <div className="rounded-[22px] bg-[#2a2a2a] p-6 text-sm text-[#d7b8ad]">
            No titles matched this search. Try a broader name or loosen one of
            the filters.
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <SearchResultCard
                key={`${item.type}-${item.spotifyId}`}
                item={item}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
