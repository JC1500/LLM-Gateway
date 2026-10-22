import { z } from "zod";

export const MessageSchema = z.object({
    role: z.enum(["user", "assistant", "ai", "system"]),
    content: z.string().min(1),
});

export const ChatSchema = z.object({
    messages: z.array(MessageSchema).min(1),
    model: z.string().min(1),
    temperature: z.number().min(0.0).max(1.0).default(0),
    maxTokens: z.number().int().positive().optional(),
    maxtokens: z.number().int().positive().optional()
})

export type Chats = z.infer<typeof ChatSchema>;
export type Messages = z.infer<typeof MessageSchema>;