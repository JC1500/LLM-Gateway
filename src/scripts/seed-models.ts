import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { db } from "../db/client.js";
import { models } from "../db/schema.js";

type OpenRouterModel = {
  id: string;
  context_length?: number;
  architecture?: {
    input_modalities?: string[];
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
  supported_parameters?: string[];
  pricing?: {
    prompt?: string;
    completion?: string;
    input_cache_read?: string;
  };
};

const ALLOWLIST = [
  {
    publicId: "openrouter/minimax-m3.1-flash:free",
    upstreamModel: "minimax/minimax-m3.1-flash:free",
    provider: "OpenRouter",
  },
  {
    publicId: "openrouter/recursive/flint-v1.0:free",
    upstreamModel: "recursive/flint-v1.0:free",
    provider: "OpenRouter",
  },
  {
    publicId: "openrouter/xing4.0-29b-a4b:free",
    upstreamModel: "xingchen-agi/xing4.0-29b-a4b:free",
    provider: "OpenRouter",
  },
];

function toMicroDollarsPerMillion(price: string): bigint {
  // Exact decimal arithmetic: price * 10^12.
  if (!/^\d+(\.\d+)?$/.test(price)) {
    throw new Error(`Invalid or unsupported price: ${price}`);
  }

  const [whole, fraction = ""] = price.split(".");
  const digits = `${whole}${fraction}`.replace(/^0+(?=\d)/, "");
  const numerator = BigInt(digits || "0") * 1_000_000_000_000n;
  const denominator = 10n ** BigInt(fraction.length);

  if (numerator % denominator !== 0n) {
    throw new Error(
      `Price has precision below one micro-dollar per million: ${price}`,
    );
  }

  return numerator / denominator;
}

function validPrice(value: unknown): value is string {
  return (
    typeof value === "string" && /^\d+(\.\d+)?$/.test(value) && value !== "-1"
  );
}

function isAlias(id: string): boolean {
  return (
    id.includes(":batch") || id.includes("~latest")
  );
}

async function main() {
  const file = resolve("./data/openrouter-models.json");
  const raw = JSON.parse(await readFile(file, "utf8")) as {
    data: OpenRouterModel[];
  };

  if (!Array.isArray(raw.data)) {
    throw new Error("Invalid OpenRouter payload: expected data array");
  }
  // console.log(raw.data[0])
  const sourceById = new Map(raw.data.map((model) => [model.id, model]));

  for (const item of ALLOWLIST) {
    const source = sourceById.get(item.upstreamModel);

    if (!source || isAlias(source.id)) {
      console.warn(
        `Model missing or excluded from payload: ${item.upstreamModel}`,
      );
      continue;
    }

    const prompt = source.pricing?.prompt;
    const completion = source.pricing?.completion;
    const cacheRead = source.pricing?.input_cache_read ?? "0";

    if (
      !validPrice(prompt) ||
      !validPrice(completion) ||
      !validPrice(cacheRead)
    ) {
      console.warn(`Skipping model with unsupported pricing: ${source.id}`);
      continue;
    }

    if (!source.context_length || !source.top_provider?.max_completion_tokens) {
      console.warn(`Skipping model with incomplete limits: ${source.id}`);
      continue;
    }

    await db
      .insert(models)
      .values({
        id: item.publicId,
        provider: item.provider,
        upstreamModel: item.upstreamModel,
        contextLength: source.context_length,
        maxOutputTokens: source.top_provider.max_completion_tokens,
        inputModalities: source.architecture?.input_modalities ?? ["text"],
        supportedParameters: source.supported_parameters ?? [],
        priceInput: toMicroDollarsPerMillion(prompt),
        priceOutput: toMicroDollarsPerMillion(completion),
        priceCacheRead: toMicroDollarsPerMillion(cacheRead),
        pricingTiers: [],
        enabled: true,
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: models.id,
        set: {
          provider: item.provider,
          upstreamModel: item.upstreamModel,
          contextLength: source.context_length,
          maxOutputTokens: source.top_provider.max_completion_tokens,
          inputModalities: source.architecture?.input_modalities ?? ["text"],
          supportedParameters: source.supported_parameters ?? [],
          priceInput: toMicroDollarsPerMillion(prompt),
          priceOutput: toMicroDollarsPerMillion(completion),
          priceCacheRead: toMicroDollarsPerMillion(cacheRead),
          lastSyncedAt: new Date(),
        },
      });

    console.log(`Seeded ${item.publicId}`);
  }
}

main().catch((error) => {
  console.error("Model seeding failed:", error);
  process.exitCode = 1;
});
