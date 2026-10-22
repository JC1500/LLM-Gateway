import type { CatalogModel } from "../services/catalog.service.js";
import {Chats} from '../schemas/chat.schema';
import { ModelNotFoundError } from "../lib/errors.js";


export type RoutingTarget = {
  publicModel: string;
  provider: string;
  upstreamModel: string;
};

export function resolveModel(
  request: Chats,
  catalog: readonly CatalogModel[],
): RoutingTarget {
  const model = catalog.find(
    (entry) => entry.id === request.model && entry.enabled,
  );
  if (!model) {
    throw new ModelNotFoundError(request.model);
  }

  return {
    publicModel: model.id,
    provider: model.provider,
    upstreamModel: model.upstreamModel,
  };
}
