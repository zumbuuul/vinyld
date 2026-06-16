import { sql } from "drizzle-orm";

import { db } from "@/db/db";

export interface PopularStoryRow {
  id: string;
  userId: string;
  name: string;
  imageUrl: string | null;
  userName: string;
  userImage: string | null;
  likeCount: number;
}

export interface PopularUserRow {
  id: string;
  name: string;
  imageUrl: string | null;
  likeCount: number;
}

export interface FollowedActivityRow {
  id: string;
  kind: "review" | "critic_review" | "story" | "follow";
  actorId: string;
  actorName: string;
  actorImage: string | null;
  createdAt: string;
  albumSpotifyId: string | null;
  albumName: string | null;
  albumArtist: string | null;
  albumImageUrl: string | null;
  storyId: string | null;
  storyName: string | null;
  storyImage: string | null;
  targetUserId: string | null;
  targetUserName: string | null;
  targetUserImage: string | null;
  title: string | null;
  summary: string | null;
  rating10: number | null;
  likeCount: number | null;
  likedByViewer: boolean;
}

export interface FollowedActivityCursorOptions {
  asOf: string;
  cursorCreatedAt?: string | null;
  cursorId?: string | null;
}

export async function getPopularStories(
  limit: number,
): Promise<PopularStoryRow[]> {
  const result = await db.execute(sql`
    SELECT
      s.id,
      s.user_id,
      s.name,
      s.image,
      u.name AS user_name,
      COALESCE((
        SELECT up.profile_picture_url
        FROM "UserPreferences" up
        WHERE up.user_id = u.id
        ORDER BY up.preference_id DESC
        LIMIT 1
      ), u.image) AS user_image,
      COUNT(sl.id)::int AS like_count
    FROM "Story" s
    JOIN "user" u ON u.id = s.user_id
    LEFT JOIN "Story_Likes" sl ON sl.story_id = s.id
    GROUP BY s.id, s.user_id, s.name, s.image, u.id, u.name, u.image
    ORDER BY like_count DESC, s.date_created DESC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    user_id: string;
    name: string;
    image: string | null;
    user_name: string;
    user_image: string | null;
    like_count: number | null;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    imageUrl: row.image ? String(row.image) : null,
    userName: String(row.user_name),
    userImage: row.user_image ? String(row.user_image) : null,
    likeCount: Number(row.like_count ?? 0),
  }));
}

export async function getPopularUsers(
  limit: number,
): Promise<PopularUserRow[]> {
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
      COALESCE((
        SELECT up2.profile_picture_url
        FROM "UserPreferences" up2
        WHERE up2.user_id = u.id
        ORDER BY up2.preference_id DESC
        LIMIT 1
      ), u.image) AS image,
      lbu.like_count
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
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    imageUrl: row.image ? String(row.image) : null,
    likeCount: Number(row.like_count ?? 0),
  }));
}

export async function getFollowedActivity(
  userId: string,
  limit: number,
  { asOf, cursorCreatedAt = null, cursorId = null }: FollowedActivityCursorOptions,
): Promise<FollowedActivityRow[]> {
  const result = await db.execute(sql`
    WITH followed_users AS (
      SELECT f.followed_id
      FROM "Following" f
      WHERE f.following_id = ${userId}
    )
    SELECT *
    FROM (
      SELECT
        uar.id::text AS id,
        'review'::text AS kind,
        u.id::text AS actor_id,
        u.name AS actor_name,
        COALESCE((
          SELECT up.profile_picture_url
          FROM "UserPreferences" up
          WHERE up.user_id = u.id
          ORDER BY up.preference_id DESC
          LIMIT 1
        ), u.image) AS actor_image,
        uar.date_created::timestamp AS created_at,
        a.spotify_id AS album_spotify_id,
        a.name AS album_name,
        a.artist_display_name AS album_artist,
        a.image_url AS album_image_url,
        NULL::text AS story_id,
        NULL::text AS story_name,
        NULL::text AS story_image,
        NULL::text AS target_user_id,
        NULL::text AS target_user_name,
        NULL::text AS target_user_image,
        NULL::text AS title,
        uar.description AS summary,
        uar.ocena AS rating10,
        (
          SELECT COUNT(*)::int
          FROM "User_Album_Review_Likes" uarl
          WHERE uarl.review_id = uar.id
        ) AS like_count,
        EXISTS(
          SELECT 1
          FROM "User_Album_Review_Likes" viewer_like
          WHERE viewer_like.review_id = uar.id
            AND viewer_like.user_id = ${userId}
        ) AS liked_by_viewer
      FROM "User_Album_Review" uar
      JOIN "user" u ON u.id = uar.user_id
      JOIN followed_users fu ON fu.followed_id = u.id
      JOIN "Album" a ON a.id = uar.album_id

      UNION ALL

      SELECT
        car.id::text AS id,
        'critic_review'::text AS kind,
        u.id::text AS actor_id,
        u.name AS actor_name,
        COALESCE((
          SELECT up.profile_picture_url
          FROM "UserPreferences" up
          WHERE up.user_id = u.id
          ORDER BY up.preference_id DESC
          LIMIT 1
        ), u.image) AS actor_image,
        car.date_created::timestamp AS created_at,
        a.spotify_id AS album_spotify_id,
        a.name AS album_name,
        a.artist_display_name AS album_artist,
        a.image_url AS album_image_url,
        NULL::text AS story_id,
        NULL::text AS story_name,
        NULL::text AS story_image,
        NULL::text AS target_user_id,
        NULL::text AS target_user_name,
        NULL::text AS target_user_image,
        car.naslov AS title,
        car.tekst_kritike AS summary,
        car.ocena AS rating10,
        (
          SELECT COUNT(*)::int
          FROM "Critic_Album_Review_Likes" carl
          WHERE carl.review_id = car.id
        ) AS like_count,
        EXISTS(
          SELECT 1
          FROM "Critic_Album_Review_Likes" viewer_like
          WHERE viewer_like.review_id = car.id
            AND viewer_like.user_id = ${userId}
        ) AS liked_by_viewer
      FROM "Critic_Album_Review" car
      JOIN "user" u ON u.id = car.user_id
      JOIN "UserPreferences" up
        ON up.user_id = u.id
       AND up.role = 'critic'
      JOIN followed_users fu ON fu.followed_id = u.id
      JOIN "Album" a ON a.id = car.album_id

      UNION ALL

      SELECT
        s.id::text AS id,
        'story'::text AS kind,
        u.id::text AS actor_id,
        u.name AS actor_name,
        COALESCE((
          SELECT up.profile_picture_url
          FROM "UserPreferences" up
          WHERE up.user_id = u.id
          ORDER BY up.preference_id DESC
          LIMIT 1
        ), u.image) AS actor_image,
        s.date_created::timestamp AS created_at,
        NULL::text AS album_spotify_id,
        NULL::text AS album_name,
        NULL::text AS album_artist,
        NULL::text AS album_image_url,
        s.id::text AS story_id,
        s.name AS story_name,
        s.image AS story_image,
        NULL::text AS target_user_id,
        NULL::text AS target_user_name,
        NULL::text AS target_user_image,
        s.description AS title,
        s.description AS summary,
        NULL::int AS rating10,
        NULL::int AS like_count,
        FALSE AS liked_by_viewer
      FROM "Story" s
      JOIN "user" u ON u.id = s.user_id
      JOIN followed_users fu ON fu.followed_id = u.id

      UNION ALL

      SELECT
        f.id::text AS id,
        'follow'::text AS kind,
        actor.id::text AS actor_id,
        actor.name AS actor_name,
        COALESCE((
          SELECT up.profile_picture_url
          FROM "UserPreferences" up
          WHERE up.user_id = actor.id
          ORDER BY up.preference_id DESC
          LIMIT 1
        ), actor.image) AS actor_image,
        f.date_followed AS created_at,
        NULL::text AS album_spotify_id,
        NULL::text AS album_name,
        NULL::text AS album_artist,
        NULL::text AS album_image_url,
        NULL::text AS story_id,
        NULL::text AS story_name,
        NULL::text AS story_image,
        target.id::text AS target_user_id,
        target.name AS target_user_name,
        COALESCE((
          SELECT up.profile_picture_url
          FROM "UserPreferences" up
          WHERE up.user_id = target.id
          ORDER BY up.preference_id DESC
          LIMIT 1
        ), target.image) AS target_user_image,
        NULL::text AS title,
        NULL::text AS summary,
        NULL::int AS rating10,
        NULL::int AS like_count,
        FALSE AS liked_by_viewer
      FROM "Following" f
      JOIN "user" actor ON actor.id = f.following_id
      JOIN followed_users fu ON fu.followed_id = actor.id
      JOIN "user" target ON target.id = f.followed_id
    ) activities
    WHERE
      activities.created_at <= ${asOf}::timestamp
      AND (
        ${cursorCreatedAt}::timestamp IS NULL
        OR activities.created_at < ${cursorCreatedAt}::timestamp
        OR (
          activities.created_at = ${cursorCreatedAt}::timestamp
          AND activities.id < ${cursorId}::text
        )
      )
    ORDER BY activities.created_at DESC, activities.id DESC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    id: string;
    kind: "review" | "critic_review" | "story" | "follow";
    actor_id: string;
    actor_name: string;
    actor_image: string | null;
    created_at: string;
    album_spotify_id: string | null;
    album_name: string | null;
    album_artist: string | null;
    album_image_url: string | null;
    story_id: string | null;
    story_name: string | null;
    story_image: string | null;
    target_user_id: string | null;
    target_user_name: string | null;
    target_user_image: string | null;
    title: string | null;
    summary: string | null;
    rating10: number | null;
    like_count: number | null;
    liked_by_viewer: boolean;
  }>;

  return rows.map((row) => ({
    id: String(row.id),
    kind: row.kind,
    actorId: String(row.actor_id),
    actorName: String(row.actor_name),
    actorImage: row.actor_image ? String(row.actor_image) : null,
    createdAt: String(row.created_at),
    albumSpotifyId: row.album_spotify_id ? String(row.album_spotify_id) : null,
    albumName: row.album_name ? String(row.album_name) : null,
    albumArtist: row.album_artist ? String(row.album_artist) : null,
    albumImageUrl: row.album_image_url ? String(row.album_image_url) : null,
    storyId: row.story_id ? String(row.story_id) : null,
    storyName: row.story_name ? String(row.story_name) : null,
    storyImage: row.story_image ? String(row.story_image) : null,
    targetUserId: row.target_user_id ? String(row.target_user_id) : null,
    targetUserName: row.target_user_name ? String(row.target_user_name) : null,
    targetUserImage: row.target_user_image
      ? String(row.target_user_image)
      : null,
    title: row.title ? String(row.title) : null,
    summary: row.summary ? String(row.summary) : null,
    rating10: row.rating10 === null ? null : Number(row.rating10),
    likeCount: row.like_count === null ? null : Number(row.like_count),
    likedByViewer: Boolean(row.liked_by_viewer),
  }));
}
