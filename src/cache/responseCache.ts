import crypto from 'crypto';
import { redis } from "../cache/redis.js";
import { logger } from '../lib/logger.js';
import {ChatResponse} from '../schemas/chat.schema.js';


const CACHE_TTL = 3600;

export type CacheSchema={
    model:string,
    apiKeyId:string,
    messages:{
        role: string;
        content: string;
    }[],
    max_tokens?:number,
    temperature?:number,
    provider:string,
  }
  
function canonicalize(value:any):any{
    if (Array.isArray(value)){
        return value.map(canonicalize);
    }
    if (value!==null && typeof value==='object'){
        return Object.keys(value).sort().reduce((result:any,key)=>{
            result[key]=canonicalize(value[key]);
            return result;
        },{});
    }
    return value;
}
export function generateCacheKey(req:CacheSchema){
  const canonicalJSON=JSON.stringify(canonicalize({
        apikeyId:req.apiKeyId,
        model:req.model,
        messages:req.messages,
        max_tokens:req.max_tokens,
        temperature:req.temperature??0,
    }));;
  const key=crypto.createHash('sha256').update(canonicalJSON).digest('hex');
  return key;
}


export async function setCachedResponse(req:CacheSchema,resp:ChatResponse){
  const temp=req.temperature??0;
  if(temp!==0)return;
  const key=generateCacheKey(req);
  try {
    await redis.set(`chatCache:${req.apiKeyId}:${key}`,JSON.stringify(resp),"EX",CACHE_TTL);
  }catch(error){
    logger.error({error:`Cache Write Error ${(error instanceof Error)?error.message:String(error)}`});
  }
}


export async function getCachedResponse(req:CacheSchema,apiKeyId:string) {
  try {
    const key=generateCacheKey(req);
    const cached=await redis.get(`chatCache:${apiKeyId}:${key}`);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached);
  }catch(error){
    logger.error({error:`Failed Cache Read: ${(error instanceof Error)?error.message:String(error)}`});
    return null;
  }

}