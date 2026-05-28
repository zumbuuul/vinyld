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

  return rows.map((row) => ({
    id: row.id,
    userName: row.userName,
    action: `Reviewed "${row.albumName}"`,
    content: row.description?.trim()
      ? row.description
      : "Fresh listen added to the feed.",
    rating: toFiveStarRating(row.rating10),
    likes: row.likeCount,
    comments: 0,
    avatarUrl: row.userImage,
    initials: getInitials(row.userName),
  }));
}
