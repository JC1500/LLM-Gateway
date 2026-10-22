import {providerRegistry} from '../providers/registry';
import { LLMProvider } from '../providers/types';
import { Chats } from '../schemas/chat.schema';
import { resolveModel } from '../router/router';
import {getCatalog} from './catalog.service';
import { AppError } from '../lib/errors';

export async function Call_model(request:Chats){
    const catalog=await getCatalog()
    const routingTarget=resolveModel(request,catalog);
    const provider: LLMProvider=providerRegistry[routingTarget.provider as keyof typeof providerRegistry];
    if (!provider) {
        throw new AppError(`Provider not found: ${routingTarget.provider}`,404);
    }
    return await provider.chat(request,routingTarget.upstreamModel);
}