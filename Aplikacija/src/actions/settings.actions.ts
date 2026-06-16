"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getUserProfileRecord,
  updateUserNameRecord,
  updateUserPreferencesRecord,
} from "@/db/queries/users.queries";
import { requireCurrentSession } from "@/lib/session";

const updateProfileInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(64),
  artistBio: z.string().trim().max(1200).optional().nullable(),
  profilePictureUrl: z
    .string()
    .trim()
    .url("Profile picture URL is invalid")
    .max(2048)
    .optional()
    .nullable(),
});

export async function updateOwnProfile(input: {
  name: string;
  artistBio?: string | null;
  profilePictureUrl?: string | null;
}): Promise<{ success: true }> {
  const session = await requireCurrentSession();

  const parsed = updateProfileInputSchema.parse(input);
  const profile = await getUserProfileRecord(session.user.id);

  if (!profile) {
    throw new Error("User not found.");
  }

  await updateUserNameRecord(session.user.id, parsed.name);
  await updateUserPreferencesRecord(session.user.id, {
    artistBio:
      profile.role === "artist" ? (parsed.artistBio?.trim() || null) : null,
    profilePictureUrl: parsed.profilePictureUrl ?? null,
  });

  revalidatePath("/settings");
  revalidatePath(`/user/${session.user.id}`);
  revalidatePath("/");

  return { success: true };
}
