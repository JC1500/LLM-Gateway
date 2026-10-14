import {Request,Response,NextFunction} from "express";
import {AppError} from "../lib/errors.js";

export function errorhandler(err:Error,req:Request,res:Response,next:NextFunction){
    req.logger.error(err.message);
    if(err instanceof AppError){
        return res.status(err.statuscode).json({
            success:false,
            requestID:req.requestId,
            error:{
                message:err.message
            },
        })
    }
    return res.status(500).json({
        success:false,
        requestID:req.requestId,
        error:{
            message:"Internal Server Error"
        }
    });
}