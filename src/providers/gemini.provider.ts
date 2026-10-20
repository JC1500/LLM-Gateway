import { ApiError, GoogleGenAI } from "@google/genai";
import { env } from "../config/env.schema.js";
import { AuthError, BadRequestError, ProviderError, RateLimitError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { Chats } from "../schemas/chat.schema.js";
import { ChatResponse, LLMProvider } from "./types.js";
import { z, ZodInstanceOf } from "zod";

const GeminiSuccessSchema = z.object({
  responseId: z.string().min(1),
  modelVersion: z.string().optional(),
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(z.object({ text: z.string().optional() })).optional(),
      }).optional(),
    }),
  ).min(1),
  usageMetadata: z.object({
    totalTokenCount: z.number().optional(),
  }).optional(),
});

export class GeminiProvider implements LLMProvider {
  async chat(request: Chats): Promise<ChatResponse> {
    const startedAt = performance.now();
    let outcome: "success" | "error" = "error";
    let tokens = 0;
    const cost = 0;

    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const abortSignal = AbortSignal.timeout(90_000);
      const systemMessages = request.messages
        .filter((message) => message.role === "system")
        .map((message) => message.content);
      const contents = request.messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role === "user" ? "user" as const : "model" as const,
          parts: [{ text: message.content }],
        }));

      if (contents.length === 0) {
        throw new BadRequestError("At least one user or assistant message is required");
      }

      const config: {
        abortSignal: AbortSignal;
        temperature: number;
        maxOutputTokens?: number;
        systemInstruction?: string;
      } = {
        abortSignal,
        temperature: request.temperature,
      };
      const maxTokens = request.maxTokens ?? request.maxtokens;
      if (maxTokens !== undefined) config.maxOutputTokens = maxTokens;
      if (systemMessages.length > 0) config.systemInstruction = systemMessages.join("\n\n");

      let response;
      try {
        response = await ai.models.generateContent({
          model: request.model,
          contents,
          config,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 400) throw new BadRequestError(error.message, 400);
          if (error.status === 401 || error.status === 403) {
            throw new AuthError("Check the Gemini API key", error.status);
          }
          if (error.status===429) throw new RateLimitError();
          if (error.status===404) throw new BadRequestError("Model not found");
          throw new ProviderError(error.message);
        }
        if (abortSignal.aborted) {
          throw new ProviderError("Provider took too much time to respond");
        }
        throw new ProviderError(error.message);
      }

      const parsed = GeminiSuccessSchema.safeParse(response);
      if (!parsed.success) {
        throw new ProviderError("Can't parse the data that the provider returned");
      }

      const data = parsed.data;
      const content = data.candidates[0].content?.parts?.[0]?.text ?? "";
      if (!content) throw new ProviderError("Gemini returned no text content");

      tokens = data.usageMetadata?.totalTokenCount??0;
      const result = new ChatResponse(
        data.responseId,
        content,
        data.modelVersion ?? request.model,
        tokens,
      );
      outcome = "success";
      return result;
    } finally {
      logger.info({
        Provider: "Gemini",
        Model: request.model,
        Outcome: outcome,
        TokensUsed: tokens,
        cost,
        LatencyMs: Math.round(performance.now() - startedAt),
      });
    }
  }
}
