import { Messages } from "../schemas/chat.chema";


export class ChatResponse{
    id:string;
    message:string;
    model:string;
    constructor(id:string,mess:string,model:string){
        this.id=id;
        this.message=mess;
        this.model=model;
    }
}

export interface LLMProvider {
    chat(request: Messages): Promise<ChatResponse>;
}