import { z } from "zod";

export const albumReviewInputSchema = z.object({
  albumId: z.string().min(1),
  albumSpotifyId: z.string().length(22),
  rating10: z.number().int().min(1).max(10),
  liked: z.boolean(),
  description: z.string().max(4000),
});

export const criticAlbumReviewInputSchema = z.object({
  albumId: z.string().min(1),
  albumSpotifyId: z.string().length(22),
  title: z.string().trim().min(1, "Naslov je obavezan").max(128),
  rating10: z.number().int().min(1).max(10),
  critiqueText: z
    .string()
    .trim()
    .min(1, "Tekst kritike je obavezan")
    .max(10000),
  conclusion: z.string().trim().max(255),
});

export type AlbumReviewInput = z.infer<typeof albumReviewInputSchema>;
export type CriticAlbumReviewInput = z.infer<typeof criticAlbumReviewInputSchema>;
