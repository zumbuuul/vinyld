import { connection, NextResponse } from "next/server";

import { searchCatalogRecords } from "@/db/queries/search.query";
import type {
  SearchFilterState,
  SearchPeriodFilter,
  SearchSortFilter,
  SearchTypeFilter,
} from "@/features/search/search.types";

const typeValues = new Set<SearchTypeFilter>(["all", "album", "song"]);
const periodValues = new Set<SearchPeriodFilter>([
  "all",
  "2020s",
  "2010s",
  "2000s",
  "1990s",
  "1980s",
  "1970s",
  "1960s",
  "1950s",
]);
const sortValues = new Set<SearchSortFilter>([
  "relevance",
  "ratingAsc",
  "ratingDesc",
  "popularity",
]);

function parseSearchFilters(url: URL): SearchFilterState {
  const type = url.searchParams.get("type");
  const period = url.searchParams.get("period");
  const sort = url.searchParams.get("sort");

  return {
    type: typeValues.has(type as SearchTypeFilter)
      ? (type as SearchTypeFilter)
      : "all",
    period: periodValues.has(period as SearchPeriodFilter)
      ? (period as SearchPeriodFilter)
      : "all",
    sort: sortValues.has(sort as SearchSortFilter)
      ? (sort as SearchSortFilter)
      : "relevance",
  };
}

function parseCursor(url: URL) {
  const cursor = Number(url.searchParams.get("cursor"));

  if (!Number.isInteger(cursor) || cursor < 0) {
    return null;
  }

  return cursor;
}

export async function GET(request: Request) {
  await connection();

  if (process.env.K6_TEST_API !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const startedAt = performance.now();
  const filters = parseSearchFilters(url);
  const cursor = parseCursor(url);
  const page = await searchCatalogRecords(filters, cursor);

  return NextResponse.json({
    filters,
    cursor,
    durationMs: Math.round(performance.now() - startedAt),
    itemCount: page.items.length,
    nextCursor: page.nextCursor,
  });
}
