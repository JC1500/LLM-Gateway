import { OpenRouterProvider } from "./openrouter.provider.js";
import { GeminiProvider } from "./gemini.provider.js";

export const providerRegistry = {
  OpenRouter: new OpenRouterProvider(),
  Gemini: new GeminiProvider(),
  // hugging-face:,
  // anthropic:,
};