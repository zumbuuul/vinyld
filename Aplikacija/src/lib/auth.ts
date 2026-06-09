import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import {
  account,
  session,
  user,
  userPreferences,
  verification,
} from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  databaseHooks: {
    user: {
      create: {
        async after(createdUser) {
          const [existingPreferences] = await db
            .select({ userId: userPreferences.userId })
            .from(userPreferences)
            .where(eq(userPreferences.userId, createdUser.id))
            .limit(1);

          if (existingPreferences) {
            return;
          }

          await db.insert(userPreferences).values({
            userId: createdUser.id,
            role: "user",
          });
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
