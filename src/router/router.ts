import { CatalogModel,getModelById } from "../services/catalog.service.js";
import type { Chats } from "../schemas/chat.schema.js";
import { ModelNotFoundError } from "../lib/errors.js";
export type RoutingTarget = {
  publicModel: string;
  provider: string;
  upstreamModel: string;
};

export async function resolveModel(
  request: Chats,
  catalog: readonly CatalogModel[],
): Promise<RoutingTarget> {
  const model=await getModelById(request.model);
  if(!model) throw new ModelNotFoundError(request.model);
  return {
    publicModel: model.id,
    provider: model.provider,
    upstreamModel: model.upstreamModel,
  };
}
