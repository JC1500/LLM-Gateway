import { NextFunction,Response,Request } from "express";
import { verifyKey } from "../services/apiKey.service.js"

export async function authMiddleware(req:Request,res:Response,next:NextFunction){
    const header=req.headers.authorization;
    if(!header){
        req.logger.info("API key not found.")
        return res.status(401).json({
            success:false,
            message:"API KEY is required",
        })
    }
    const [scheme,key,...extra]=header.trim().split(' ');

    if(!scheme || scheme.toLowerCase()!='bearer' ||!key ||extra.length > 0){
        
        req.logger.info("API KEY is Worng.")
        return res.status(401).json({
            success:false,
            message:"API KEY is Worng! Please Check the Api Key",
        })
    }
    const result=await verifyKey(key);
    if (!result){
        req.logger.info("API key is either wrong or revoked.")
        return res.status(401).json({
            success:false,
            message:"API KEY is either wrong or revoked",
        })
    }
    req.logger = req.logger.child({ apiKeyId: result.id });
    req.apiKeyId=result.id;
    req.rateLimit=result.rateLimit;
    next();
}