import { createHash } from "node:crypto";
import { apiKeys } from "../db/schema.js";
import { db } from "../db/client.js";
import { eq } from "drizzle-orm";
 function generateKey(){
    const randm=crypto.randomUUID().replace(/-/g, '');
    const key='gw_live_'+randm;
    const keyhash=createHash('sha256').update(key).digest('hex');
    return {key,keyhash};
}

export async function createKey(name:string){
    const {key,keyhash}=generateKey();
    await db.insert(apiKeys).values({
        name:name,
        keyHash:keyhash,
        keyPrefix:key.substring(1,10),
    })
    return key;
}

export async function verifyKey(key:string) {
    if(!key.startsWith('gw_live_')){
        return null;
    }
    const keyhash=createHash('sha256').update(key).digest('hex');
    const result=await db.select().from(apiKeys).where(eq(apiKeys.keyHash,keyhash));
    if(!result || result[0].revokedAt){
        return null;
    }
    return {
        id:result[0].id,
        allowedModels:result[0].allowedModels,
    }
}