import cors from "cors";
import express from "express";
import { prismaClient } from "db/client";
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("API_KEY is not defined");
}

app.post("/prompt", async (req, res) => {
  const { prompt, projectId } = req.body;
  const client = new Anthropic();
  
  await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId,
      type: "USER",
    },
  });

  const allPrompts = await prismaClient.prompt.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const artifactProcessor = new ArtifactProcessor("", (filePath, fileContent) => onFileUpdate(filePath, fileContent, projectId), (shellCommand) => onShellCommand(shellCommand, projectId));
  let artifact = "";

  const response = client.messages.stream({
    messages: allPrompts.map((p: any) => ({
      role: p.type === "USER" ? "user" : "assistant",
      content: p.content,
    })),
    system: systemPrompt,
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 8000,
  }).on('text', (text) => {
    artifactProcessor.append(text);
    artifactProcessor.parse();
    artifact += text;
  })
  .on('finalMessage', async (message) => {
    console.log("done!");
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
  })
  .on('error', (error) => {
    console.log("error", error);
  });

  res.json({ response });
});

app.listen(9091, () => {
  console.log("Server is running on port 9091");
});
