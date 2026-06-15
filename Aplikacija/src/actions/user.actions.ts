"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  cancelRoleRequestRecord,
  clearSpotifyConnectionRecord,
  deleteFollowingRecord,
  getSpotifyConnectionRecord,
  getPendingRoleRequestByRole,
  getPendingRoleRequestsRecord,
  getUserProfileRecord,
  getUserPreferences,
  getUserStatsRecord,
  insertFollowingRecord,
  insertRoleRequestRecord,
  isUserFollowedByViewer,
  updateSpotifyConnectionRecord,
  type RoleRequestKey,
} from "@/db/queries/users.queries";
import type { NowSpinningState } from "@/features/user/user.types";
import { requireCurrentSession } from "@/lib/session";
import {
  createSpotifyAuthorizationUrl,
  createSpotifyConnectState,
  exchangeSpotifyAuthorizationCode,
  fetchSpotifyCurrentlyPlaying,
  fetchSpotifyUserProfile,
  getSpotifyRedirectUri,
  isSpotifyAccessTokenUsable,
  refreshSpotifyUserAccessToken,
  SpotifyUserApiError,
  verifySpotifyConnectState,
} from "@/lib/spotify-user";

const roleRequestSchema = z.object({
  requestedRole: z.enum(["critic", "artist", "admin"]),
  obrazlozenje: z
    .string()
    .trim()
    .min(10, "Please tell us a bit more about why you want this role.")
    .max(1000, "Reason is too long."),
});

const spotifyConnectUrlSchema = z.object({
  returnTo: z
    .string()
    .trim()
    .default("/")
    .transform((value) =>
      value.startsWith("/") && !value.startsWith("//") ? value : "/",
    ),
});

const spotifyCallbackSchema = z.object({
  code: z.string().trim().min(1),
  state: z.string().trim().min(1),
});
const userIdSchema = z.string().trim().min(1);

async function getUsableSpotifyAccessToken(
  userId: string,
): Promise<string | null> {
  const connection = await getSpotifyConnectionRecord(userId);

  if (!connection?.spotifyConnected) {
    return null;
  }

  if (
    connection.spotifyAccessToken &&
    isSpotifyAccessTokenUsable(connection.spotifyAccessTokenExpiresAt)
  ) {
    return connection.spotifyAccessToken;
  }

  if (!connection.spotifyRefreshToken) {
    return null;
  }

  try {
    const refreshed = await refreshSpotifyUserAccessToken(
      connection.spotifyRefreshToken,
    );

    await updateSpotifyConnectionRecord(userId, {
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
      refreshToken: refreshed.refreshToken ?? undefined,
    });

    return refreshed.accessToken;
  } catch {
    await clearSpotifyConnectionRecord(userId);

    return null;
  }
}

export async function getUserProfile(userId: string) {
  return getUserProfileRecord(userId);
}

export async function getUserStats(userId: string) {
  return getUserStatsRecord(userId);
}

export async function getUserNowSpinning(
  userId: string,
): Promise<NowSpinningState> {
  const parsedUserId = userIdSchema.parse(userId);
  const accessToken = await getUsableSpotifyAccessToken(parsedUserId);

  if (!accessToken) {
    return { status: "not_connected" };
  }

  try {
    const track = await fetchSpotifyCurrentlyPlaying(accessToken);

    if (!track) {
      return { status: "not_playing" };
    }

    return {
      status: "track",
      track,
    };
  } catch (error) {
    if (error instanceof SpotifyUserApiError && error.status === 401) {
      await clearSpotifyConnectionRecord(parsedUserId);

      return { status: "not_connected" };
    }

    return { status: "unavailable" };
  }
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

export async function getSpotifyConnectUrl(input?: {
  returnTo?: string;
}): Promise<{ url: string }> {
  const session = await requireCurrentSession();
  const parsed = spotifyConnectUrlSchema.parse(input ?? {});
  const state = createSpotifyConnectState({
    userId: session.user.id,
    returnTo: parsed.returnTo,
  });
  const url = createSpotifyAuthorizationUrl({
    redirectUri: getSpotifyRedirectUri(),
    state,
  });

  return { url: url.toString() };
}

export async function completeSpotifyConnection(input: {
  code: string;
  state: string;
}): Promise<{ success: true; returnTo: string; spotifyUserId: string }> {
  const session = await requireCurrentSession();
  const parsed = spotifyCallbackSchema.parse(input);
  const state = verifySpotifyConnectState(parsed.state);

  if (state.userId !== session.user.id) {
    throw new Error("Spotify connection state does not match this user.");
  }

  const tokenSet = await exchangeSpotifyAuthorizationCode({
    code: parsed.code,
    redirectUri: getSpotifyRedirectUri(),
  });
  const spotifyProfile = await fetchSpotifyUserProfile(tokenSet.accessToken);

  await updateSpotifyConnectionRecord(session.user.id, {
    accessToken: tokenSet.accessToken,
    accessTokenExpiresAt: tokenSet.accessTokenExpiresAt,
    refreshToken: tokenSet.refreshToken,
  });

  revalidatePath(`/user/${session.user.id}`);
  revalidatePath("/settings");

  return {
    success: true,
    returnTo: state.returnTo,
    spotifyUserId: spotifyProfile.id,
  };
}

export async function disconnectSpotifyAccount(): Promise<{ success: true }> {
  const session = await requireCurrentSession();

  await clearSpotifyConnectionRecord(session.user.id);

  revalidatePath(`/user/${session.user.id}`);
  revalidatePath("/settings");

  return { success: true };
}
