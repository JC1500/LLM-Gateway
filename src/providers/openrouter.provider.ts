import {env} from "../config/env.schema.js";
import {ChatResponse,LLMProvider} from "./types.js";
import {Chats} from "../schemas/chat.schema.js";
import { AuthError, BadRequestError, ProviderError, RateLimitError } from "../lib/errors.js";
import {z} from "zod";

const OpenRouterSuccessSchema = z.object({
  id: z.string(),
  model: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable(),
      }),
    })
  ).min(1),
  usage: z.object({
    total_tokens: z.number().optional(),
    cost: z.number().optional(),
  }).optional(),
});
const OpenRouterErrorSchema=z.object({
  error:z.object({
    code:z.number().optional(),
    message:z.string().optional(),
  }).optional(),
});


export class OpenRouterProvider implements LLMProvider{
    async chat(request:Chats):Promise<ChatResponse>{
        let response: Response;
        try {
        response=await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
            method: "POST",
            headers:{
                Authorization:`Bearer ${env.OPENROUTER_API_KEY}`,
                "Content-Type":"application/json",
            },
            body:JSON.stringify({
                model:request.model,
                messages:request.messages,
            }),
            signal:AbortSignal.timeout(30_000), // if request is hanging for more than 30sec abort....
            }
        );
        }catch{
            throw new ProviderError("Provider took too much time to respond");
        }
        let raw:unknown;
        try{
            raw=await response.json();
        }catch{
            throw new ProviderError("Can't parse the received data from the provider....");
        }
        if (!response.ok) {
            const parsedError=OpenRouterErrorSchema.safeParse(raw);
            const errorData=parsedError.success?parsedError.data.error:undefined;
            const code=response.status;
            const message =errorData?.message??"OpenRouter request failed";
            if (code===400)throw new BadRequestError(message,400);
            if (code===401)throw new AuthError("Check the OpenRouter API key",401);
            if (code===429)throw new RateLimitError();
            throw new ProviderError();
        }
        const parsed=OpenRouterSuccessSchema.safeParse(raw);
        if (!parsed.success){
        //Log details some
        throw new ProviderError("Can't parse the data that the provider returned");
        }
        const data=parsed.data;
        const content=data.choices[0].message.content;
        if (content===null)throw new ProviderError();
        const res = new ChatResponse(data.id,content,data.model,data.usage?.total_tokens??0);
        if (typeof data.usage?.cost==="number") res.cost = data.usage.cost;
        return res;
    }
}
