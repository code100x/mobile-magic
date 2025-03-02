import type { LLMClient } from "./client";
import { OpenAIClient } from "./openai";
import { AnthropicClient } from "./anthropic";

type ProviderConfig = {
  provider: "openai" | "anthropic";
  apiKey: string;
  baseUrl?: string;
  model?: string;
};

export function createLlmClient(config: ProviderConfig): LLMClient {
  switch (config.provider) {
    case "openai":
      return new OpenAIClient(config);
    case "anthropic":
      return new AnthropicClient(config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}