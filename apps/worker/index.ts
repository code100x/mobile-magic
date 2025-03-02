import cors from "cors";
import express from "express";
import { prismaClient } from "db/client";
import { config } from "dotenv";
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";
import type { LLMClient, Message } from "./llm/client";
import { createLlmClient } from "./llm/factory";


config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// Validate environment variables
const validateEnv = () => {
  const provider = process.env.PROVIDER;
  if (!provider) throw new Error("PROVIDER is required in .env");
  
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for OpenAI provider");
  }
  
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for Anthropic provider");
  }
};

validateEnv();

app.post("/prompt", async (req, res) => {
  const { prompt, projectId } = req.body;
  
  await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId,
      type: "USER",
    },
  });

  const allPrompts = await prismaClient.prompt.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const llmClient: LLMClient = createLlmClient({
    provider: process.env.PROVIDER as "openai" | "anthropic",
    apiKey: process.env[`${process.env.PROVIDER?.toUpperCase()}_API_KEY`] as string,
    baseUrl: process.env[`${process.env.PROVIDER?.toUpperCase()}_API_URL`],
    model: process.env.MODEL,
  });

  const messages: Message[] = allPrompts.map((p: any) => ({
    role: p.type === "USER" ? "user" : "assistant",
    content: p.content,
  }));

  let artifact = "";
  let artifactProcessor = new ArtifactProcessor(
    "",
    (filePath, fileContent) => onFileUpdate(filePath, fileContent, projectId),
    (shellCommand) => onShellCommand(shellCommand, projectId)
  );

  try {
    const stream = await llmClient.streamChat({
      messages,
      system: systemPrompt,
      maxTokens: 8000,
    });

    stream.on("text", (text) => {
      artifactProcessor.append(text);
      artifactProcessor.parse();
      artifact += text;
    });

    stream.on("complete", async () => {
      await prismaClient.prompt.create({
        data: {
          content: artifact,
          projectId,
          type: "SYSTEM",
        },
      });

      await prismaClient.action.create({
        data: {
          content: "Done!",
          projectId,
        },
      });
    });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
    });

    res.json({ response: stream });

  } catch (error) {
    console.error("Error creating chat stream:", error);
    res.status(500).json({ error: "Failed to create chat stream" });
  }
});

app.listen(9091, () => {
  console.log("Server is running on port 9091");
});