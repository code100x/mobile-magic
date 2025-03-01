import Anthropic from "@anthropic-ai/sdk";
import type { LLMClient, Message, StreamEvents } from "./client";

export class AnthropicClient implements LLMClient {
  private client: Anthropic;

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
  }) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async streamChat(params: {
    messages: Message[];
    system?: string;
    maxTokens: number;
  }): Promise<StreamEvents> {
    const stream = this.client.messages.stream({
      messages: params.messages,
      system: params.system,
      model: process.env.MODEL || "claude-3-opus-20240229",
      max_tokens: params.maxTokens,
    });

    return {
      onText: (callback) => {
        stream.on("text", callback);
      },
      onComplete: (callback) => {
        stream.on("end", callback);
      },
      onError: (callback) => {
        stream.on("error", callback);
      }
    };
  }
}