import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { models } from "../db/schema.js";
import {z} from 'zod';
import { bigint, } from "drizzle-orm/pg-core";
export type CatalogModel = typeof models.$inferSelect;

const CACHE_TTL_MS = 3600_000;

let cachedModels: CatalogModel[] | null = null;
let cacheExpiresAt = 0;
let refreshPromise: Promise<CatalogModel[]> | null = null;

export async function getCatalog(): Promise<CatalogModel[]> {
  if (cachedModels && Date.now() < cacheExpiresAt) {
    return cachedModels;
  }
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise=db
    .select()
    .from(models)
    .where(eq(models.enabled, true))
    .then((rows) => {
      cachedModels = rows;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return rows;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function getModelById(
  id: string,
): Promise<CatalogModel | undefined> {
  const catalog = await getCatalog();
  return catalog.find((model) => model.id === id);
}

export function invalidateCatalogCache(): void {
  cachedModels = null;
  cacheExpiresAt = 0;
}

const Models=z.object({
  id:z.string(),
  provider:z.string(),
  contextLength:z.number().int(),
  maxOutputTokens:z.number().int(),
  priceInput: z.bigint(),
  priceOutput: z.bigint(),
  priceCacheRead: z.bigint(),
})

export async function getModels() {
  const catalog = await getCatalog();

  return catalog.map((data) => {
    const res = Models.safeParse(data);

    if (!res.success) {
      throw new Error(
        `Invalid model data for ID: ${data.id}`,
      );
    }

    return {
      ...res.data,
      priceInput: res.data.priceInput.toString(),
      priceOutput: res.data.priceOutput.toString(),
      priceCacheRead: res.data.priceCacheRead.toString(),
    };
  });
}