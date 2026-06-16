"use server";

import { z } from "zod";

import { searchCatalogRecords } from "@/db/queries/search.query";
import type {
  SearchFilterState,
  SearchResultsPage,
} from "@/features/search/search.types";

const searchInputSchema = z.object({
  cursor: z.number().int().min(0).nullable().optional(),
  filters: z.object({
    type: z.enum(["all", "album", "song"]),
    period: z.enum([
      "all",
      "2020s",
      "2010s",
      "2000s",
      "1990s",
      "1980s",
      "1970s",
      "1960s",
      "1950s",
    ]),
    sort: z.enum(["relevance", "ratingAsc", "ratingDesc", "popularity"]),
  }),
});

export async function searchCatalogPage(input: {
  cursor?: number | null;
  filters: SearchFilterState;
}): Promise<SearchResultsPage> {
  const parsed = searchInputSchema.parse(input);

  return searchCatalogRecords(parsed.filters, parsed.cursor);
}
