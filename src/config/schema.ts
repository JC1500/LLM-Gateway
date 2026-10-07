import {z} from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const envSchema=z.object({
    PORT:z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string(),
    OPENROUTER_API_KEY:z.string(),
    HUGGINGFACE_ACCESS_TOKEN:z.string()
})

export type Env=z.infer<typeof envSchema>;

export function validateEnv(){
    const res=envSchema.safeParse(process.env);
    if(!res.success){
        console.error("Invalid ENV Variables...");
        console.error(res.error);
        process.exit(1);
    }
    return res.data;
}

export const env=validateEnv()

