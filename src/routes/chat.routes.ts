
import { Router } from "express";
import { validate } from "../middleware/validate";
import { ChatSchema, Chats } from "../schemas/chat.schema";
import { Call_model } from "../services/gateway.service";

const chatrouter=Router();

chatrouter.post(
  "/chat",
  validate(ChatSchema),
  async (req, res) => {
    const data=await Call_model(req.body);
    res.json({
      result:data
    });
  }
);


export default chatrouter;