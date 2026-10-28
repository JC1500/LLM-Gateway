import { providerRegistry } from "../providers/registry.js";
import type { LLMProvider } from "../providers/types.js";
import type { Chats } from "../schemas/chat.schema.js";
import { resolveModel } from "../router/router.js";
import { getCatalog } from "./catalog.service.js";
import { AppError } from "../lib/errors.js";

export async function CallModel(request: Chats) {
  const catalog = await getCatalog();
  const routingTarget = await resolveModel(request, catalog);
  const provider:LLMProvider=providerRegistry[routingTarget.provider as keyof typeof providerRegistry];
  if (!provider) {
    throw new AppError(`Provider not found: ${routingTarget.provider}`, 404);
  }
  return await provider.chat(request, routingTarget.upstreamModel);
}
