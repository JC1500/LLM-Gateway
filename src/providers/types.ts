import type {Chats} from "../schemas/chat.schema.js";

export class ChatResponse{
    id:string;
    message:string;
    model:string;
    token_usage:number;
    cost:number;
    constructor(id:string,mess:string,model:string,tokens_usage:number,cost:number=0){
        this.id=id;
        this.message=mess;
        this.model=model;
        this.token_usage=tokens_usage;
        this.cost=cost;
    }
}

export interface LLMProvider {
    chat(request: Chats,model:string): Promise<ChatResponse>;
}