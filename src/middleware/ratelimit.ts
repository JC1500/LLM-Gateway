import {Request,Response,NextFunction} from 'express';
import { redis } from '../cache/redis.js';
import { logger } from '../lib/logger.js';
import { db } from '../db/client.js';
import { requests } from '../db/schema.js';
import { env } from '../config/env.schema.js';

const rateLimitScript = `
  local current = redis.call("INCR", KEYS[1])

  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  local ttl = redis.call("TTL", KEYS[1])

  return {current, ttl}
`;

export async function rateLimitMiddleware(req:Request,res:Response,next:NextFunction){
    const apiKeyId=req.apiKeyId;
    const limit=req.rateLimit;
    if (!apiKeyId || limit===undefined || limit===null) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }

    const now=Date.now();
    const window=Math.floor(now/60000);
    const ttl=Math.max(1,Math.ceil((60000-(now%60000))/1000));
    const key=`rl:${apiKeyId}:${window}`
    try{
        const result=await redis.eval(rateLimitScript,1,key,ttl) as [number,number];
        const currentCount = Number(result[0]);
        const retryAfter=Math.max(1,Number(result[1]));
        
        const rem=Math.max(0,limit-currentCount);
        res.setHeader('X-RateLimit-Limit',limit);
        res.setHeader('X-RateLimit-Remaining',rem);

        if(currentCount>limit){
            res.setHeader("Retry-After", retryAfter);
        
        try{
            await db.insert(requests).values({
            apiKeyId,
            modelId: null,
            provider: null,
            latencyMs: 0,
            status: "rate_limited",
            errorType: "rate_limit_exceeded",
            });
        }catch (error){
            req.logger.error(
            { err: error },
            "Failed to log rate-limited request"
            );
        }
        req.logger.info("Rate Limit Reached")
        return res.status(429).json({
            success:false,
            error:{
                message:"Rate Limit Reached",
            },
        })

    }
    }catch(error){
        req.logger.warn({error:error},
      "Redis unavailable. Skipping rate limiting.");
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", "unknown");
    }
    next();
}