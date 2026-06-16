import { type SQL, sql } from "drizzle-orm";

import { db } from "@/db/db";
import type {
  SearchFilterState,
  SearchPeriodFilter,
  SearchResultItem,
  SearchResultsPage,
  SearchSortFilter,
} from "@/features/search/search.types";

const PAGE_SIZE = 5;

type SearchRow = {
  id: string;
  spotifyId: string;
  type: "album" | "song";
  name: string;
  subtitle: string;
  imageUrl: string | null;
  releaseYear: number | null;
  averageRating: number | null;
  popularity: number | null;
};

type MetricFlags = {
  needsAverageRating: boolean;
  needsPopularity: boolean;
  needsRecentRelevance: boolean;
};

function getPeriodRange(period: SearchPeriodFilter): {
  startYear: number | null;
  endYear: number | null;
} {
  if (period === "all") {
    return { startYear: null, endYear: null };
  }

  const startYear = Number(period.slice(0, 4));

  if (Number.isNaN(startYear)) {
    return { startYear: null, endYear: null };
  }

  return { startYear, endYear: startYear + 10 };
}

function normalizeCursor(cursor: number | null | undefined): number {
  if (typeof cursor !== "number" || Number.isNaN(cursor) || cursor < 0) {
    return 0;
  }

  return Math.floor(cursor);
}

function getMetricFlags(sort: SearchSortFilter): MetricFlags {
  return {
    needsAverageRating: true,
    needsPopularity: sort === "popularity",
    needsRecentRelevance: sort === "relevance",
  };
}

function getOrderByClause(sort: SearchSortFilter): SQL {
  switch (sort) {
    case "ratingAsc":
      return sql`
        COALESCE(results.average_rating, 999) ASC,
        results.release_year DESC NULLS LAST,
        results.name ASC,
        results.type ASC,
        results.spotify_id ASC
      `;
    case "ratingDesc":
      return sql`
        COALESCE(results.average_rating, -1) DESC,
        results.release_year DESC NULLS LAST,
        results.name ASC,
        results.type ASC,
        results.spotify_id ASC
      `;
    case "popularity":
      return sql`
        results.popularity DESC,
        results.release_year DESC NULLS LAST,
        results.name ASC,
        results.type ASC,
        results.spotify_id ASC
      `;
    case "relevance":
    default:
      return sql`
        results.relevance_score DESC,
        results.release_year DESC NULLS LAST,
        results.name ASC,
        results.type ASC,
        results.spotify_id ASC
      `;
  }
}

function getReleaseYearFilter(
  column: SQL,
  startYear: number | null,
  endYear: number | null,
): SQL {
  if (startYear === null || endYear === null) {
    return sql``;
  }

  return sql`AND ${column} >= ${startYear} AND ${column} < ${endYear}`;
}

function getAlbumAverageRatingJoin(): SQL {
  return sql`
    LEFT JOIN (
      SELECT
        review_union.album_id,
        ROUND(AVG(review_union.ocena)::numeric, 2)::float AS average_rating
      FROM (
        SELECT album_id, ocena
        FROM "User_Album_Review"
        WHERE ocena IS NOT NULL

        UNION ALL

        SELECT album_id, ocena
        FROM "Critic_Album_Review"
        WHERE ocena IS NOT NULL
      ) review_union
      GROUP BY review_union.album_id
    ) arm ON arm.album_id = a.id
  `;
}

function getAlbumPopularityJoin(): SQL {
  return sql`
    LEFT JOIN (
      SELECT
        review_count_union.album_id,
        COUNT(*)::int AS review_count
      FROM (
        SELECT album_id
        FROM "User_Album_Review"

        UNION ALL

        SELECT album_id
        FROM "Critic_Album_Review"
      ) review_count_union
      GROUP BY review_count_union.album_id
    ) arc ON arc.album_id = a.id
  `;
}

function getAlbumRecentRelevanceJoin(): SQL {
  return sql`
    LEFT JOIN (
      SELECT
        recent_union.album_id,
        COUNT(*)::int AS recent_review_count
      FROM (
        SELECT album_id
        FROM "User_Album_Review"
        WHERE date_created >= NOW() - INTERVAL '30 days'

        UNION ALL

        SELECT album_id
        FROM "Critic_Album_Review"
        WHERE date_created >= NOW() - INTERVAL '30 days'
      ) recent_union
      GROUP BY recent_union.album_id
    ) arr ON arr.album_id = a.id
  `;
}

function getSongAverageRatingJoin(): SQL {
  return sql`
    LEFT JOIN (
      SELECT
        review_union.song_id,
        ROUND(AVG(review_union.ocena)::numeric, 2)::float AS average_rating
      FROM (
        SELECT song_id, ocena
        FROM "User_Song_Review"
        WHERE ocena IS NOT NULL

        UNION ALL

        SELECT song_id, ocena
        FROM "Critic_Song_Review"
        WHERE ocena IS NOT NULL
      ) review_union
      GROUP BY review_union.song_id
    ) srm ON srm.song_id = s.id
  `;
}

function getSongPopularityJoin(): SQL {
  return sql`
    LEFT JOIN (
      SELECT
        review_count_union.song_id,
        COUNT(*)::int AS review_count
      FROM (
        SELECT song_id
        FROM "User_Song_Review"

        UNION ALL

        SELECT song_id
        FROM "Critic_Song_Review"
      ) review_count_union
      GROUP BY review_count_union.song_id
    ) src ON src.song_id = s.id
  `;
}

