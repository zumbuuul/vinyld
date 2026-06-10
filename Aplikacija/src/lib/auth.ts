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

const authBaseUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  undefined;

export const auth = betterAuth({
  ...(authBaseUrl
    ? {
        baseURL: authBaseUrl,
      }
    : {}),
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://*.vercel.app",
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
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
