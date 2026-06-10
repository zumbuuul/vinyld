"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  deleteFollowingRecord,
  getPendingRoleRequestsRecord,
  getUserProfileRecord,
  getUserStatsRecord,
  insertFollowingRecord,
  isUserFollowedByViewer,
} from "@/db/queries/users.queries";
import { auth } from "@/lib/auth";

export async function getUserProfile(userId: string) {
  return getUserProfileRecord(userId);
}

export async function getUserStats(userId: string) {
  return getUserStatsRecord(userId);
}

export async function getPendingRoleRequests(userId: string) {
  return getPendingRoleRequestsRecord(userId);
}

export async function getIsFollowingUser(
  userId: string,
  viewerId: string | null,
) {
  if (!viewerId || viewerId === userId) {
    return false;
  }

  return isUserFollowedByViewer(userId, viewerId);
}

export async function followUser(userId: string): Promise<{ isFollowed: true }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.user.id === userId) {
    throw new Error("You cannot follow yourself");
  }

  const alreadyFollowing = await isUserFollowedByViewer(userId, session.user.id);

  if (!alreadyFollowing) {
    await insertFollowingRecord(userId, session.user.id);
  }

  revalidatePath(`/user/${userId}`);

  return { isFollowed: true };
}

export async function unfollowUser(
  userId: string,
): Promise<{ isFollowed: false }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.user.id === userId) {
    throw new Error("You cannot unfollow yourself");
  }

  await deleteFollowingRecord(userId, session.user.id);

  revalidatePath(`/user/${userId}`);

  return { isFollowed: false };
}
