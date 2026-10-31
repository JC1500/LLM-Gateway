import { Router } from "express";
import { getModels } from "../services/catalog.service.js";
import { authMiddleware } from "../middleware/auth.js";


const modelsrouter=Router();

modelsrouter.get('/models',authMiddleware, async (req,res)=>{
    const models=await getModels();
    return res.status(200).json({
        success:true,
        models:models,
    })
})

export default modelsrouter;

