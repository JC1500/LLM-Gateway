import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const envSchema = z.object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
    DATABASE_URL: z.string(),
    OPENROUTER_API_KEY: z.string().default(""),
    HUGGINGFACE_ACCESS_TOKEN: z.string().default(""),
    GEMINI_API_KEY:z.string().default("")
});

export function validateEnv() {
    const res = envSchema.safeParse(process.env);
    if (!res.success) {
        console.error("Invalid ENV Variables...");
        console.error(res.error.issues);
        return envSchema.parse({});
    }
    return res.data;
}

export const env = validateEnv();
