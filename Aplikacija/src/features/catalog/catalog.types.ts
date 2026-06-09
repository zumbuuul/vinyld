export type CatalogSearchResult = {
  spotifyId: string;
  type: "album" | "song";
  name: string;
  subtitle: string;
  imageUrl: string | null;
  href: string;
};

export type CatalogTrack = {
  id: string;
  spotifyId: string;
  name: string;
  artistDisplayName: string | null;
  durationMs: number | null;
  trackNumber: number | null;
  discNumber: number;
  previewUrl: string | null;
};

export type CatalogAlbumDetails = {
  id: string;
  spotifyId: string;
  name: string;
  artistDisplayName: string | null;
  imageUrl: string | null;
  releaseDate: string | null;
  releaseDatePrecision: string | null;
  albumType: string | null;
  totalTracks: number | null;
  spotifyExternalUrl: string | null;
  genres: string[];
  tracks: CatalogTrack[];
};

export type CatalogSongDetails = {
  id: string;
  spotifyId: string;
  name: string;
  artistDisplayName: string | null;
  durationMs: number | null;
  trackNumber: number | null;
  discNumber: number;
  previewUrl: string | null;
  spotifyExternalUrl: string | null;
  album: {
    id: string;
    spotifyId: string;
    name: string;
    imageUrl: string | null;
    artistDisplayName: string | null;
  };
};
