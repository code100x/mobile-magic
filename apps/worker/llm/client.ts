export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface StreamEvents {
  onText: (callback: (text: string) => void) => void;
  onComplete: (callback: () => void) => void;
  onError: (callback: (error: Error) => void) => void;
}

export interface LLMClient {
  streamChat: (params: {
    messages: Message[];
    system?: string;
    maxTokens: number;
  }) => Promise<StreamEvents>;
}