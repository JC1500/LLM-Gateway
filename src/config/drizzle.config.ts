import { env } from "./env.schema.js";
import { defineConfig } from "drizzle-kit";


export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
