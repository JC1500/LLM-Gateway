import {providerRegistry} from '../providers/registry';
import { LLMProvider } from '../providers/types';
import { Chats } from '../schemas/chat.schema';


export async function Call_model(request:Chats){
    const provider: LLMProvider=providerRegistry[request.providers as keyof typeof providerRegistry];
    return await provider.chat(request);
}