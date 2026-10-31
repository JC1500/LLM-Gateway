import { NextFunction,Response,Request } from "express";
import { verifyKey } from "../services/apiKey.service.js"

export async function authMiddleware(req:Request,res:Response,next:NextFunction){
    const header=req.headers.authorization;
    if(!header){
        return res.status(401).json({
            success:false,
            message:"API KEY is required",
        })
    }
    const [scheme,key,...extra]=header.trim().split(' ');

    if(!scheme || scheme.toLowerCase()!='bearer' ||!key ||extra.length > 0){
        
        return res.status(401).json({
            success:false,
            message:"API KEY is Worng! Please Check the Api Key",
        })
    }
    const result=await verifyKey(key);
    if (!result){
        return res.status(401).json({
            success:false,
            message:"API KEY is either wrong or revoked",
        })
    }
    req.log = req.log.child({ apiKeyId: result.id });
    next();
}