"use server";

import { getIconicPressings as queryIconicPressings } from "@/db/queries/albums.queries";
import { getRecentAlbumActivity } from "@/db/queries/reviews.queries";
import { getSpotifyAlbum } from "@/lib/spotify";

export interface IconicPressingItem {
  id: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
  spotifyId: string;
}

export interface RecentSpinItem {
  id: string;
  userName: string;
  action: string;
  content: string;
  rating: number;
  likes: number;
  comments: number;
  avatarUrl: string | null;
  initials: string;
  albumName: string;
  albumArtist: string;
  albumImageUrl: string | null;
  albumReleaseYear: number | null;
}

function toFiveStarRating(rating10: number | null): number {
  if (rating10 === null) {
    return 0;
  }

  const normalized = Math.max(0, Math.min(10, rating10));
  return Math.round(normalized / 2);
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const initials = parts.map((part) => part[0]).join("");
  return initials.slice(0, 2).toUpperCase();
}

function getReleaseYear(
  releaseDate: string | undefined,
  fallback: number | null,
): number | null {
  if (releaseDate && releaseDate.length >= 4) {
    const parsed = Number(releaseDate.slice(0, 4));
    return Number.isNaN(parsed) ? (fallback ?? null) : parsed;
  }

  return fallback ?? null;
}

export async function getIconicPressings(): Promise<IconicPressingItem[]> {
  const rows = await queryIconicPressings(4);

  const items = await Promise.all(
    rows.map(async (row) => {
      const spotify = await getSpotifyAlbum(row.spotifyId);
      const artist = spotify?.artists?.[0]?.name ?? "Unknown Artist";
      const imageUrl = spotify?.images?.[0]?.url ?? null;

      return {
        id: row.id,
        name: spotify?.name ?? row.name,
        artist,
        imageUrl,
        rating: toFiveStarRating(row.avgRating10),
        reviewCount: row.reviewCount,
        spotifyId: row.spotifyId,
      };
    }),
  );

  return items;
}

export async function getRecentSpins(limit = 2): Promise<RecentSpinItem[]> {
  const rows = await getRecentAlbumActivity(limit);

  return Promise.all(
    rows.map(async (row) => {
      const spotify = await getSpotifyAlbum(row.albumSpotifyId);
      const albumName = spotify?.name ?? row.albumName;
      const albumArtist = spotify?.artists?.[0]?.name ?? "Unknown Artist";

      return {
        id: row.id,
        userName: row.userName,
        action: `Reviewed "${albumName}"`,
        content: row.description?.trim()
          ? row.description
          : "Fresh listen added to the feed.",
        rating: toFiveStarRating(row.rating10),
        likes: row.likeCount,
        comments: 0,
        avatarUrl: row.userImage,
        initials: getInitials(row.userName),
        albumName,
        albumArtist,
        albumImageUrl: spotify?.images?.[0]?.url ?? null,
        albumReleaseYear: getReleaseYear(
          spotify?.release_date,
          row.albumReleaseYear,
        ),
      };
    }),
  );
}
