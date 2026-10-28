import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { ChatSchema } from "../schemas/chat.schema.js";
import { CallModel } from "../services/gateway.service.js";

const chatrouter = Router();

const handleChat=async (req: any, res: any) => {
  const data=await CallModel(req.body);
  return res.json({
    success:true,
    result: data,
  });
};

chatrouter.post("/chat", validate(ChatSchema), handleChat);

export default chatrouter;