import { db } from "../db/client.js";
import { sql } from "drizzle-orm";
async function pingDatabase() {
  try {
    console.log("Checking database connection...");
    const result = await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected successfully!");
    console.log("Response:", result);
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(error);
    process.exitCode = 1;
  }
}

pingDatabase();