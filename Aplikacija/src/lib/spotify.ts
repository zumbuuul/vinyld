const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE_URL = "https://api.spotify.com/v1";
const DEFAULT_MARKET = process.env.SPOTIFY_MARKET ?? "US";

const clientId = process.env.SPOTIFY_ID ?? process.env.SPOTIFY_CLIENT_ID;
const clientSecret =
  process.env.SPOTIFY_SECRET ?? process.env.SPOTIFY_CLIENT_SECRET;

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
}

interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  id: string;
  album_type: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  total_tracks: number;
  release_date: string;
  release_date_precision: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
  track_number: number;
  disc_number: number;
  preview_url: string | null;
  uri: string;
  external_urls: {
    spotify: string;
  };
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
    artists: SpotifyArtist[];
  };
}

export interface SpotifyAlbumTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
  track_number: number;
  disc_number: number;
  preview_url: string | null;
  uri: string;
  external_urls: {
    spotify: string;
  };
}

interface SpotifySearchResponse {
  albums?: {
    items: Array<{
      id: string;
      name: string;
      artists: SpotifyArtist[];
      images: SpotifyImage[];
      release_date: string;
    }>;
  };
  tracks?: {
    items: Array<{
      id: string;
      name: string;
      artists: SpotifyArtist[];
      album: {
        id: string;
        name: string;
        images: SpotifyImage[];
      };
    }>;
  };
}

interface SpotifyAlbumTracksResponse {
  items: SpotifyAlbumTrack[];
  next: string | null;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

function shouldShowSpotifyUnavailable(status: number) {
  return status === 404 || status === 420 || status >= 500;
}

function getPlaywrightSpotifyStatus(params?: Record<string, string | number | undefined>) {
  if (process.env.PLAYWRIGHT_SPOTIFY_STATUS_GUARD_TEST !== "1") {
    return null;
  }

  const query = String(params?.q ?? "");

  if (!query.includes("__playwright_spotify_status_")) {
    return null;
  }

  const status = Number(query.match(/__playwright_spotify_status_(\d{3})__/)?.[1]);

  return Number.isFinite(status) ? status : null;
}

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

async function getSpotifyAccessToken(): Promise<string | null> {
  if (!clientId || !clientSecret) {
    return null;
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };

  return cachedToken.token;
}

export async function getSpotifyAlbum(
  spotifyId: string,
): Promise<SpotifyAlbum | null> {
  return spotifyFetch<SpotifyAlbum>(`/albums/${spotifyId}`, {
    market: DEFAULT_MARKET,
  });
}

async function spotifyFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  options?: { throwOnHttpError?: boolean },
): Promise<T | null> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return null;
  }

  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const playwrightStatus = getPlaywrightSpotifyStatus(params);

  if (
    playwrightStatus &&
    options?.throwOnHttpError &&
    shouldShowSpotifyUnavailable(playwrightStatus)
  ) {
    throw new SpotifyApiError("Spotify API request failed.", playwrightStatus);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (
    !response.ok &&
    options?.throwOnHttpError &&
    shouldShowSpotifyUnavailable(response.status)
  ) {
    throw new SpotifyApiError("Spotify API request failed.", response.status);
  }

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export async function searchSpotifyAlbumsByName(
  query: string,
  limit = 1,
): Promise<SpotifySearchResponse["albums"] | null> {
  return (
    (
      await spotifyFetch<SpotifySearchResponse>("/search", {
        q: `album:${query}`,
        type: "album",
        limit,
        market: DEFAULT_MARKET,
      }, { throwOnHttpError: true })
    )?.albums ?? null
  );
}

export async function searchSpotifyTracksByName(
  query: string,
  limit = 1,
): Promise<SpotifySearchResponse["tracks"] | null> {
  return (
    (
      await spotifyFetch<SpotifySearchResponse>("/search", {
        q: `track:${query}`,
        type: "track",
        limit,
        market: DEFAULT_MARKET,
      }, { throwOnHttpError: true })
    )?.tracks ?? null
  );
}

export async function getSpotifyTrack(
  spotifyId: string,
): Promise<SpotifyTrack | null> {
  if (!spotifyId) {
    return null;
  }

  return spotifyFetch<SpotifyTrack>(`/tracks/${spotifyId}`, {
    market: DEFAULT_MARKET,
  });
}

export async function getSpotifyAlbumTracks(
  spotifyId: string,
): Promise<SpotifyAlbumTrack[]> {
  if (!spotifyId) {
    return [];
  }

  const tracks: SpotifyAlbumTrack[] = [];
  let offset = 0;

  while (true) {
    const page = await spotifyFetch<SpotifyAlbumTracksResponse>(
      `/albums/${spotifyId}/tracks`,
      {
        market: DEFAULT_MARKET,
        limit: 50,
        offset,
      },
    );

    if (!page) {
      break;
    }

    tracks.push(...page.items);

    if (!page.next || page.items.length === 0) {
      break;
    }

    offset += page.items.length;
  }

  return tracks;
}