function getSongRecentRelevanceJoin(): SQL {
  return sql`
    LEFT JOIN (
      SELECT
        recent_union.song_id,
        COUNT(*)::int AS recent_review_count
      FROM (
        SELECT song_id
        FROM "User_Song_Review"
        WHERE date_created >= NOW() - INTERVAL '30 days'

        UNION ALL

        SELECT song_id
        FROM "Critic_Song_Review"
        WHERE date_created >= NOW() - INTERVAL '30 days'
      ) recent_union
      GROUP BY recent_union.song_id
    ) srr ON srr.song_id = s.id
  `;
}

function buildAlbumSearchQuery(
  flags: MetricFlags,
  startYear: number | null,
  endYear: number | null,
): SQL {
  const joins: SQL[] = [];

  if (flags.needsAverageRating) {
    joins.push(getAlbumAverageRatingJoin());
  }

  if (flags.needsPopularity) {
    joins.push(getAlbumPopularityJoin());
  }

  if (flags.needsRecentRelevance) {
    joins.push(getAlbumRecentRelevanceJoin());
  }

  return sql`
    SELECT
      a.id::text AS id,
      a.spotify_id::text AS spotify_id,
      'album'::text AS type,
      a.name::text AS name,
      COALESCE(a.artist_display_name, 'Unknown Artist')::text AS subtitle,
      a.image_url::text AS image_url,
      a.godina_izdavanja::int AS release_year,
      ${
        flags.needsAverageRating
          ? sql`arm.average_rating::float`
          : sql`NULL::float`
      } AS average_rating,
      ${
        flags.needsPopularity
          ? sql`COALESCE(arc.review_count, 0)::int`
          : sql`0::int`
      } AS popularity,
      ${
        flags.needsRecentRelevance
          ? sql`COALESCE(arr.recent_review_count, 0)::int`
          : sql`0::int`
      } AS relevance_score
    FROM "Album" a
    ${sql.join(joins, sql`\n`)}
    WHERE 1 = 1
    ${getReleaseYearFilter(sql`a.godina_izdavanja`, startYear, endYear)}
  `;
}

function buildSongSearchQuery(
  flags: MetricFlags,
  startYear: number | null,
  endYear: number | null,
): SQL {
  const joins: SQL[] = [];

  if (flags.needsAverageRating) {
    joins.push(getSongAverageRatingJoin());
  }

  if (flags.needsPopularity) {
    joins.push(getSongPopularityJoin());
  }

  if (flags.needsRecentRelevance) {
    joins.push(getSongRecentRelevanceJoin());
  }

  return sql`
    SELECT
      s.id::text AS id,
      s.spotify_id::text AS spotify_id,
      'song'::text AS type,
      s.name::text AS name,
      CONCAT(
        COALESCE(s.artist_display_name, 'Unknown Artist'),
        ' • ',
        a.name
      )::text AS subtitle,
      a.image_url::text AS image_url,
      a.godina_izdavanja::int AS release_year,
      ${
        flags.needsAverageRating
          ? sql`srm.average_rating::float`
          : sql`NULL::float`
      } AS average_rating,
      ${
        flags.needsPopularity
          ? sql`COALESCE(src.review_count, 0)::int`
          : sql`0::int`
      } AS popularity,
      ${
        flags.needsRecentRelevance
          ? sql`COALESCE(srr.recent_review_count, 0)::int`
          : sql`0::int`
      } AS relevance_score
    FROM "Song" s
    JOIN "Album" a ON a.id = s.album_id
    ${sql.join(joins, sql`\n`)}
    WHERE 1 = 1
    ${getReleaseYearFilter(sql`a.godina_izdavanja`, startYear, endYear)}
  `;
}

export async function searchCatalogRecords(
  filters: SearchFilterState,
  cursor?: number | null,
): Promise<SearchResultsPage> {
  const offset = normalizeCursor(cursor);
  const { startYear, endYear } = getPeriodRange(filters.period);
  const flags = getMetricFlags(filters.sort);
  const includeAlbums = filters.type !== "song";
  const includeSongs = filters.type !== "album";

  const subqueries: SQL[] = [];

  if (includeAlbums) {
    subqueries.push(buildAlbumSearchQuery(flags, startYear, endYear));
  }

  if (includeSongs) {
    subqueries.push(buildSongSearchQuery(flags, startYear, endYear));
  }

  if (subqueries.length === 0) {
    return {
      items: [],
      nextCursor: null,
    };
  }

  const result = await db.execute(sql`
    WITH results AS (
      ${sql.join(subqueries, sql.raw(" UNION ALL "))}
    )
    SELECT
      results.id,
      results.spotify_id AS "spotifyId",
      results.type,
      results.name,
      results.subtitle,
      results.image_url AS "imageUrl",
      results.release_year AS "releaseYear",
      results.average_rating AS "averageRating",
      results.popularity
    FROM results
    ORDER BY ${getOrderByClause(filters.sort)}
    LIMIT ${PAGE_SIZE + 1}
    OFFSET ${offset}
  `);

  const rows = result.rows as SearchRow[];
  const hasNextPage = rows.length > PAGE_SIZE;
  const visibleRows = hasNextPage ? rows.slice(0, PAGE_SIZE) : rows;

  const items: SearchResultItem[] = visibleRows.map((row) => ({
    id: row.id,
    spotifyId: row.spotifyId,
    type: row.type,
    name: row.name,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    releaseYear: row.releaseYear,
    averageRating:
      row.averageRating === null ? null : Number(row.averageRating),
    popularity: row.popularity ?? 0,
    href:
      row.type === "album"
        ? `/album/${row.spotifyId}`
        : `/song/${row.spotifyId}`,
  }));

  return {
    items,
    nextCursor: hasNextPage ? offset + PAGE_SIZE : null,
  };
}
