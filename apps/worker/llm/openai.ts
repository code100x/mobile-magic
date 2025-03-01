import OpenAI from "openai";
import type { LLMClient, Message, StreamEvents } from "./client";

export class OpenAIClient implements LLMClient {
  private client: OpenAI;

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
  }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async streamChat(params: {
    messages: Message[];
    system?: string;
    maxTokens: number;
  }): Promise<StreamEvents> {
    const stream = await this.client.chat.completions.create({
      messages: [
        { role: "system", content: params.system || "" },
        ...params.messages,
      ],
      model: process.env.MODEL || "gpt-4",
      max_tokens: params.maxTokens,
      stream: true,
    });

    return {
      onText: async(callback) => {
        for await (const chunk of stream) {
          callback(chunk.choices[0]?.delta?.content || "");
        }
      },
      onComplete: (callback) => {
        stream.controller.signal.addEventListener("abort", callback);
      },
      onError: (callback) => {
        stream.controller.signal.addEventListener("abort", () => 
          callback(new Error("Stream aborted")));
      }
    };
  }
}