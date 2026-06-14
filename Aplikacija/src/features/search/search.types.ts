export type SearchEntityType = "album" | "song";

export type SearchTypeFilter = "all" | SearchEntityType;

export type SearchPeriodFilter =
  | "all"
  | "2020s"
  | "2010s"
  | "2000s"
  | "1990s"
  | "1980s"
  | "1970s"
  | "1960s"
  | "1950s";

export type SearchSortFilter =
  | "relevance"
  | "ratingAsc"
  | "ratingDesc"
  | "popularity";

export type SearchFilterState = {
  type: SearchTypeFilter;
  period: SearchPeriodFilter;
  sort: SearchSortFilter;
};

export type SearchResultItem = {
  id: string;
  spotifyId: string;
  type: SearchEntityType;
  name: string;
  subtitle: string;
  imageUrl: string | null;
  releaseYear: number | null;
  averageRating: number | null;
  popularity: number;
  href: string;
};

export type SearchResultsPage = {
  items: SearchResultItem[];
  nextCursor: number | null;
};
