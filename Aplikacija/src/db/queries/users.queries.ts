import { desc, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { user, userPreferences } from "@/db/schema";

export type UserPreferencesRecord = {
  userId: string;
  role: "user" | "critic" | "artist" | "admin";
  profilePictureUrl: string | null;
};

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferencesRecord | null> {
  const [row] = await db
    .select({
      userId: userPreferences.userId,
      role: userPreferences.role,
      profilePictureUrl: userPreferences.profilePictureUrl,
      preferenceId: userPreferences.preferenceId,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .orderBy(desc(userPreferences.preferenceId))
    .limit(1);

  if (!row) {
    return null;
  }

  const roleValue = String(row.role);
  const resolvedRole =
    roleValue === "critic" ||
    roleValue === "artist" ||
    roleValue === "admin"
      ? roleValue
      : "user";

  return {
    userId: String(row.userId),
    role: resolvedRole,
    profilePictureUrl: row.profilePictureUrl
      ? String(row.profilePictureUrl)
      : null,
  };
}

export async function getUserById(
  userId: string,
): Promise<{ id: string; name: string } | null> {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: String(row.name),
  };
}
