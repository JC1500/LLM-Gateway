import { InferenceClient } from "@huggingface/inference";
import { env } from "../config/env.schema.js";
import {  type LLMProvider } from "./types.js";
import { ChatResponse } from "../schemas/chat.schema.js";
import type { Chats } from "../schemas/chat.schema.js";
import { ProviderError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export class HuggingFaceProvider implements LLMProvider {
  async chat(request: Chats, model: string): Promise<ChatResponse> {
    const client = new InferenceClient(env.HUGGINGFACE_ACCESS_TOKEN);
    const startedAt = performance.now();
    let outcome: "success" | "error" = "error";
    let tokens = 0;
    let cost = 0;

    try {
      const response = await client.chatCompletion(
        {
          model,
          messages: request.messages,
          max_tokens: request.maxTokens ?? 512,
        },
        { signal: AbortSignal.timeout(30_000) },
      );

      const content =
        typeof response?.choices?.[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "";

      if (!content) {
        throw new ProviderError("Hugging Face returned no text content");
      }

      outcome = "success";
      return new ChatResponse(
        String(response.id ?? `${request.model}-${Date.now()}`),
        content,
        model,
        tokens,
        cost,
      );
    } finally {
      logger.info({
        Provider: "Hugging Face",
        Model: request.model,
        Outcome: outcome,
        TokensUsed: tokens,
        cost,
        LatencyMs: Math.round(performance.now() - startedAt),
      });
    }
  }
}