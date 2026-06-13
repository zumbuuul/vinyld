"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  cancelRoleRequestRecord,
  deleteFollowingRecord,
  getPendingRoleRequestByRole,
  getPendingRoleRequestsRecord,
  getUserProfileRecord,
  getUserPreferences,
  getUserStatsRecord,
  insertFollowingRecord,
  insertRoleRequestRecord,
  isUserFollowedByViewer,
  type RoleRequestKey,
} from "@/db/queries/users.queries";
import { requireCurrentSession } from "@/lib/session";

const roleRequestSchema = z.object({
  requestedRole: z.enum(["critic", "artist", "admin"]),
  obrazlozenje: z
    .string()
    .trim()
    .min(10, "Please tell us a bit more about why you want this role.")
    .max(1000, "Reason is too long."),
});

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
  const session = await requireCurrentSession();

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
  const session = await requireCurrentSession();

  if (session.user.id === userId) {
    throw new Error("You cannot unfollow yourself");
  }

  await deleteFollowingRecord(userId, session.user.id);

  revalidatePath(`/user/${userId}`);

  return { isFollowed: false };
}

export async function submitRoleRequest(input: {
  requestedRole: RoleRequestKey;
  obrazlozenje: string;
}): Promise<{ success: true }> {
  const session = await requireCurrentSession();

  const parsed = roleRequestSchema.parse(input);
  const preferences = await getUserPreferences(session.user.id);
  const pendingRequests = await getPendingRoleRequestsRecord(session.user.id);
  const hasAnyPendingRequest =
    pendingRequests.critic || pendingRequests.artist || pendingRequests.admin;

  if (preferences?.role === parsed.requestedRole) {
    throw new Error("You already have this role.");
  }

  if (hasAnyPendingRequest) {
    throw new Error("You already have a pending role request.");
  }

  const existingPendingRequest = await getPendingRoleRequestByRole(
    session.user.id,
    parsed.requestedRole,
  );

  if (existingPendingRequest) {
    throw new Error("You already have a pending request for this role.");
  }

  await insertRoleRequestRecord({
    userId: session.user.id,
    requestedRole: parsed.requestedRole,
    obrazlozenje: parsed.obrazlozenje,
  });

  revalidatePath(`/user/${session.user.id}`);

  return { success: true };
}

export async function cancelRoleRequest(
  requestedRole: RoleRequestKey,
): Promise<{ success: true }> {
  const session = await requireCurrentSession();

  const pendingRequest = await getPendingRoleRequestByRole(
    session.user.id,
    requestedRole,
  );

  if (!pendingRequest) {
    throw new Error("No pending request found for this role.");
  }

  await cancelRoleRequestRecord(pendingRequest.id);

  revalidatePath(`/user/${session.user.id}`);

  return { success: true };
}
