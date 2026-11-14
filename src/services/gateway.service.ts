import { providerRegistry } from "../providers/registry.js";
import type { LLMProvider } from "../providers/types.js";
import type { Chats } from "../schemas/chat.schema.js";
import { resolveModel } from "../router/router.js";
import { AppError } from "../lib/errors.js";
import { setCachedResponse, getCachedResponse } from "../cache/responseCache.js";

export async function CallModel(request: Chats,apiKeyID:string) {
  const routingTarget = await resolveModel(request);
  const provider:LLMProvider=providerRegistry[routingTarget.provider as keyof typeof providerRegistry];
  if (!provider) {
    throw new AppError(`Provider not found: ${routingTarget.provider}`,404);
  }
  const data= await getCachedResponse({
      model:request.model,
      apiKeyId:apiKeyID,
      temperature:request.temperature,
      max_tokens:request.maxTokens,
      messages:request.messages,
      provider:routingTarget.provider,
    },
    apiKeyID);
  if(data) return {
    response:data,
    cached:true,
  };
  const resp= await provider.chat(request, routingTarget.upstreamModel);
  if(resp){
    await setCachedResponse({
      model:request.model,
      apiKeyId:apiKeyID,
      temperature:request.temperature,
      max_tokens:request.maxTokens,
      messages:request.messages,
      provider:routingTarget.provider,
    },
      resp);
  }
  return {
    response:resp,
    cached:false,
  };
}
