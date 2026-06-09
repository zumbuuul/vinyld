import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const url = process.env.DB_URL;

if (!url) {
  throw new Error("DB_URL is not defined");
}

const pool = new Pool({
  connectionString: url,
});

const db = drizzle({
  client: pool,
  logger: process.env.NODE_ENV === "development",
});

export { db };
