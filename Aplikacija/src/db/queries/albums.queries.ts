import { sql } from "drizzle-orm";

import { db } from "@/db/db";

export interface IconicPressingRow {
  id: string;
  name: string;
  spotifyId: string;
  releaseYear: number;
  reviewCount: number;
  avgRating10: number;
}

export async function getIconicPressings(
  limit: number,
): Promise<IconicPressingRow[]> {
  const result = await db.execute(sql`
    WITH recent_reviews AS (
      SELECT album_id, COUNT(*)::int AS review_count
      FROM (
        SELECT album_id
        FROM "User_Album_Review"
        WHERE date_created >= CURRENT_DATE - INTERVAL '30 days'
        UNION ALL
        SELECT album_id
        FROM "Critic_Album_Review"
        WHERE date_created >= CURRENT_DATE - INTERVAL '30 days'
      ) recent
      GROUP BY album_id
    ),
    rating_scores AS (
      SELECT album_id, AVG(ocena)::float AS avg_rating
      FROM (
        SELECT album_id, ocena
        FROM "User_Album_Review"
        WHERE ocena IS NOT NULL
        UNION ALL
        SELECT album_id, ocena
        FROM "Critic_Album_Review"
        WHERE ocena IS NOT NULL
      ) scores
      GROUP BY album_id
    )
    SELECT
      a.id,
      a.name,
      a.spotify_id,
      a.godina_izdavanja,
      COALESCE(r.review_count, 0) AS review_count,
      COALESCE(s.avg_rating, 0) AS avg_rating
    FROM "Album" a
    LEFT JOIN recent_reviews r ON r.album_id = a.id
    LEFT JOIN rating_scores s ON s.album_id = a.id
    ORDER BY review_count DESC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    name: string;
    spotify_id: string;
    godina_izdavanja: number;
    review_count: number;
    avg_rating: number;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    spotifyId: String(row.spotify_id),
    releaseYear: Number(row.godina_izdavanja ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    avgRating10: Number(row.avg_rating ?? 0),
  }));
}
