import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { ChatSchema } from "../schemas/chat.schema.js";
import { CallModel } from "../services/gateway.service.js";
import { rateLimitMiddleware } from "../middleware/ratelimit.js";
import { authMiddleware } from "../middleware/auth.js";
import { Request,Response } from "express";
const chatrouter = Router();

chatrouter.post("/chat", [authMiddleware, rateLimitMiddleware,validate(ChatSchema)], async(req:Request, res:Response)=>{
  const data=await CallModel(req.body,req.apiKeyId);
  req.logger.info({
    cache_hit:data.cached,
    apiKeyId: req.apiKeyId,
  },"Chat Request Completed");
  res.setHeader("X-Cache",data.cached?"HIT":"MISS");
  return res.json({
    success:true,
    result: data.response,
  });
});

export default chatrouter;