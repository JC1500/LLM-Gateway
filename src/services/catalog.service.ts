import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { models } from "../db/schema.js";

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
