
import {
  pgTable,
  text,
  integer,
  bigint,
  boolean,
  uuid,
  timestamp,
  jsonb,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export type PricingTier = {
  min_prompt_tokens: number;
  price_input?: number;
  price_output?: number;
  price_cache_read?: number;
};

// Model catalog and pricing
export const models = pgTable(
  "models",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    upstreamModel: text("upstream_model").notNull(),
    contextLength: integer("context_length").notNull(),
    maxOutputTokens: integer("max_output_tokens").notNull(),
    inputModalities: text("input_modalities")
      .array()
      .notNull()
      .default(sql`ARRAY['text']::text[]`),

    supportedParameters: text("supported_parameters")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    priceInput: bigint("price_input", { mode: "bigint" })
      .notNull()
      .default(sql`0`),

    priceOutput: bigint("price_output", { mode: "bigint" })
      .notNull()
      .default(sql`0`),

    priceCacheRead: bigint("price_cache_read", { mode: "bigint" })
      .notNull()
      .default(sql`0`),

    pricingTiers: jsonb("pricing_tiers")
      .$type<PricingTier[]>()
      .notNull()
      .default([]),

    enabled: boolean("enabled").notNull().default(false),

    lastSyncedAt: timestamp("last_synced_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("models_provider_idx").on(table.provider),
  ],
);

// API key metadata and permissions
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    keyPrefix: text("key_prefix").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
    allowedModels: text("allowed_models").array(),
  },
  (table) => [
    index("api_keys_created_at_idx").on(table.createdAt),
  ],
);

// Request usage, cost, latency, and errors
export const requests = pgTable(
  "requests",
  {
    requestId: uuid("request_id")
      .primaryKey()
      .defaultRandom(),

    apiKeyId: uuid("api_key_id").notNull(),
    modelId: text("model_id").notNull(),

    provider: text("provider").notNull(),

    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),

    costMicroUSD: bigint("cost_micro_usd", {
      mode: "bigint",
    })
      .notNull()
      .default(sql`0`),

    latencyMs: integer("latency_ms").notNull(),
    status: text("status").notNull(),
    errorType: text("error_type"),

    cacheHit: boolean("cache_hit").notNull().default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.apiKeyId],
      foreignColumns: [apiKeys.id],
      name: "requests_api_key_id_fk",
    }).onDelete("restrict"),

    foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "requests_model_id_fk",
    }).onDelete("restrict"),

    index("requests_api_key_created_at_idx").on(
      table.apiKeyId,
      table.createdAt,
    ),
  ],
);
