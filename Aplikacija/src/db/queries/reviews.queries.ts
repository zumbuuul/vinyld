import { sql } from "drizzle-orm";

import { db } from "@/db/db";

export interface RecentAlbumActivityRow {
  id: string;
  reviewType: "user" | "critic";
  userName: string;
  userImage: string | null;
  albumName: string;
  albumSpotifyId: string;
  albumReleaseYear: number | null;
  description: string | null;
  rating10: number | null;
  dateCreated: string | null;
  likeCount: number;
}

export async function getRecentAlbumActivity(
  limit: number,
): Promise<RecentAlbumActivityRow[]> {
  const result = await db.execute(sql`
    SELECT
      r.id,
      r.review_type,
      r.user_name,
      r.user_image,
      r.album_name,
      r.album_spotify_id,
      r.album_release_year,
      r.description,
      r.rating10,
      r.date_created,
      CASE
        WHEN r.review_type = 'user'
          THEN (SELECT COUNT(*) FROM "User_Album_Review_Likes" l WHERE l.review_id = r.id)
        ELSE (SELECT COUNT(*) FROM "Critic_Album_Review_Likes" l WHERE l.review_id = r.id)
      END AS like_count
    FROM (
      SELECT
        uar.id,
        'user'::text AS review_type,
        u.name AS user_name,
        u.image AS user_image,
        a.name AS album_name,
        a.spotify_id AS album_spotify_id,
        a.godina_izdavanja AS album_release_year,
        uar.description AS description,
        uar.ocena AS rating10,
        uar.date_created AS date_created
      FROM "User_Album_Review" uar
      JOIN "user" u ON u.id = uar.user_id
      JOIN "Album" a ON a.id = uar.album_id
      UNION ALL
      SELECT
        car.id,
        'critic'::text AS review_type,
        u.name AS user_name,
        u.image AS user_image,
        a.name AS album_name,
        a.spotify_id AS album_spotify_id,
        a.godina_izdavanja AS album_release_year,
        car.tekst_kritike AS description,
        car.ocena AS rating10,
        car.date_created AS date_created
      FROM "Critic_Album_Review" car
      JOIN "user" u ON u.id = car.user_id
      JOIN "Album" a ON a.id = car.album_id
    ) r
    ORDER BY r.date_created DESC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    review_type: "user" | "critic";
    user_name: string;
    user_image: string | null;
    album_name: string;
    album_spotify_id: string;
    album_release_year: number | null;
    description: string | null;
    rating10: number | null;
    date_created: string | null;
    like_count: number | null;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    reviewType: row.review_type,
    userName: String(row.user_name),
    userImage: row.user_image ? String(row.user_image) : null,
    albumName: String(row.album_name),
    albumSpotifyId: String(row.album_spotify_id),
    albumReleaseYear:
      row.album_release_year === null ? null : Number(row.album_release_year),
    description: row.description ? String(row.description) : null,
    rating10: row.rating10 === null ? null : Number(row.rating10),
    dateCreated: row.date_created ? String(row.date_created) : null,
    likeCount: Number(row.like_count ?? 0),
  }));
}
