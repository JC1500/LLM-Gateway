
import { Router } from "express";
import { validate } from "../middleware/validate";
import { ChatSchema, Chats } from "../schemas/chat.schema";
import {OpenRouterProvider} from '../providers/openrouter.provider.js'

const chatrouter=Router();

chatrouter.post(
  "/chat",
  validate(ChatSchema),
  async (req, res) => {
    const openrouter=new OpenRouterProvider();
    const data=await openrouter.chat(req.body);
    res.json({
      result:data
    });
  }
);


export default chatrouter;