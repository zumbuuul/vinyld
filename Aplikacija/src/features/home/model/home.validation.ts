import type { RawHomeActivity, RawHomeAlbum } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRating10(value: number): number {
  return clamp(Number.isFinite(value) ? value : 0, 0, 10);
}

export function validateRawAlbum(input: RawHomeAlbum): RawHomeAlbum {
  return {
    ...input,
    title: input.title.trim(),
    artist: input.artist.trim(),
    averageRating10: normalizeRating10(input.averageRating10),
  };
}

export function validateRawActivity(input: RawHomeActivity): RawHomeActivity {
  return {
    ...input,
    user: input.user.trim(),
    albumTitle: input.albumTitle.trim(),
    description: input.description.trim(),
    rating10: normalizeRating10(input.rating10),
  };
}
