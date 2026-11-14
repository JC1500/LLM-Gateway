import type {Chats} from "../schemas/chat.schema.js";
import { ChatResponse } from "../schemas/chat.schema.js";


export interface LLMProvider {
    chat(request: Chats,model:string): Promise<ChatResponse>;
}