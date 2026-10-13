import {z} from 'zod';


export const MessageSchema=z.object({
    role:z.enum(["user","ai","system"]),
    content:z.string().min(1)
})

export const Messages=z.object({
    messages:z.array(MessageSchema).min(1),
    model:z.string(),
    temperature:z.float32().min(0.0).max(1.0).default(0.0),
    maxtokens:z.number().optional()
})

