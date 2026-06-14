import { sql } from "drizzle-orm";

import { db } from "@/db/db";
import type { CommunityUserCardItem } from "@/features/community/community.types";

export interface CommunityUserMetricRow {
  id: string;
  name: string;
  imageUrl: string | null;
  metricValue: number;
  isFollowed: boolean;
}

function buildUserImageSelection() {
  return sql`
    COALESCE((
      SELECT up.profile_picture_url
      FROM "UserPreferences" up
      WHERE up.user_id = u.id
      ORDER BY up.preference_id DESC
      LIMIT 1
    ), u.image)
  `;
}

function buildViewerFollowExists(viewerId: string | null) {
  return sql<boolean>`
    EXISTS(
      SELECT 1
      FROM "Following" f
      WHERE f.followed_id = u.id
        AND f.following_id = ${viewerId}
    )
  `;
}

export async function getTopCriticsRows(
  limit: number,
  viewerId: string | null,
): Promise<CommunityUserMetricRow[]> {
  const result = await db.execute(sql`
    WITH critique_like_events AS (
      SELECT car.user_id
      FROM "Critic_Album_Review_Likes" carl
      JOIN "Critic_Album_Review" car ON car.id = carl.review_id

      UNION ALL

      SELECT csr.user_id
      FROM "Critic_Song_Review_Likes" csrl
      JOIN "Critic_Song_Review" csr ON csr.id = csrl.review_id
    ),
    likes_by_critic AS (
      SELECT user_id, COUNT(*)::int AS like_count
      FROM critique_like_events
      GROUP BY user_id
    )
    SELECT
      u.id,
      u.name,
      ${buildUserImageSelection()} AS image,
      lbc.like_count,
      ${buildViewerFollowExists(viewerId)} AS is_followed
    FROM likes_by_critic lbc
    JOIN "user" u ON u.id = lbc.user_id
    JOIN "UserPreferences" up
      ON up.user_id = u.id
     AND up.role = 'critic'
    ORDER BY lbc.like_count DESC, u.name ASC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    name: string;
    image: string | null;
    like_count: number | null;
    is_followed: boolean;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    imageUrl: row.image ? String(row.image) : null,
    metricValue: Number(row.like_count ?? 0),
    isFollowed: Boolean(row.is_followed),
  }));
}

export async function getPopularUsersRows(
  limit: number,
  viewerId: string | null,
): Promise<CommunityUserMetricRow[]> {
  const result = await db.execute(sql`
    WITH user_like_events AS (
      SELECT uar.user_id
      FROM "User_Album_Review_Likes" uarl
      JOIN "User_Album_Review" uar ON uar.id = uarl.review_id

      UNION ALL

      SELECT usr.user_id
      FROM "User_Song_Review_Likes" usrl
      JOIN "User_Song_Review" usr ON usr.id = usrl.review_id

      UNION ALL

      SELECT s.user_id
      FROM "Story_Likes" sl
      JOIN "Story" s ON s.id = sl.story_id
    ),
    likes_by_user AS (
      SELECT user_id, COUNT(*)::int AS like_count
      FROM user_like_events
      GROUP BY user_id
    )
    SELECT
      u.id,
      u.name,
      ${buildUserImageSelection()} AS image,
      lbu.like_count,
      ${buildViewerFollowExists(viewerId)} AS is_followed
    FROM likes_by_user lbu
    JOIN "user" u ON u.id = lbu.user_id
    JOIN "UserPreferences" up
      ON up.user_id = u.id
     AND up.role = 'user'
    ORDER BY lbu.like_count DESC, u.name ASC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    name: string;
    image: string | null;
    like_count: number | null;
    is_followed: boolean;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    imageUrl: row.image ? String(row.image) : null,
    metricValue: Number(row.like_count ?? 0),
    isFollowed: Boolean(row.is_followed),
  }));
}

export async function getSimilarTasteRows(
  viewerId: string,
  limit: number,
): Promise<CommunityUserMetricRow[]> {
  const result = await db.execute(sql`
    WITH viewer_high_rated AS (
      SELECT
        rating_union.album_id,
        MAX(rating_union.ocena)::int AS viewer_rating
      FROM (
        SELECT album_id, ocena
        FROM "User_Album_Review"
        WHERE user_id = ${viewerId}
          AND ocena >= 8

        UNION ALL

        SELECT album_id, ocena
        FROM "Critic_Album_Review"
        WHERE user_id = ${viewerId}
          AND ocena >= 8
      ) rating_union
      GROUP BY rating_union.album_id
    ),
    active_candidates AS (
      SELECT candidate_union.user_id
      FROM (
        SELECT user_id, album_id, date_created
        FROM "User_Album_Review"
        WHERE date_created >= NOW() - INTERVAL '90 days'

        UNION ALL

        SELECT user_id, album_id, date_created
        FROM "Critic_Album_Review"
        WHERE date_created >= NOW() - INTERVAL '90 days'
      ) candidate_union
      WHERE candidate_union.user_id <> ${viewerId}
      GROUP BY candidate_union.user_id
      HAVING COUNT(DISTINCT candidate_union.album_id) >= 5
      ORDER BY COUNT(DISTINCT candidate_union.album_id) DESC, MAX(candidate_union.date_created) DESC
      LIMIT 1000
    ),
    candidate_high_rated AS (
      SELECT
        rating_union.user_id,
        rating_union.album_id,
        MAX(rating_union.ocena)::int AS candidate_rating
      FROM (
        SELECT user_id, album_id, ocena
        FROM "User_Album_Review"
        WHERE ocena >= 8

        UNION ALL

        SELECT user_id, album_id, ocena
        FROM "Critic_Album_Review"
        WHERE ocena >= 8
      ) rating_union
      JOIN active_candidates ac ON ac.user_id = rating_union.user_id
      GROUP BY rating_union.user_id, rating_union.album_id
    ),
    similarity AS (
      SELECT
        chr.user_id,
        COUNT(*)::int AS overlap_count,
        ROUND(AVG(ABS(chr.candidate_rating - vhr.viewer_rating))::numeric, 2)::float AS average_gap
      FROM candidate_high_rated chr
      JOIN viewer_high_rated vhr ON vhr.album_id = chr.album_id
      GROUP BY chr.user_id
    )
    SELECT
      u.id,
      u.name,
      ${buildUserImageSelection()} AS image,
      similarity.overlap_count,
      ${buildViewerFollowExists(viewerId)} AS is_followed
    FROM similarity
    JOIN "user" u ON u.id = similarity.user_id
    WHERE similarity.overlap_count > 0
    ORDER BY similarity.overlap_count DESC, similarity.average_gap ASC NULLS LAST, u.name ASC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    name: string;
    image: string | null;
    overlap_count: number | null;
    is_followed: boolean;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    imageUrl: row.image ? String(row.image) : null,
    metricValue: Number(row.overlap_count ?? 0),
    isFollowed: Boolean(row.is_followed),
  }));
}

export function mapRowsToCommunityCards(
  rows: CommunityUserMetricRow[],
  formatMetric: (value: number) => string,
): CommunityUserCardItem[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    imageUrl: row.imageUrl,
    isFollowed: row.isFollowed,
    metricLabel: formatMetric(row.metricValue),
  }));
}
