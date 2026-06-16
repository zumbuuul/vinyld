export type SpotifyTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

export type SpotifyUserImage = {
  url: string;
  width: number | null;
  height: number | null;
};

export type SpotifyUserTokenSet = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string | null;
  scope: string;
  tokenType: string;
};

export type SpotifyUserProfile = {
  id: string;
  displayName: string | null;
  email: string | null;
  imageUrl: string | null;
  spotifyUri: string | null;
  spotifyExternalUrl: string | null;
};

export type SpotifyCurrentlyPlayingTrack = {
  spotifyId: string;
  name: string;
  artists: string;
  albumName: string;
  albumImageUrl: string | null;
  spotifyUrl: string | null;
  progressMs: number | null;
  durationMs: number | null;
  isPlaying: boolean;
};

export type SpotifyCurrentlyPlayingResponse = {
  progress_ms?: number | null;
  is_playing?: boolean;
  currently_playing_type?: string;
  item?: {
    id?: string;
    type?: string;
    name?: string;
    duration_ms?: number;
    external_urls?: {
      spotify?: string;
    };
    artists?: Array<{
      name?: string;
    }>;
    album?: {
      name?: string;
      images?: SpotifyUserImage[];
    };
  } | null;
};

export type SpotifyConnectStatePayload = {
  userId: string;
  returnTo: string;
  issuedAt: number;
  nonce: string;
};
