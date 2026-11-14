import { env } from "../config/env.schema.js";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max:10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 20_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

export const db = drizzle(pool);
