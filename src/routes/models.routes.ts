import { Router } from "express";
import { getModels } from "../services/catalog.service.js";
import { authMiddleware } from "../middleware/auth.js";
import { rateLimitMiddleware } from "../middleware/ratelimit.js";


const modelsrouter=Router();
modelsrouter.use(authMiddleware);
modelsrouter.use(rateLimitMiddleware);
modelsrouter.get('/models', async (req,res)=>{
    const models=await getModels();
    return res.status(200).json({
        success:true,
        models:models,
    })
})

export default modelsrouter;

