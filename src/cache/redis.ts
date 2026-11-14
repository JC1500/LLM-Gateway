import { Redis } from 'ioredis';
import {env} from '../config/env.schema.js';


export const redis= new Redis(env.REDIS_URL,{
    connectTimeout:10000,
    enableOfflineQueue:false, // Don't keep commands queued while Redis is unavailable
    maxRetriesPerRequest:1,
    retryStrategy(times:number){
        const delay=Math.min(times*500,5000);
        return delay;
    },
});

redis.on("connect",()=>{
    console.log("Redis Connected");
});

redis.on("ready",()=>{
    console.log("Redis ready");
});

redis.on("error", (error) => {
  console.warn("Redis connection error:", error);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});

redis.on("reconnecting",(delay: number)=>{
    console.log(`Redis reconnecting in ${delay}ms`);

})