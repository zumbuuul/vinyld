"use client";

import { useMemo, useState, useTransition } from "react";

import { searchCatalogPage } from "@/actions/search.actions";
import { SearchFilterChip } from "@/components/search/SearchFilterChip";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { Button } from "@/components/ui/button";
import type {
  SearchFilterState,
  SearchPeriodFilter,
  SearchSortFilter,
  SearchResultsPage,
  SearchTypeFilter,
} from "@/features/search/search.types";

const DEFAULT_FILTERS: SearchFilterState = {
  type: "all",
  period: "all",
  sort: "relevance",
};

const typeOptions: Array<{ label: string; value: SearchTypeFilter }> = [
  { label: "All", value: "all" },
  { label: "Album", value: "album" },
  { label: "Song", value: "song" },
];

const periodOptions: Array<{ label: string; value: SearchPeriodFilter }> = [
  { label: "All time", value: "all" },
  { label: "2020s", value: "2020s" },
  { label: "2010s", value: "2010s" },
  { label: "2000s", value: "2000s" },
  { label: "1990s", value: "1990s" },
  { label: "1980s", value: "1980s" },
  { label: "1970s", value: "1970s" },
  { label: "1960s", value: "1960s" },
  { label: "1950s", value: "1950s" },
];

const sortOptions: Array<{ label: string; value: SearchSortFilter }> = [
  { label: "Relevance", value: "relevance" },
  { label: "Rating ↑", value: "ratingAsc" },
  { label: "Rating ↓", value: "ratingDesc" },
  { label: "Popularity", value: "popularity" },
];

export function SearchExplorer() {
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const [resultsPage, setResultsPage] = useState<SearchResultsPage>({
    items: [],
    nextCursor: null,
  });
  const [pageHistory, setPageHistory] = useState<Array<number | null>>([null]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const selectedTypeLabel = useMemo(
    () =>
      typeOptions.find((option) => option.value === filters.type)?.label ??
      "All",
    [filters.type],
  );
  const selectedPeriodLabel = useMemo(
    () =>
      periodOptions.find((option) => option.value === filters.period)?.label ??
      "All time",
    [filters.period],
  );
  const selectedSortLabel = useMemo(
    () =>
      sortOptions.find((option) => option.value === filters.sort)?.label ??
      "Relevance",
    [filters.sort],
  );

  const runSearch = (cursor: number | null) => {
    startTransition(async () => {
      setError(null);

      const page = await searchCatalogPage({
        cursor,
        filters,
      });

      setResultsPage(page);
      setHasSearched(true);
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.18),_transparent_28%),#1c1b1b] p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#8f7b74]">
            Explore
          </p>
          <h1 className="mt-3 text-5xl font-serif leading-none text-[#f5ebe8] sm:text-6xl">
            Find something worth playing next.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[#d7b8ad] sm:text-base">
            Use the filters to dig through albums and songs by era, format, and
            momentum.
          </p>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#131313] p-4 sm:p-5">
          <div className="flex flex-wrap gap-3">
            <SearchFilterChip
              label="Type"
              selectedLabel={selectedTypeLabel}
              options={typeOptions}
              selectedValue={filters.type}
              onSelect={(value) =>
                setFilters((current) => ({ ...current, type: value }))
              }
            />
            <SearchFilterChip
              label="Period"
              selectedLabel={selectedPeriodLabel}
              options={periodOptions}
              selectedValue={filters.period}
              onSelect={(value) =>
                setFilters((current) => ({ ...current, period: value }))
              }
            />
            <SearchFilterChip
              label="Sort"
              selectedLabel={selectedSortLabel}
              options={sortOptions}
              selectedValue={filters.sort}
              onSelect={(value) =>
                setFilters((current) => ({ ...current, sort: value }))
              }
            />
          </div>

          <div className="mt-5">
            <Button
              onClick={() => {
                setPageHistory([null]);
                runSearch(null);
              }}
              className="min-w-32"
            >
              Search
            </Button>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-[#ffb59e]">{error}</p>
          ) : null}
        </div>
      </section>

      <SearchResultsList
        items={resultsPage.items}
        isLoading={isLoading}
        hasSearched={hasSearched}
        canGoBack={pageHistory.length > 1}
        hasNextPage={Boolean(resultsPage.nextCursor)}
        onPreviousPage={() => {
          const nextHistory = pageHistory.slice(0, -1);
          const previousCursor = nextHistory.at(-1) ?? null;
          setPageHistory(nextHistory);
          runSearch(previousCursor);
        }}
        onNextPage={() => {
          if (!resultsPage.nextCursor) {
            return;
          }

          setPageHistory((current) => [...current, resultsPage.nextCursor]);
          runSearch(resultsPage.nextCursor);
        }}
      />
    </div>
  );
}
