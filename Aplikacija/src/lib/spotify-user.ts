import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type {
  SpotifyConnectStatePayload,
  SpotifyCurrentlyPlayingResponse,
  SpotifyCurrentlyPlayingTrack,
  SpotifyTokenResponse,
  SpotifyUserImage,
  SpotifyUserProfile,
  SpotifyUserTokenSet,
} from "@/features/spotify/spotify.types";

const AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE_URL = "https://api.spotify.com/v1";
const EXPIRY_SAFETY_WINDOW_MS = 60_000;
const STATE_MAX_AGE_MS = 10 * 60 * 1000;
const DEVELOPMENT_REDIRECT_URI = "http://127.0.0.1:3000";
const PRODUCTION_REDIRECT_URI = "https://project-ovhcy.vercel.app/";

const clientId = process.env.SPOTIFY_ID ?? process.env.SPOTIFY_CLIENT_ID;
const clientSecret =
  process.env.SPOTIFY_SECRET ?? process.env.SPOTIFY_CLIENT_SECRET;

export const SPOTIFY_USER_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-currently-playing",
] as const;

export class SpotifyUserApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SpotifyUserApiError";
  }
}

function requireSpotifyCredentials() {
  if (!clientId || !clientSecret) {
    throw new Error("Spotify OAuth credentials are not configured.");
  }

  return { clientId, clientSecret };
}

function requireSpotifyStateSecret() {
  const secret =
    process.env.SPOTIFY_STATE_SECRET ?? process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("Spotify state secret is not configured.");
  }

  return secret;
}

function getSpotifyAuthorizationHeader() {
  const credentials = requireSpotifyCredentials();
  const encodedCredentials = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`,
  ).toString("base64");

  return `Basic ${encodedCredentials}`;
}

function signSpotifyStatePayload(encodedPayload: string) {
  return createHmac("sha256", requireSpotifyStateSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function isSafeReturnPath(returnTo: string) {
  return returnTo.startsWith("/") && !returnTo.startsWith("//");
}

function getSpotifyAccessTokenExpiresAt(expiresInSeconds: number) {
  return new Date(
    Date.now() + expiresInSeconds * 1000 - EXPIRY_SAFETY_WINDOW_MS,
  ).toISOString();
}

function normalizeTokenResponse(data: SpotifyTokenResponse): SpotifyUserTokenSet {
  if (!data.access_token || !data.expires_in) {
    throw new Error(
      data.error_description || data.error || "Spotify token exchange failed.",
    );
  }

  return {
    accessToken: data.access_token,
    accessTokenExpiresAt: getSpotifyAccessTokenExpiresAt(data.expires_in),
    refreshToken: data.refresh_token ?? null,
    scope: data.scope ?? "",
    tokenType: data.token_type ?? "Bearer",
  };
}

async function requestSpotifyToken(
  body: URLSearchParams,
): Promise<SpotifyUserTokenSet> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: getSpotifyAuthorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const data = (await response.json()) as SpotifyTokenResponse;

  if (!response.ok) {
    throw new Error(
      data.error_description || data.error || "Spotify token request failed.",
    );
  }

  return normalizeTokenResponse(data);
}

export function getSpotifyRedirectUri() {
  return process.env.NODE_ENV === "development"
    ? DEVELOPMENT_REDIRECT_URI
    : PRODUCTION_REDIRECT_URI;
}

export function createSpotifyConnectState({
  userId,
  returnTo = "/",
}: {
  userId: string;
  returnTo?: string;
}) {
  const payload: SpotifyConnectStatePayload = {
    userId,
    returnTo: isSafeReturnPath(returnTo) ? returnTo : "/",
    issuedAt: Date.now(),
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = signSpotifyStatePayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySpotifyConnectState(
  state: string,
): SpotifyConnectStatePayload {
  const [encodedPayload, signature] = state.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid Spotify connection state.");
  }

  const expectedSignature = signSpotifyStatePayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error("Invalid Spotify connection state.");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as SpotifyConnectStatePayload;

  if (!payload.userId || Date.now() - payload.issuedAt > STATE_MAX_AGE_MS) {
    throw new Error("Expired Spotify connection state.");
  }

  return {
    ...payload,
    returnTo: isSafeReturnPath(payload.returnTo)
      ? payload.returnTo
      : "/",
  };
}

export function createSpotifyAuthorizationUrl({
  redirectUri,
  state,
  scopes = SPOTIFY_USER_SCOPES,
  showDialog = false,
}: {
  redirectUri: string;
  state: string;
  scopes?: readonly string[];
  showDialog?: boolean;
}) {
  const credentials = requireSpotifyCredentials();
  const url = new URL(AUTHORIZE_ENDPOINT);

  url.searchParams.set("client_id", credentials.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("state", state);

  if (showDialog) {
    url.searchParams.set("show_dialog", "true");
  }

  return url;
}

export async function exchangeSpotifyAuthorizationCode({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}) {
  return requestSpotifyToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  );
}

export async function refreshSpotifyUserAccessToken(refreshToken: string) {
  return requestSpotifyToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
}

export function isSpotifyAccessTokenUsable(expiresAt: string | null) {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() > Date.now();
}

export async function fetchSpotifyUserProfile(
  accessToken: string,
): Promise<SpotifyUserProfile> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify profile.");
  }

  const data = (await response.json()) as {
    id: string;
    display_name?: string | null;
    email?: string | null;
    images?: SpotifyUserImage[];
    uri?: string;
    external_urls?: {
      spotify?: string;
    };
  };

  return {
    id: data.id,
    displayName: data.display_name ?? null,
    email: data.email ?? null,
    imageUrl: data.images?.[0]?.url ?? null,
    spotifyUri: data.uri ?? null,
    spotifyExternalUrl: data.external_urls?.spotify ?? null,
  };
}

export async function fetchSpotifyCurrentlyPlaying(
  accessToken: string,
): Promise<SpotifyCurrentlyPlayingTrack | null> {
  const url = new URL(`${API_BASE_URL}/me/player/currently-playing`);
  url.searchParams.set("additional_types", "track");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new SpotifyUserApiError(
      "Failed to fetch currently playing track.",
      response.status,
    );
  }

  const data = (await response.json()) as SpotifyCurrentlyPlayingResponse;

  if (
    data.currently_playing_type !== "track" ||
    !data.item ||
    data.item.type !== "track" ||
    !data.item.id ||
    !data.item.name
  ) {
    return null;
  }

  return {
    spotifyId: data.item.id,
    name: data.item.name,
    artists:
      data.item.artists
        ?.map((artist) => artist.name?.trim())
        .filter(Boolean)
        .join(", ") || "Unknown artist",
    albumName: data.item.album?.name ?? "Unknown release",
    albumImageUrl: data.item.album?.images?.[0]?.url ?? null,
    spotifyUrl: data.item.external_urls?.spotify ?? null,
    progressMs: data.progress_ms ?? null,
    durationMs: data.item.duration_ms ?? null,
    isPlaying: Boolean(data.is_playing),
  };
}
