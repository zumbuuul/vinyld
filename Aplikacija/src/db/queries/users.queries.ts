import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import { following, roleRequest, user, userPreferences } from "@/db/schema";

export type UserPreferencesRecord = {
  userId: string;
  role: "user" | "critic" | "artist" | "admin";
  profilePictureUrl: string | null;
  spotifyConnected?: boolean;
};

export type UserProfileRecord = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: "user" | "critic" | "artist" | "admin";
  spotifyConnected: boolean;
};

export type UserStatsRecord = {
  followerCount: number;
  followingCount: number;
  reviewCount: number;
  reviewLikeCount: number;
};

export type PendingRoleRequestsRecord = {
  critic: boolean;
  artist: boolean;
  admin: boolean;
};

export async function isUserFollowedByViewer(
  userId: string,
  viewerId: string,
): Promise<boolean> {
  const [row] = await db
    .select({
      id: following.id,
    })
    .from(following)
    .where(
      and(
        eq(following.followedId, userId),
        eq(following.followingId, viewerId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function insertFollowingRecord(
  userId: string,
  viewerId: string,
): Promise<void> {
  await db.insert(following).values({
    followedId: userId,
    followingId: viewerId,
  });
}

export async function deleteFollowingRecord(
  userId: string,
  viewerId: string,
): Promise<void> {
  await db
    .delete(following)
    .where(
      and(
        eq(following.followedId, userId),
        eq(following.followingId, viewerId),
      ),
    );
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferencesRecord | null> {
  const [row] = await db
    .select({
      userId: userPreferences.userId,
      role: userPreferences.role,
      profilePictureUrl: userPreferences.profilePictureUrl,
      spotifyConnected: userPreferences.spotifyConnected,
      preferenceId: userPreferences.preferenceId,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .orderBy(desc(userPreferences.preferenceId))
    .limit(1);

  if (!row) {
    return null;
  }

  const roleValue = String(row.role);
  const resolvedRole =
    roleValue === "critic" ||
    roleValue === "artist" ||
    roleValue === "admin"
      ? roleValue
      : "user";

  return {
    userId: String(row.userId),
    role: resolvedRole,
    profilePictureUrl: row.profilePictureUrl
      ? String(row.profilePictureUrl)
      : null,
    spotifyConnected: Boolean(row.spotifyConnected),
  };
}

export async function getUserById(
  userId: string,
): Promise<{ id: string; name: string; image: string | null } | null> {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: String(row.name),
    image: row.image ? String(row.image) : null,
  };
}

export async function getUserProfileRecord(
  userId: string,
): Promise<UserProfileRecord | null> {
  const baseUser = await getUserById(userId);

  if (!baseUser) {
    return null;
  }

  const preferences = await getUserPreferences(userId);

  return {
    id: baseUser.id,
    name: baseUser.name,
    imageUrl: preferences?.profilePictureUrl ?? baseUser.image,
    role: preferences?.role ?? "user",
    spotifyConnected: preferences?.spotifyConnected ?? false,
  };
}

export async function getUserStatsRecord(
  userId: string,
): Promise<UserStatsRecord> {
  const [followersRow, followingRow, reviewsRow, likesRow] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(following)
      .where(eq(following.followedId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(following)
      .where(eq(following.followingId, userId)),
    db.execute(sql`
      SELECT (
        COALESCE((SELECT COUNT(*) FROM "User_Album_Review" WHERE user_id = ${userId}), 0) +
        COALESCE((SELECT COUNT(*) FROM "User_Song_Review" WHERE user_id = ${userId}), 0) +
        COALESCE((SELECT COUNT(*) FROM "Critic_Album_Review" WHERE user_id = ${userId}), 0) +
        COALESCE((SELECT COUNT(*) FROM "Critic_Song_Review" WHERE user_id = ${userId}), 0)
      )::int AS count
    `),
    db.execute(sql`
      SELECT (
        COALESCE((
          SELECT COUNT(*)
          FROM "User_Album_Review_Likes" uarl
          JOIN "User_Album_Review" uar ON uar.id = uarl.review_id
          WHERE uar.user_id = ${userId}
        ), 0) +
        COALESCE((
          SELECT COUNT(*)
          FROM "User_Song_Review_Likes" usrl
          JOIN "User_Song_Review" usr ON usr.id = usrl.review_id
          WHERE usr.user_id = ${userId}
        ), 0) +
        COALESCE((
          SELECT COUNT(*)
          FROM "Critic_Album_Review_Likes" carl
          JOIN "Critic_Album_Review" car ON car.id = carl.review_id
          WHERE car.user_id = ${userId}
        ), 0) +
        COALESCE((
          SELECT COUNT(*)
          FROM "Critic_Song_Review_Likes" csrl
          JOIN "Critic_Song_Review" csr ON csr.id = csrl.review_id
          WHERE csr.user_id = ${userId}
        ), 0)
      )::int AS count
    `),
  ]);

  const reviewCountRow = reviewsRow.rows[0] as { count?: number | string } | undefined;
  const likeCountRow = likesRow.rows[0] as { count?: number | string } | undefined;

  return {
    followerCount: Number(followersRow[0]?.count ?? 0),
    followingCount: Number(followingRow[0]?.count ?? 0),
    reviewCount: Number(reviewCountRow?.count ?? 0),
    reviewLikeCount: Number(likeCountRow?.count ?? 0),
  };
}

export async function getPendingRoleRequestsRecord(
  userId: string,
): Promise<PendingRoleRequestsRecord> {
  const rows = await db
    .select({
      requestedRole: roleRequest.requestedRole,
    })
    .from(roleRequest)
    .where(
      and(
        eq(roleRequest.userId, userId),
        eq(roleRequest.status, "pending"),
      ),
    );

  const pending = {
    critic: false,
    artist: false,
    admin: false,
  } satisfies PendingRoleRequestsRecord;

  for (const row of rows) {
    const requestedRole = String(row.requestedRole);

    if (requestedRole === "critic") {
      pending.critic = true;
    }
    if (requestedRole === "artist") {
      pending.artist = true;
    }
    if (requestedRole === "admin") {
      pending.admin = true;
    }
  }

  return pending;
}
